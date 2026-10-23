import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const project=path.resolve(import.meta.dirname,'..');
const page=fs.readFileSync(path.join(project,'docs/tapeout-cpu0-diff.html'),'utf8');
const home=fs.readFileSync(path.join(project,'docs/index.html'),'utf8');
const readme=fs.readFileSync(path.join(project,'README.md'),'utf8');
const original='0x4e3106520E40af30870caFE78da1B1e7110eD98E';
const old='https://vm5-openapi-x402.onrender.com/v1/tapeout-cpu0-report';
const newer='https://vm5-openapi-x402.onrender.com/v1/tapeout-cpu0-diff';
const sample=newer+'-sample';

test('only existing owner original VM1 MetaMask payee advertised on this TapeOut page',()=>{
 assert.match(page,new RegExp(original,'i'));
 assert.doesNotMatch(page,/0x6b01efa0705e91a7aca54271510bf9e594717f34/i);
 assert.ok(page.includes('Base mainnet'));
 assert.ok(page.includes('0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913'));
 assert.ok(page.includes('eip155:8453'));
});
test('two different genuine paid endpoints, real prices and fictional sample clearly separated',()=>{
 assert.ok(page.includes(old));
 assert.ok(page.includes(newer));
 assert.ok(page.includes(sample));
 assert.ok(page.includes('0.005 native Base USDC'));
 assert.ok(page.includes('0.010 native Base USDC'));
 assert.ok(page.includes('fictional'));
 assert.ok(page.includes('not on-chain proof'));
});
test('pinned reference scenario names two blocks, compared fields and chain',()=>{
 for(const token of ['73915245','74009771','196','20 fixed','factory.cpuCount','factory.implementation','18 of 20']){
  assert.ok(page.includes(token),token);
 }
 assert.ok(page.includes('not the latest live block'));
 assert.match(page,/neither a complete chain history nor an independent security audit/i);
});
test('no secrets, fake customers, buy-now signer or invented security guarantee',()=>{
 assert.doesNotMatch(page,/(private_key|seed_phrase|bearer_token|api[-_]secret|walletConnect\(|guaranteed profit|wallet drained)/i);
 assert.match(page,/no verified independent paid purchase/i);
 assert.match(page,/No guaranteed sales or net earnings are claimed/i);
 assert.ok(!page.includes('<form'));
 assert.ok(!page.includes('<script'));
});
test('existing SlothProof homepage and README point to the new distinct resource without overwriting prior one',()=>{
 assert.ok(home.includes('./tapeout-cpu0-diff.html'));
 assert.ok(home.includes('https://bazaar.saylorinnovations.com/resources/69272'));
 assert.ok(home.includes('https://vm5-openapi-x402.onrender.com/v1/x402-sample'));
 assert.ok(readme.includes('Actual paid TapeOut x402 resource links'));
 assert.ok(readme.includes(newer));
 assert.ok(readme.includes(original));
});
