import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scan,shortlist,REASON} from '../src/policy.mjs';
const now=new Date('2026-10-23T00:00:00Z');
const base={title:'Review public Python code',description:'Independent customer offers 10 USDC for tests',currency:'USDC',nominal_reward:10};
test('unknown escrow is never certified by marketing',()=>{
  const result=scan({...base,description:'Escrowed fully funded guaranteed payout right now'},now);
  assert.equal(result.can_assert_escrow,false);
  assert.equal(result.can_assert_wallet_receipt,false);
  assert.equal(result.amount_received,null);
  assert.ok(result.reasons.includes(REASON.NONE));
});
test('deposit and claim bond are stopped',()=>{
  const a=scan({...base,description:'You must stake a bond first'},now);
  assert.ok(a.reasons.includes(REASON.COST));
  assert.equal(a.candidate_only,false);
});
test('testnet tokens are not real cash',()=>{
  const a=scan({...base,network:'base-sepolia',description:'Base Sepolia faucet USDC'},now);
  assert.ok(a.reasons.includes(REASON.TESTNET));
  assert.equal(a.candidate_only,false);
});
test('duplicate same owner excluded',()=>{
  assert.equal(scan({...base,same_owner_previous_entry:true},now).candidate_only,false);
});
test('expired task excluded',()=>{
  const a=scan({...base,deadline_utc:'2026-10-22T23:59:59Z'},now);
  assert.ok(a.reasons.includes(REASON.PAST));
});
test('future task remains candidate only, not confirmed paid',()=>{
  const a=scan({...base,deadline_utc:'2026-10-24T01:00:00Z'},now);
  assert.equal(a.candidate_only,true);
  assert.equal(a.can_assert_client_payment,false);
});
test('human-only ID cannot be outsourced to agent',()=>{
  const a=scan({...base,description:'Human-only selfie verification for a physical phone study'},now);
  assert.ok(a.reasons.includes(REASON.HUMAN));
});
test('social growth is conspicuously labelled',()=>{
  const a=scan({...base,description:'Get 10 followers and retweet'},now);
  assert.ok(a.reasons.includes(REASON.SOCIAL));
  assert.equal(a.candidate_only,false);
});
test('unknown payout rail is not equivalent to USDC',()=>{
  const a=scan({...base,currency:'XTM'},now);
  assert.ok(a.reasons.includes(REASON.NOT_USDC));
});
test('invalid deadlines rejected rather than treated open',()=>{
  assert.throws(()=>scan({...base,deadline_utc:'today maybe'},now));
});
test('invalid input rejected',()=>{
  assert.throws(()=>scan(null,now));
  assert.throws(()=>shortlist(Array(501).fill(base),now));
});
