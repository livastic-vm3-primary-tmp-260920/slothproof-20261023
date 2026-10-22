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

![Actual local MiniLM synthetic-demo output](docs/demo.png)

## DEV Week 3 published entry

Published October 23, 2026 with both official DEV challenge tags: [SlothProof contest submission](https://dev.to/livasticvm3primarytmp260920/slothproof-a-lazy-local-ai-that-questions-funded-usdc-bounties-1fjo). This is a verified published project post, **not** an award or earned cash; any human eligibility, tax paperwork and prize distribution remain unverified. The full author draft and reproducibility links are in submission/dev-week3-entry.md.

## Analyze one real public listing locally

The hosted [demo](https://livastic-vm3-primary-tmp-260920.github.io/slothproof-20261023/) now has an additional **public-text input form**. Paste a *public* title and requirements, choose the nominal currency/network, and indicate whether your single beneficial owner already applied under another VM/account. Then run actual local MiniLM inference and receive the explicit deterministic stop reasons.

The form is deliberately **NOT** a wallet, crawler, customer CRM, payment recipient verifier, API client, log-upload feature, or automated job claimant. It does not fetch the advertised URL, upload the description, call external employer services or store what you typed. The initial download of the open-weight model and runtime scripts still uses public CDNs. Do not paste private HARs, customer data, API keys, cookies, signed x402 headers or secrets. Known credential-like phrases are rejected before model inference, but the filter cannot guarantee detection of all sensitive data. All inputs must already be public and nonsecret.

Try **Load a synthetic example** for a safe reproducible browser demonstration. The input form uses the exact same byte-identical business policy and validation modules as the tested Node source. The supported npm test command now includes local validation, secret-filter, escaping and static-module parity tests. All output still states verified buyer payment and wallet receipts are **not determined by this tool**.

## Model is actually used

- Model: Xenova/all-MiniLM-L6-v2 (a port of the 384-dimensional open-weight sentence embedding model; review the model card and its upstream license).
- Implementation: Hugging Face Transformers.js, MIT/Apache-licensed ecosystem.
- Input: sanitized/public listings only; embeddings are computed on CPU.
- Embeddings: average token pooling with L2 normalization; cosine scores against eight example job archetypes.
- Labels: offline QA, development, self-funded offer, testnet, human fieldwork, social promotion, writing, competition.
- Policy: independent, inspectable checks for bond, owner duplicate, testnet, expired deadline and human-only eligibility. Semantic score never overrides hard gates.

## Separate existing paid offline QA services (no site checkout)

The demo now includes a clearly optional existing-original-owner sales section. The free semantic checker remains available without purchase. A genuine independent x402 developer may request an uncommitted written 5 native Circle Base USDC synthetic-only QA pilot through the seller's [already published contact route](mailto:onecursor1@gmail.com?subject=x402%20offline%20QA%20-%205%20or%2019%20Base%20USDC), or open the existing [19-USDC scoped GitHub inquiry](https://github.com/livastic-vm3-primary-tmp-260920/defi-payment-proof-qa/issues/new?template=x402-offline-qa-19-base-usdc.yml). Both are requests to discuss an independently funded paid contract, not an automatically accepted invoice or permission to send customer secrets.

The operator's existing [Soul.Markets public service catalog](https://api.soul.mds.markets/v1/soul/vm3-usdc-receipt-qa) currently lists five buyer-initiated, separately priced USDC public-data QA services. This direct JSON link is a read-only, first-party catalog, not a fictitious payment portal. The Soul seller platform charges a commission and has a custodial payout threshold, so an order or balance is NOT a verified original wallet receipt. As of this update there are zero confirmed independent buyers, orders and new paid settlements from this program. The source of each link and the nonbinding terms are recorded in the static docs/paid-offers.json file and enforced with test/offers.test.mjs.

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
