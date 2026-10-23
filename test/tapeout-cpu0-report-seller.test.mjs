import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const report=readFileSync(join(root,"docs/tapeout-cpu0-report.html"),"utf8");
const home=readFileSync(join(root,"docs/index.html"),"utf8");
const diff=readFileSync(join(root,"docs/tapeout-cpu0-diff.html"),"utf8");
test("paid one-block seller page links valid free preview, quoted resource and real public index",()=>{
 assert.match(report,/https:\/\/vm5-openapi-x402\.onrender\.com\/v1\/tapeout-cpu0-sample/);
 assert.match(report,/https:\/\/vm5-openapi-x402\.onrender\.com\/v1\/tapeout-cpu0-report/);
 assert.match(report,/https:\/\/api\.x402dash\.com\/v1\/endpoints\?q=tapeout-cpu0-report/);
 assert.match(report,/0\.005/); assert.match(report,/5000/);
 assert.match(report,/eip155:8453/);assert.match(report,/chain ID <code>196/);
 assert.match(report,/0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913/);
 assert.match(report,/0x4e3106520E40af30870caFE78da1B1e7110eD98E/);
});
test("trust disclosure never claims an unearned new sale",()=>{
 assert.match(report,/one-time historical verification purchase/);
 assert.match(report,/recurring customer contract/);
 assert.match(report,/no fresh independent purchase/);
 assert.match(report,/not a security audit/i);
 assert.ok(!report.includes("Guaranteed payout"));
 assert.match(report,/0xd422176855d757082d3b17ad75122bd2a2c2b544f6b08e4b1c382902a365e9fb/);
});
test("buyer navigation from existing two pages reaches real single-block product",()=>{
 assert.match(home,/href="\.\/tapeout-cpu0-report\.html"/);
 assert.match(diff,/href="\.\/tapeout-cpu0-report\.html"/);
 assert.match(report,/href="\.\/tapeout-cpu0-diff\.html"/);
});
