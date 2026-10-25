import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');
const p=file('../docs/x402-base-usdc-qa.html');
const home=file('../docs/index.html');
const xml=file('../docs/sitemap.xml');

test('buyer-intent page uses real existing service prices and actual source-bound network facts',()=>{
  assert.match(p,/\$5 <small>USDC on Base/);
  assert.match(p,/\$19 <small>USDC on Base/);
  assert.match(p,/eip155:8453/);
  assert.match(p,/eip155:84532/);
  assert.match(p,/0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913/);
  assert.match(p,/mailto:onecursor1@gmail.com\?subject=/);
  assert.match(p,/defi-payment-proof-qa\/issues\/new\?template=x402-offline-qa-19-base-usdc\.yml/);
  assert.match(p,/payTo/);
  assert.match(p,/PAYMENT-REQUIRED/);
});
test('page promises neither award nor settlement and cannot transact',()=>{
  assert.match(p,/nonbinding until scope/);
  assert.match(p,/Do not transfer USDC/);
  assert.match(p,/Neither a publicly listed service/);
  assert.match(p,/Never send us/);
  assert.doesNotMatch(p,/<script\b/i);
  assert.doesNotMatch(p,/<form\b/i);
  assert.doesNotMatch(p,/(?:signTypedData|eth_sendTransaction|private_key|connectWallet|data:text\/html)/i);
});
test('project nav and sitemap are self-consistent',()=>{
  assert.equal(home.split('href="./x402-base-usdc-qa.html"').length-1,1);
  assert.match(p,/rel="canonical" href="https:\/\/livastic-vm3-primary-tmp-260920\.github\.io\/slothproof-20261023\/x402-base-usdc-qa\.html"/);
  assert.equal(xml.split('<url>').length-1,4);
  assert.match(xml,/x402-base-usdc-qa\.html/);
  assert.match(xml,/<lastmod>2026-10-25<\/lastmod>/);
  assert.doesNotMatch(xml,/urn:.*testnet/);
});
