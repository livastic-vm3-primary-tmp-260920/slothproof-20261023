/**
 * Validate one manually pasted PUBLIC job listing for local semantic triage.
 * No account identifier, wallet transaction, credential, or buyer URL required.
 */
const MAX_TITLE=140;
const MAX_DESCRIPTION=2000;
const MAX_REWARD=1000000;
const SECRET_PATTERNS=[
  /\bAuthorization\s*:/i,
  /\b(?:Cookie|Set-Cookie)\s*:/i,
  /\b(?:PAYMENT-SIGNATURE|X-PAYMENT|X-API-KEY)\s*:/i,
  /\bBearer\s+[a-z0-9+/_.=-]{8,}/i,
  /\b(?:api[_-]?key|private[_-]?key|password|access[_-]?token)\s*[:=]/i,
  /-{3,}\s*BEGIN\s+(?:RSA\s+|EC\s+|OPENSSH\s+)?PRIVATE KEY\s*-{3,}/i,
  /\b(?:sk_(?:live|test)_|ghp_|github_pat_)[a-zA-Z0-9_-]{8,}/,
];
const NETWORKS=new Set(['base','ethereum','polygon','arc','sepolia','base-sepolia','unknown']);
const CURRENCIES=new Set(['USDC','USD','USDT','ETH','XTM','TESTUSDC','UNKNOWN']);
function secretLikely(s){return SECRET_PATTERNS.some(p=>p.test(s));}
export function validatePublicDraft({title,description,reward,currency,network,sameOwner=false}={}){
  if(typeof title!=='string'||typeof description!=='string')throw Error('Please enter a public title and description.');
  title=title.trim();description=description.trim();
  if(title.length<5||title.length>MAX_TITLE)throw Error('Public title must be 5–140 characters.');
  if(description.length<12||description.length>MAX_DESCRIPTION)throw Error('Public description must be 12–2,000 characters.');
  if(secretLikely(title)||secretLikely(description))throw Error('Possible credential or payment header: remove secrets before local analysis.');
  const n=Number(reward);
  if(reward===''||reward===null||!Number.isFinite(n)||n<0||n>MAX_REWARD)throw Error('Advertised reward must be a nonnegative number <= 1,000,000; zero is allowed.');
  if(!CURRENCIES.has(currency))throw Error('Unknown advertised currency.');
  if(!NETWORKS.has(network))throw Error('Unknown network; select unknown if uncertain.');
  if(typeof sameOwner!=='boolean')throw Error('sameOwner must be boolean.');
  return {
    id:'manually-pasted-public-listing',
    title, description, nominal_reward:n, currency, network,
    same_owner_previous_entry:sameOwner,
    source_url:'', // Never follow external task URLs or track a user session.
  };
}
export function safeSemanticText(job){
  if(!job || typeof job.title!=='string'||typeof job.description!=='string')throw Error('Missing validated job');
  return [job.title,job.description].join(' ').slice(0,1700);
}
