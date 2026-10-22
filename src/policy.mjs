// SlothProof: conservative public-text screening, not a financial oracle.
// Original work begun 2026-10-23 for Hacktoberfest "Slow and Steady".
export const REASON = Object.freeze({
  PRIOR_OWNER: 'SAME_OWNER_PREVIOUS_ENTRY',
  COST: 'PREPAYMENT_OR_BOND_MENTION',
  TESTNET: 'TESTNET_OR_FAUCET',
  SOCIAL: 'SOCIAL_PROMOTION_OR_REFERRAL',
  HUMAN: 'HUMAN_ID_OR_DEVICE_REQUIRED',
  PAST: 'DEADLINE_EXPIRED',
  NONE: 'NO_INDEPENDENT_FUNDING_PROOF',
  NOT_USDC: 'PAYOUT_RAIL_NOT_ORIGINAL_USDC',
});
function textOf(job) {
  return [job.title,job.description,job.requirements].filter(Boolean).join(' ').slice(0,12000);
}
export function scan(job, now = new Date()) {
  if(!job || typeof job !== 'object' || !job.title) throw Error('Expected an item with title');
  const text=textOf(job);
  const flags = [];
  if(job.same_owner_previous_entry === true) flags.push(REASON.PRIOR_OWNER);
  if(/\b(?:bond|stake|upfront\s+fee|pay\s+to\s+(?:claim|apply)|deposit\s+required|spend\s+first)\b/i.test(text)) flags.push(REASON.COST);
  if(/\b(?:testnet|sepolia|faucet\s+(?:asset|token|usdc)|play\s+money)\b/i.test(text) || /^(testnet|sepolia|base-sepolia)$/i.test(String(job.network||''))) flags.push(REASON.TESTNET);
  if(/\b(?:retweet|referral|refer\s+a\s+friend|followers|like\s+and\s+share|promote\s+on\s+x)\b/i.test(text)) flags.push(REASON.SOCIAL);
  if(/\b(?:human.only|selfie|passport|physical\s+phone|real\s+person\s+interview|personally\s+visit|KYC)\b/i.test(text)) flags.push(REASON.HUMAN);
  if(job.deadline_utc) {
    const t=Date.parse(job.deadline_utc);
    if (!Number.isFinite(t)) throw Error('Invalid deadline timestamp');
    if(t < now.getTime()) flags.push(REASON.PAST);
  }
  if(!/^(USDC|USD)$/i.test(String(job.currency||''))) flags.push(REASON.NOT_USDC);
  flags.push(REASON.NONE);
  const blocked = flags.some(k=>[REASON.PRIOR_OWNER,REASON.COST,REASON.TESTNET,REASON.PAST,REASON.HUMAN].includes(k));
  const nominal = Number(job.nominal_reward||0);
  return {
    id: String(job.id||job.title).slice(0,90),
    title: String(job.title).slice(0,160),
    source_url: String(job.source_url||'').slice(0,600),
    advertised_reward: Number.isFinite(nominal)?Math.max(0,nominal):0,
    currency: String(job.currency||'UNKNOWN').slice(0,25),
    reasons: [...new Set(flags)],
    candidate_only: !blocked,
    can_assert_escrow: false,
    can_assert_client_payment: false,
    can_assert_wallet_receipt: false,
    amount_received: null,
    human_next_step: blocked ? 'STOP_OR_VERIFY_ELIGIBILITY' : 'CHECK_INDEPENDENT_PAYER_ESCROW_AND_SCOPE',
  };
}
export function shortlist(jobs,now=new Date()) {
  if(!Array.isArray(jobs)||jobs.length>500) throw Error('Expected max 500 items');
  return jobs.map(x=>scan(x,now));
}
