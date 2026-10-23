import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const document=JSON.parse(fs.readFileSync(path.join(root,'docs/x402-vm3-quote-manifest.json'),'utf8'));
const site=fs.readFileSync(path.join(root,'docs/index.html'),'utf8');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const lookup='https://bazaar.saylorinnovations.com/resources/69272';
const sale='https://vm5-openapi-x402.onrender.com/v1/x402-preflight';

test('one existing original author VM3 service, not bulk owner spam',()=>{
 assert.equal(document.x402Version,2);
 assert.equal(document.resources.length,1);
 assert.equal(document.resources[0].url,sale);
 assert.match(document.name,/VM3/);
});
test('one genuine canonical Base Circle USDC quoted payment path',()=>{
 const r=document.resources[0];
 assert.equal(r.accepts.length,1);
 const a=r.accepts[0];
 assert.equal(a.scheme,'exact');
 assert.equal(a.network,'eip155:8453');
 assert.equal(a.asset.toLowerCase(),'0x833589fcD6edb6e08f4c7c32d4f71b54bda02913'.toLowerCase());
 assert.equal(a.amount,'10000');
 assert.equal(a.payTo.toLowerCase(),'0x6b01efa0705e91a7aca54271510bf9e594717f34');
});
test('no merchant key, real customer identity or transaction in public manifest',()=>{
 const raw=JSON.stringify(document);
 assert.doesNotMatch(raw,/(private_key|seed_phrase|mnemonic|bearer |x-payment|payment-signature|jwt)/i);
 const url=new URL(document.resources[0].url);
 assert.equal(url.username,'');
 assert.equal(url.password,'');
 assert.equal(url.protocol,'https:');
 assert.equal(url.search,'');
});
test('existing front page offers a source-authentic independent public buyer route',()=>{
 assert.ok(site.includes(lookup));
 assert.ok(site.includes('https://vm5-openapi-x402.onrender.com/v1/x402-sample'));
 assert.match(site,/not a verified customer sale/);
 assert.match(site,/No new buyer, payout or net profit is claimed/);
});
test('README is explicit listing is not real money and identifies same beneficial owner',()=>{
 assert.ok(readme.includes(lookup));
 assert.ok(readme.includes('original VM1 MetaMask'));
 assert.ok(readme.includes('not a sale or new USDC income'));
 assert.ok(readme.includes('same human owner'));
});
