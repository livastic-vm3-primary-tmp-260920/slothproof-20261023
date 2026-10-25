import importlib.util, json, base64, unittest
from pathlib import Path
s=importlib.util.spec_from_file_location("qa",Path(__file__).resolve().parents[1]/"tools/x402_public_price_contract_20261025.py")
q=importlib.util.module_from_spec(s);s.loader.exec_module(q)
URL="https://example.com/v1/brief/ZA"
SPEC={"paths":{"/v1/brief/{country}":{"get":{"x-payment-info":{"price":{"mode":"fixed","currency":"USD","amount":"0.050000"}}}}}}
def challenge(amount="50000",url=URL,network="eip155:8453",asset=q.CANONICAL_BASE_USDC):return {"x402Version":2,"resource":{"url":url},"accepts":[{"network":network,"asset":asset,"amount":amount}]}
class Tests(unittest.TestCase):
 def test_match(self):self.assertEqual(q.compare_price(SPEC,challenge(),URL)["state"],"MATCH")
 def test_2x(self):self.assertEqual(q.compare_price(SPEC,challenge("100000"),URL)["ratio"],"2")
 def test_variable_path(self):self.assertEqual(q.fixed_usd_price(SPEC,URL)[0],"/v1/brief/{country}")
 def test_resource_mismatch(self):self.assertEqual(q.compare_price(SPEC,challenge(url="https://example.com/incorrect"),URL)["state"],"INCONCLUSIVE_RESOURCE_MISMATCH")
 def test_asset_mismatch(self):self.assertEqual(q.compare_price(SPEC,challenge(asset="0x"+"0"*40),URL)["state"],"INCONCLUSIVE_NO_CANONICAL_BASE_USDC")
 def test_network_mismatch(self):self.assertEqual(q.compare_price(SPEC,challenge(network="eip155:1"),URL)["state"],"INCONCLUSIVE_NO_CANONICAL_BASE_USDC")
 def test_conflicting_quotes(self):
  z=challenge();z["accepts"].append({**z["accepts"][0],"amount":"60000"})
  self.assertEqual(q.compare_price(SPEC,z,URL)["state"],"INCONCLUSIVE_CONFLICTING_QUOTES")
 def test_invalid_atomic(self):
  with self.assertRaises(q.QAError):q.compare_price(SPEC,challenge(amount="100x"),URL)
 def test_bad_challenge(self):
  for x in ["", "hi!",base64.b64encode(b'{"x402Version":1,"accepts":[]}').decode()]:
   with self.subTest(x=x),self.assertRaises(q.QAError):q.parse_challenge(x)
 def test_challenge_parse(self):
  x=base64.b64encode(json.dumps(challenge()).encode()).decode().rstrip("=")
  self.assertEqual(q.parse_challenge(x)["x402Version"],2)
 def test_invalid_urls(self):
  for url in ["http://example.com/x","https://localhost/x","https://127.0.0.1/x","https://192.168.0.1/x","https://example.com/x?api_key=secret","https://u:pw@example.com/x"]:
   with self.subTest(url=url),self.assertRaises(q.QAError):q.public_https(url)
 def test_invalid_spec_route(self):
  with self.assertRaises(q.QAError):q.fixed_usd_price(SPEC,"https://example.com/different")
if __name__=="__main__":unittest.main()
