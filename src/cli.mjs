#!/usr/bin/env node
import fs from 'node:fs/promises';
import {scan} from './policy.mjs';
import {loadSemantic,MODEL} from './semantic.mjs';
const args=process.argv.slice(2);
const option=(k,def)=>args.includes(k)?args[args.indexOf(k)+1]:def;
const infile=option('--input','examples/synthetic-bounties.json');
const offline=args.includes('--offline');
const raw=await fs.readFile(infile,'utf8');
if(raw.length>1500000) throw Error('Max input size 1.5 MB');
const jobs=JSON.parse(raw);
if(!Array.isArray(jobs)) throw Error('JSON must be an array');
const screened=jobs.map(j=>scan(j));
const local=await loadSemantic({offline});
const vectors=await local(jobs.map(j=>[j.title,j.description].filter(Boolean).join(' ')));
const ranked=screened.map((r,i)=>({
  ...r,semantic:vectors[i],verified_income:0,
  review_priority:Number((Math.min(100,r.advertised_reward)*0.04+
      (vectors[i].top.category==='offline_qa'||vectors[i].top.category==='development'?4:0)-
      (r.candidate_only?0:40)).toFixed(2)),
})).sort((a,b)=>b.review_priority-a.review_priority);
console.log(JSON.stringify({
  schema:'slothproof-original-public-text-risk-triage-v1',
  model:MODEL,
  semantic_engine:'CPU open-weight local MiniLM sentence embeddings',
  model_inference_ran:true,
  offline_mode:offline,
  generated_at:new Date().toISOString(),
  source_proof:'USER_SUPPLIED_TEXT_ONLY_NOT_ESCROW_OR_CHAIN',
  hypothetical_entries:ranked.length,
  earnings_verified_by_this_tool:0,
  received_usdc_verified_by_this_tool:0,
  no_wallet_read_or_payment:true,
  description:'Ranking uses meaning; independent payer escrow, identity and actual receipt always require separate first-party proof.',
  ranked,
},null,2));
