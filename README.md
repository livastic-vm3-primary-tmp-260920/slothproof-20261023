# SlothProof — a local AI filter for misleading USDC job listings

**New original project started October 23, 2026**, within the DEV × MLH Hacktoberfest Week 3 ("Slow and Steady") build window. Original one-human owner, AI-assisted engineering.

Sloths should not read 50 crypto bounties to discover that 43 demand a payment, a selfie, or testnet faucet tokens. SlothProof is a conservative, local-first job-list screener: an **open-weight MiniLM sentence embedding model** identifies what each listing is *about*, while a separate deterministic policy flags obvious financial, legal or one-owner repeat-application gates.

The tool NEVER classifies a posting as funded or paid just because the copy says "escrowed". Every output says escrow, client payment and wallet receipt remain **unverified**. It never operates a crypto wallet.

## Run

Node.js 20 or newer. First run downloads the open-weight model once into the ignored .model-cache folder.

    npm ci --no-audit --no-fund
    npm test
    npm run demo > demo.json

The first run requires network access **only to fetch the model**; descriptions and outputs remain local. Afterwards run with remote model fetching disabled:

    npm run offline > offline.json

The included 8 demo ads are synthetic and use example.invalid; they are NOT real jobs, customers, receipts, wallet assets or bounty offers.

## Model is actually used

- Model: Xenova/all-MiniLM-L6-v2 (a port of the 384-dimensional open-weight sentence embedding model; review the model card and its upstream license).
- Implementation: Hugging Face Transformers.js, MIT/Apache-licensed ecosystem.
- Input: sanitized/public listings only; embeddings are computed on CPU.
- Embeddings: average token pooling with L2 normalization; cosine scores against eight example job archetypes.
- Labels: offline QA, development, self-funded offer, testnet, human fieldwork, social promotion, writing, competition.
- Policy: independent, inspectable checks for bond, owner duplicate, testnet, expired deadline and human-only eligibility. Semantic score never overrides hard gates.

## What it refuses to do

1. No wallet signing, approving, spending, bridging, or key handling.
2. No calls to a job board, client API, GitHub account, Google, email or smart contract.
3. No statement of escrow proof, actual buyer assent or verified final USDC transfer.
4. No seller-identity fabrication or self-referral farm.
5. No network fetch for input rows. Only the model weights can be fetched at first-run setup.
6. No sending customer traces, personal files or paid API credentials to an AI provider.

## Design trade-off

Conservative screening sacrifices some good leads. That is intentional: it is a reading assistant, not a due-diligence oracle. Open weights make local, repeatable retrieval possible and keep potentially sensitive job notes off a proprietary hosted LLM, while the human/owner can inspect the concrete stop rules separately. The top semantic label is fallible and should be reviewed; money stays zero until independently verified.

## Demo, benchmarks & claims

- Real CLI output is generated with npm run demo from the eight entirely synthetic listings.
- All scores come from a real local MiniLM inference run (not a hand-authored score or hardcoded results).
- CLI emits model id, inference flag, every reason and zero verified income.
- The proof images/demo are rendered from actual output and are illustrative of this local prototype only.
- For an actual opportunity, independently verify original buyer escrow, legal/AI/identity eligibility, supported asset and chain, acceptance terms, taxes, labor time and final wallet transfer.

## New project & contest integrity

Every source file in this folder was newly authored during the Week 3 2026 entry period; it is not a repackaged earlier script or a PR to another project. General inspiration comes from the team's prior first-hand experience screening public crypto gigs, but no old code or private account material has been copied. Contest participation and any payout require the **actual human owner's age 18+ and real KYC/tax eligibility**; prize selection is competitive, not guaranteed and not earned by publishing.

MIT code license (LICENSE). Model weights are never committed and retain their upstream license. This project is original AI-assisted software operated by one actual human economic owner, not a claim of human-unaided authorship.
