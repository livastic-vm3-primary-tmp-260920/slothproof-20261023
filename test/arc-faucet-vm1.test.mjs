import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {OWNER,APEX,hexUtf8,inspectOfficialData,expectedMessage} from "../docs/arc-faucet-vm1.mjs";
const root=path.resolve(import.meta.dirname,"..");
const s=fs.readFileSync(path.join(root,"docs/arc-faucet-vm1.mjs"),"utf8");
const html=fs.readFileSync(path.join(root,"docs/arc-faucet-vm1.html"),"utf8");
const now=new Date("2026-10-23T21:45:00Z");
const eligible={ok:true,address:OWNER,addressReady:true,canClaimNow:true,potEmpty:false,claimsLeftNow:17};
const challenge={ok:true,address:OWNER,message:expectedMessage(OWNER,now)};
test("day-scoped official APEX exact ownership wording and EIP-191 hex",()=>{
  assert.equal(expectedMessage(OWNER,now),"APEX faucet on Arc: I own "+OWNER+" and claim on 2026-10-23");
  assert.equal(hexUtf8("a"),"0x61");
  assert.equal(hexUtf8("APEX"),"0x41504558");
});
test("signed-claim preflight accepts only owner, live claims and exact day challenge",()=>{
  assert.equal(inspectOfficialData(eligible,challenge,now),challenge.message);
  assert.throws(()=>inspectOfficialData({...eligible,address:"0x0000000000000000000000000000000000000000"},challenge,now));
  assert.throws(()=>inspectOfficialData({...eligible,claimsLeftNow:0},challenge,now));
  assert.throws(()=>inspectOfficialData({...eligible,canClaimNow:false},challenge,now));
  assert.throws(()=>inspectOfficialData({...eligible,potEmpty:true},challenge,now));
  assert.throws(()=>inspectOfficialData(eligible,{...challenge,message:"Give me all tokens"},now));
  assert.throws(()=>inspectOfficialData(eligible,challenge,new Date("2026-10-24T01:01:00Z")));
});
test("static app connects only original official APEX firstparty and safely signs a message",()=>{
  assert.ok(s.includes('method:"personal_sign"'));
  assert.ok(s.includes('method:"eth_requestAccounts"'));
  assert.ok(s.includes('body:JSON.stringify({address:OWNER,signature})'));
  assert.ok(s.includes("attempted=true;button.disabled=true;"));
  assert.ok(s.includes('credentials:"omit"'));
  for(const bad of ["eth_sendTransaction","eth_signTypedData","wallet_switchEthereumChain","privateKey","mnemonic","localStorage","sessionStorage","document.cookie","postMessage(","fetch('https://unknown","fetch(`https://unknown"]){assert.ok(!s.includes(bad),bad);}
  assert.match(html,/connect-src https:\/\/apexfaucet\.xyz/);
  assert.match(html,/noindex,nofollow/);
  assert.match(html,/no transaction/i);
  assert.ok(html.includes(OWNER));
});
