/**
 * Keep hosted static policy/validator identical to tested Node modules.
 * Never fetch external URLs or touch wallet/account data.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const cp=async(source,destination)=>fs.copyFile(path.join(root,source),path.join(root,destination));
await cp('src/policy.mjs','docs/policy.mjs');
await cp('src/custom.mjs','docs/custom.mjs');
await cp('examples/synthetic-bounties.json','docs/synthetic-bounties.json');
const demo=path.join(root,'out','model-demo.json');
try {await fs.access(demo);await cp('out/model-demo.json','docs/model-demo.json');}catch {}
console.log('Synced static modules and synthetic fixtures without external action.');
