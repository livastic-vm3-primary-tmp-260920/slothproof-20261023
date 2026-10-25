#!/usr/bin/env python3
"""Small, unpaid, read-only HTTP 402 price-consistency QA (public first-party GETs).

Never imports wallet keys, signs a transaction, or sends PAYMENT-SIGNATURE.
Only compares the first-party OpenAPI fixed USD price to native Circle Base USDC.
No POST/PUT, authentication headers, retries, concurrency or crawling.
"""
import argparse
import base64
from decimal import Decimal, InvalidOperation
import ipaddress
import json
import re
import socket
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse, unquote
from urllib.request import Request, urlopen

CANONICAL_BASE_USDC = '0x833589fcD6eDb6e08f4c7c32D4f71b54bdA02913'.lower()
NETWORK = 'eip155:8453'
LIMIT = 1_048_576
UA = 'OneCursor-ReadOnly-x402-CompatQA/1.0'


class QAError(Exception):
    pass


def public_https(url):
    """No scheme downgrade, embedded auth, local/private hosts, fragments or query credentials."""
    u = urlparse(url)
    if u.scheme != 'https' or not u.hostname or u.username or u.password or u.fragment:
        raise QAError('Only public HTTPS URLs without embedded auth/fragment are accepted')
    if u.query:
        raise QAError('No URL query parameters accepted in this bounded public probe')
    hostname = u.hostname.lower()
    if hostname in ('localhost',) or hostname.endswith(('.localhost','.local','.internal')):
        raise QAError('Local network host refused')
    try:
        ip = ipaddress.ip_address(hostname)
    except ValueError:
        pass
    else:
        if not ip.is_global:
            raise QAError('Private or special IP refused')
    return u


