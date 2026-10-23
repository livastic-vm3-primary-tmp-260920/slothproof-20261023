import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validatePublicDraft,safeSemanticText} from '../src/custom.mjs';
import {scan,REASON} from '../src/policy.mjs';
import {assessSemantic} from '../src/quality.mjs';
const input={
 title:'Review public x402 browser behavior',
 description:'Build a synthetic browser QA regression and source-backed security checklist for an independent buyer.',
 reward:'19', currency:'USDC', network:'base',
};
test('public client-side text validates without buyer wallet or link',()=>{
 const x=validatePublicDraft(input);
 assert.equal(x.nominal_reward,19);
 assert.equal(x.source_url,'');
 assert.equal(x.same_owner_previous_entry,false);
 assert.match(safeSemanticText(x),/synthetic browser QA/);
 assert.equal(scan(x).can_assert_wallet_receipt,false);
});
test('possible API keys, cookies, signed payment headers and bearer tokens are denied',()=>{
 const bad=[
  'Authorization: Bearer secretsecrettoken',
  'Cookie: sessionid=abcd12345',
  'PAYMENT-SIGNATURE: signedpayload',
  'X-PAYMENT: signedpayload',
  'apiKey: live-secret',
  '-----BEGIN PRIVATE KEY----- key',
  'Bearer eyJleGFtcGxlIjoidG9rZW4ifQ',
 ];
 for(const s of bad){
   assert.throws(()=>validatePublicDraft({...input,description:'Need to reproduce '+s+' here safely'}),/Possible credential/);
 }
});
test('HTML is plain string not executable markup and suspicious URL not opened',()=>{
 const title='<img src=x onerror=alert(1)> browser preflight report';
 const p=validatePublicDraft({...input,title});
 assert.equal(p.title,title);
 assert.equal(p.source_url,'');
 assert.match(safeSemanticText(p),/onerror=alert/);
});
test('no invented funding from user-supplied funded words',()=>{
 const p=validatePublicDraft({...input,description:'Escrowed guaranteed onchain payout funds are confirmed by the poster, but this is not independent evidence.'});
 const g=scan(p);
 assert.equal(g.can_assert_escrow,false);
 assert.equal(g.can_assert_client_payment,false);
 assert.equal(g.can_assert_wallet_receipt,false);
 assert.equal(g.amount_received,null);
 assert.ok(g.reasons.includes(REASON.NONE));
});
test('same beneficial human cannot gain extra slot via another account',()=>{
 const p=validatePublicDraft({...input,sameOwner:true});
 assert.equal(scan(p).candidate_only,false);
 assert.ok(scan(p).reasons.includes(REASON.PRIOR_OWNER));
});
test('reject too large inputs, invalid numeric bounds or unknown chain labels',()=>{
 assert.throws(()=>validatePublicDraft({...input,title:'ab'}));
 assert.throws(()=>validatePublicDraft({...input,description:'short'}));
 assert.throws(()=>validatePublicDraft({...input,description:'x'.repeat(2001)}));
 assert.throws(()=>validatePublicDraft({...input,reward:'-1'}));
 assert.throws(()=>validatePublicDraft({...input,reward:'Infinity'}));
 assert.throws(()=>validatePublicDraft({...input,currency:'FAKEUSDC'}));
 assert.throws(()=>validatePublicDraft({...input,network:'localhost'}));
});
test('blank price is not silently interpreted as free buyer agreement',()=>{
 assert.throws(()=>validatePublicDraft({...input,reward:''}));
 const p=validatePublicDraft({...input,reward:0});
 assert.equal(p.nominal_reward,0);
 assert.equal(scan(p).amount_received,null);
});
test('weak near-tie and low semantic similarity abstain without false payment confidence',()=>{
 const weak=assessSemantic({top:{category:'offline_qa',similarity:0.3176},runners_up:[{category:'development',similarity:0.3066}]});
 assert.equal(weak.display_category,'uncertain_topic');
 assert.equal(weak.abstained,true);
 assert.equal(weak.confidence_probability,null);
 assert.equal(weak.funding_verified,false);
 assert.equal(weak.receipt_verified,false);
 const solid=assessSemantic({top:{category:'offline_qa',similarity:0.414},runners_up:[{category:'human_fieldwork',similarity:0.2289}]});
 assert.equal(solid.display_category,'offline_qa');
 assert.equal(solid.abstained,false);
 assert.equal(solid.margin,0.1851);
 const tie=assessSemantic({top:{category:'writing',similarity:0.5},runners_up:[{category:'development',similarity:0.48}]});
 assert.equal(tie.abstained,true);
 assert.equal(tie.reason,'NEAR_TIED_PROTOTYPES');
});
test('semantic invalid numbers, impossible ranks, or absent runner fail closed',()=>{
 for(const val of [
  {top:{category:'offline_qa',similarity:NaN},runners_up:[{category:'development',similarity:0.3}]},
  {top:{category:'offline_qa',similarity:0.2},runners_up:[{category:'development',similarity:0.3}]},
  {top:{category:'offline_qa',similarity:0.4},runners_up:[]},
 ]) assert.throws(()=>assessSemantic(val),/Expected sorted/);
});
test('static docs contain byte-identical validation and cash policy modules',()=>{
 assert.equal(
  fs.readFileSync(new URL('../src/custom.mjs',import.meta.url),'utf8'),
  fs.readFileSync(new URL('../docs/custom.mjs',import.meta.url),'utf8')
 );
 assert.equal(
  fs.readFileSync(new URL('../src/quality.mjs',import.meta.url),'utf8'),
  fs.readFileSync(new URL('../docs/quality.mjs',import.meta.url),'utf8')
 );
 assert.equal(
  fs.readFileSync(new URL('../src/policy.mjs',import.meta.url),'utf8'),
  fs.readFileSync(new URL('../docs/policy.mjs',import.meta.url),'utf8')
 );
});
