import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const dir=path.resolve(import.meta.dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(dir,"docs/x402-vm3-quote-manifest.json"),"utf8"));
const live="https://vm5-openapi-x402.onrender.com";
const circle="0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913";
const oldVm5="0x6b01efA0705E91a7aca54271510bf9e594717f34";
const originalVm1="0x4e3106520E40af30870caFE78da1B1e7110eD98E";

test("Saylor manifest preserves original preflight resource and adds only distinct TapeOut VM1 product",()=>{
 assert.equal(manifest.x402Version,2);
 assert.equal(manifest.resources.length,2);
 const urls=manifest.resources.map(r=>r.url);
 assert.deepEqual(urls,[live+"/v1/x402-preflight",live+"/v1/tapeout-cpu0-diff"]);
 assert.equal(new Set(urls).size,2);
});
test("Two separate genuine existing owner payment addresses, both actual native Base Circle USDC",()=>{
 for(const [r,to] of manifest.resources.map((r,i)=>[r,i===0?oldVm5:originalVm1])){
  assert.equal(r.accepts.length,1);
  const a=r.accepts[0];
  assert.equal(a.scheme,"exact");
  assert.equal(a.network,"eip155:8453");
  assert.equal(a.asset.toLowerCase(),circle.toLowerCase());
  assert.equal(a.amount,"10000");
  assert.equal(a.payTo.toLowerCase(),to.toLowerCase());
 }
});
test("New resource discloses static historical diff scope, no audit, paid convenience not profit",()=>{
 const r=manifest.resources[1];
 assert.match(r.description,/20/);
 assert.match(r.description,/historical/i);
 assert.match(r.description,/not real-time or a security audit/i);
 assert.match(r.description,/0\.01/);
 assert.match(r.description,/public/i);
 assert.equal(manifest.resources[0].url,live+"/v1/x402-preflight");
 const text=JSON.stringify(manifest);
 assert.doesNotMatch(text,/private_key|seed_phrase|bearer_token|guaranteed profit|already paid/i);
});