def get_public(url, allow_402=False, timeout=6):
    """Bounded GET without redirects to other origins; no cookies or authorization."""
    source = public_https(url)
    # Verify resolved addresses as a second fail-closed SSRF check.
    try:
        resolved = socket.getaddrinfo(source.hostname, source.port or 443, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise QAError('DNS failed: '+str(exc)) from exc
    for item in resolved:
        if not ipaddress.ip_address(item[4][0]).is_global:
            raise QAError('DNS resolved to a private/special IP')
    class NoRedirect(__import__('urllib.request',fromlist=['HTTPRedirectHandler']).HTTPRedirectHandler):
        def redirect_request(self,*args,**kwargs):
            raise QAError('Redirects are not followed by this public probe')
    from urllib.request import build_opener
    opener=build_opener(NoRedirect)
    req=Request(url,headers={'User-Agent':UA,'Accept':'application/json'},method='GET')
    try:
        with opener.open(req,timeout=timeout) as r:
            status,headers=r.status,r.headers
            if not allow_402:
                body=r.read(LIMIT+1)
                if len(body)>LIMIT:raise QAError('OpenAPI body too large')
                return status,headers,body
            return status,headers,b''
    except HTTPError as e:
        # Preserve read-only challenge status; never send payment.
        if allow_402 and e.code==402:
            return e.code,e.headers,b''
        raise QAError('Unexpected HTTP '+str(e.code)) from e
    except (URLError,TimeoutError,OSError) as exc:
        raise QAError('Public read failed: '+str(exc)) from exc


def path_match(pattern, concrete):
    pattern=re.escape(pattern)
    pattern=re.sub(r'\\\{[^}]+\\\}',r'[^/]+',pattern)
    return re.fullmatch(pattern,concrete) is not None


def fixed_usd_price(spec, resource_url):
    target=unquote(urlparse(resource_url).path)
    matches=[]
    for path,item in spec.get('paths',{}).items():
        if path_match(path,target) and isinstance(item,dict) and 'get' in item:
            meta=item['get'].get('x-payment-info',{}).get('price',{})
            if meta.get('mode')!='fixed' or meta.get('currency')!='USD':
                raise QAError('Only fixed-USD x-payment-info pricing supported')
            try: amt=Decimal(str(meta['amount']))
            except (KeyError,InvalidOperation) as exc:raise QAError('Invalid declared price') from exc
            if amt<0:raise QAError('Negative declared price')
            matches.append((path,amt))
    if len(matches)!=1:raise QAError('No unique GET route in first-party OpenAPI matches resource path')
    return matches[0]


def parse_challenge(encoded):
    if not encoded or len(encoded)>20000:raise QAError('Missing/oversize PAYMENT-REQUIRED header')
    try:
        blob=base64.b64decode(encoded+'='*(-len(encoded)%4),validate=True)
        doc=json.loads(blob.decode('utf-8'))
    except (ValueError,UnicodeError) as exc:raise QAError('Malformed PAYMENT-REQUIRED base64/json') from exc
    if not isinstance(doc,dict) or doc.get('x402Version')!=2 or not isinstance(doc.get('accepts'),list):
        raise QAError('Expected x402 version 2 with accepts array')
    return doc


def compare_price(spec,challenge,resource_url):
    matched,declared=fixed_usd_price(spec,resource_url)
    if challenge.get('resource',{}).get('url')!=resource_url:
        return {'state':'INCONCLUSIVE_RESOURCE_MISMATCH','route':matched,'documented_usd':str(declared)}
    quotes=challenge.get('accepts',[])
    canonical=[]
    for x in quotes:
        if x.get('network')==NETWORK and str(x.get('asset','')).lower()==CANONICAL_BASE_USDC:
            amt=str(x.get('amount',''))
            if not re.fullmatch(r'\d{1,22}',amt):raise QAError('Invalid Base USDC atomic amount')
            canonical.append(Decimal(amt)/Decimal(1000000))
    if not canonical: return {'state':'INCONCLUSIVE_NO_CANONICAL_BASE_USDC','route':matched,'documented_usd':str(declared)}
    if len(set(canonical))>1: return {'state':'INCONCLUSIVE_CONFLICTING_QUOTES','route':matched,'documented_usd':str(declared)}
    actual=canonical[0]
    return {'state':'MISMATCH' if actual!=declared else 'MATCH','route':matched,'documented_usd':str(declared),'quoted_base_circle_usdc':str(actual),'difference_usdc':str(actual-declared),'ratio':str(actual/declared) if declared>0 else None,'network':NETWORK,'asset':CANONICAL_BASE_USDC}


def verify_live(spec_url,resource_url):
    su=public_https(spec_url);ru=public_https(resource_url)
    if (su.hostname,su.port)!=(ru.hostname,ru.port):raise QAError('Spec and paid GET must share one public origin')
    code,_,body=get_public(spec_url)
    if code!=200:raise QAError('First-party OpenAPI status not 200')
    try:spec=json.loads(body)
    except ValueError as exc:raise QAError('OpenAPI must be valid JSON') from exc
    code,headers,_=get_public(resource_url,allow_402=True)
    if code!=402:return {'state':'INCONCLUSIVE_NO_402','http_status':code,'spec_url':spec_url,'resource_url':resource_url}
    challenge=parse_challenge(headers.get('PAYMENT-REQUIRED'))
    return dict(compare_price(spec,challenge,resource_url),http_status=402,spec_url=spec_url,resource_url=resource_url)


def main():
    pa=argparse.ArgumentParser(description=__doc__)
    pa.add_argument('--spec',required=True,help='public first-party /openapi.json URL')
    pa.add_argument('--resource',required=True,help='exact canonical public GET URL (no query)')
    args=pa.parse_args()
    try:
        result=verify_live(args.spec,args.resource)
        print(json.dumps(result,ensure_ascii=False,indent=2))
        return 0
    except QAError as e:
        print(json.dumps({'state':'INCONCLUSIVE_ERROR','detail':str(e)},ensure_ascii=False),file=sys.stderr)
        return 2

if __name__=='__main__':sys.exit(main())
