import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'docs/paid-offers.json'),'utf8'));
const markup=fs.readFileSync(path.join(root,'docs/index.html'),'utf8');
test('published offer cards reuse exactly existing original seller routes and cannot invent payment',()=>{
 assert.equal(data.schema,'slothproof.original-one-human-existing-paid-services.v1');
 assert.equal(data.verified_new_buyer_orders,0);
 assert.equal(data.verified_new_finalized_owner_wallet_receipts_usdc,0);
 assert.equal(data.no_wallet_connection_on_this_site,true);
 assert.equal(data.independent_order_and_payment_required,true);
 assert.equal(data.products.length,3);
 assert.equal(data.products[0].advertised_price,5);
 assert.equal(data.products[1].advertised_price,19);
 assert.equal(data.products[2].advertised_price,null);
});
test('existing human pilot email and existing official original GitHub intake preserved',()=>{
 const pilot=data.products[0].buyer_action_url;
 const expanded=data.products[1].buyer_action_url;
 assert.match(pilot,/^mailto:onecursor1@gmail\.com\?subject=/);
 assert.equal(expanded,'https://github.com/livastic-vm3-primary-tmp-260920/defi-payment-proof-qa/issues/new?template=x402-offline-qa-19-base-usdc.yml');
 assert.ok(markup.includes(pilot.replaceAll('&','&amp;')));
 assert.ok(markup.includes(expanded.replaceAll('&','&amp;')));
});
test('agent-marketplace profile is real read-only API and not a new signup or imagined UI',()=>{
 const uri=data.products[2].buyer_action_url;
 assert.equal(uri,'https://api.soul.mds.markets/v1/soul/vm3-usdc-receipt-qa');
 assert.ok(markup.includes(uri));
 assert.match(markup,/not (?:a )?checkout/i);
 assert.match(markup,/no confirmed buyer purchase/i);
});
test('do not solicit secrets, sign transactions, or claim escrow',()=>{
 const body=data.products.map(p=>p.delivery).join(' ')+data.privacy_rule;
 assert.match(body,/Never send raw HAR/);
 for (const p of data.products){
  assert.ok(p.buyer_action_url.startsWith('https://')||p.buyer_action_url.startsWith('mailto:'));
  assert.ok(!p.buyer_action_url.includes('sign'));
  assert.ok(!p.buyer_action_url.includes('approval'));
 }
 assert.match(markup,/not.*(?:receipt|received|funded)/is);
});
