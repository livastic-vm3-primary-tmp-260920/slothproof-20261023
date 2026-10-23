/**
 * Honest, non-probabilistic display gate for local embedding similarities.
 * These are illustrative guardrails, not validated statistical confidence.
 * A weak or near-tied prototype match is an abstention, never a task verdict.
 */
export const TOP_SIMILARITY_FLOOR = 0.35;
export const MIN_TOP_RUNNER_MARGIN = 0.045;

export function assessSemantic(semantic) {
  const top=semantic?.top;
  const runner=semantic?.runners_up?.[0];
  if(!top || !runner || typeof top.category !== 'string' ||
     typeof runner.category !== 'string' ||
     !Number.isFinite(top.similarity) || !Number.isFinite(runner.similarity) ||
     top.similarity < -1 || top.similarity > 1 ||
     runner.similarity < -1 || runner.similarity > 1 ||
     top.similarity < runner.similarity) {
    throw Error('Expected sorted, finite semantic similarities with a runner-up');
  }
  const margin=Number((top.similarity-runner.similarity).toFixed(4));
  const insufficient=top.similarity < TOP_SIMILARITY_FLOOR;
  const nearTie=margin < MIN_TOP_RUNNER_MARGIN;
  return {
    display_category: insufficient || nearTie ? 'uncertain_topic' : top.category,
    abstained: insufficient || nearTie,
    raw_top_category: top.category,
    raw_top_similarity: top.similarity,
    next_category: runner.category,
    next_similarity: runner.similarity,
    margin,
    reason: insufficient ? 'LOW_SEMANTIC_SIMILARITY' : nearTie ? 'NEAR_TIED_PROTOTYPES' : 'DISTINCT_TOP_PROTOTYPE',
    confidence_probability: null,
    funding_verified: false,
    receipt_verified: false,
    explanation: 'Heuristic topic suggestion only; no independent employer, escrow or wallet receipt checks.'
  };
}
