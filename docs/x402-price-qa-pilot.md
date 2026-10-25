# Public x402 Price Contract QA (Base / USDC)

A small, AI-assisted **read-only** developer QA utility for x402 payment-gated APIs. This is a free synthetic reproducibility sample and a public capability demonstration; it is not a completed customer engagement, certified smart-contract audit, received payment, or a claim about customers being overcharged.

## How to run

```bash
python3 -B tools/x402_public_price_contract_20261025.py \
  --spec https://YOUR_PUBLIC_ORIGIN/openapi.json \
  --resource https://YOUR_PUBLIC_ORIGIN/YOUR_PUBLIC_GET
python3 -B -m unittest discover -s tests -p 'test_x402_public_price_contract_20261025.py' -v
```

The utility GETs just the public OpenAPI JSON and then a single unpaid public resource. It accepts only same-origin HTTPS, no URL query parameters, no localhost or private addresses, refuses cross-origin redirects, performs no authentication, wallet signing or payment, and limits the OpenAPI body to 1 MiB. It compares the *fixed* documented USD price to the canonical Base (chain 8453) Circle USDC quote with six decimals in an x402 v2 `PAYMENT-REQUIRED` header. Results are `MATCH`, `MISMATCH` or an explicit `INCONCLUSIVE_*` state; unsupported dynamics, missing real 402 responses, other networks, and missing same-origin document paths must **not** be interpreted as faults.

The CLI returns structured JSON for a local review. This is a narrow price/asset/network sanity check, **not** a comprehensive protocol audit, security scan, contract verification, paid delivery proof, endpoint uptime guarantee, or representation that anyone lost funds. A mismatch may simply mean the seller changed its price but did not update its public spec. No personal data, secrets, real customer wallet, payment signatures, or live transactions should be supplied.

## Optional fixed-scope paid QA pilot

An independent client may request a **one-time $19-equivalent** price/asset/chain quote compatibility QA pilot for one authorized public x402 endpoint. The parties would first agree explicitly on scope, delivery timing, acceptance criteria, allowed test traffic, payment chain, token, public receiving address, revision allowance, refund/cancellation and AI-assisted authorship. Potential deliverables: up to six synthetic static checks, a short report reproducing the actual issue against documented sources, and a single verification after the client's correction. No paid project, contract or payment exists until a real buyer affirmatively accepts and settles. There is no guaranteed revenue.

For a separate technical portfolio and contact context see this repository's existing publicly published x402 QA landing page. No subscription, upfront wallet deposits or signers are required to run the public read-only sample.
