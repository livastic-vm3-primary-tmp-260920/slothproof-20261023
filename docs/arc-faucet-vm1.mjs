// One-owner, one signed APEX Arc USDC faucet claim. No signer keys, transaction or token approvals.
export const OWNER = "0x4e3106520E40af30870caFE78da1B1e7110eD98E";
export const APEX = "https://apexfaucet.xyz";
const cleanAddress = (s) => typeof s === "string" ? s.toLowerCase() : "";
export const hexUtf8 = (s) => "0x" + Array.from(new TextEncoder().encode(s), b=>b.toString(16).padStart(2,"0")).join("");
export function expectedMessage(address, date = new Date()) {
  const utcDate = date.toISOString().slice(0,10);
  return `APEX faucet on Arc: I own ${address} and claim on ${utcDate}`;
}
export function inspectOfficialData(next, challenge, now = new Date()) {
  if(!next?.ok || !challenge?.ok || cleanAddress(next.address)!==cleanAddress(OWNER) ||
     cleanAddress(challenge.address)!==cleanAddress(OWNER) ||
     next.addressReady!==true || next.canClaimNow!==true || next.potEmpty!==false ||
     !(Number(next.claimsLeftNow) > 0)) {
    throw new Error("The original owner is not currently eligible under APEX faucet rules.");
  }
  if(challenge.message !== expectedMessage(OWNER, now)) {
    throw new Error("APEX returned an unexpected or expired signing message. Do not sign.");
  }
  return challenge.message;
}
let challenge = null;
let attempted = false;
async function officialJson(url, options={}) {
  if(!(url.startsWith(APEX + "/api/arc/faucet/") || url===APEX + "/api/arc/claim")) {
    throw new Error("The requested API is not the allowlisted first-party APEX faucet endpoint.");
  }
  const res = await fetch(url, {mode:"cors",redirect:"error",credentials:"omit",
    cache:"no-store",...options});
  let result;
  try { result = await res.json(); } catch { throw new Error("Official faucet returned non-JSON. Stop."); }
  if(!res.ok) {
    throw new Error(`Official APEX refused HTTP ${res.status}: ${String(result.error ?? result.message ?? "unknown").slice(0,180)}`);
  }
  return result;
}
async function inspect() {
  const status = document.getElementById("result");
  const button = document.getElementById("claim");
  button.disabled = true;
  challenge = null;
  status.textContent = "Checking official APEX first-party information...";
  try {
    const [next,quote] = await Promise.all([
      officialJson(APEX + "/api/arc/faucet/next/" + OWNER),
      officialJson(APEX + "/api/arc/faucet/challenge/" + OWNER)
    ]);
    challenge = inspectOfficialData(next, quote);
    document.getElementById("challenge").textContent = challenge;
    status.textContent = "Official wallet eligible, 0.01 Arc USDC available; inspect the exact message, then sign if it matches.";
    button.disabled = attempted;
  } catch(e) {
    status.textContent = "NOT READY. " + (e?.message || "First-party faucet could not be verified.");
  }
}
async function signAndClaim() {
  const button=document.getElementById("claim");
  const status=document.getElementById("result");
  if(attempted || !challenge || challenge!==expectedMessage(OWNER)) {
    status.textContent="Claim blocked: no current exact challenge, or already attempted.";return;
  }
  attempted=true;button.disabled=true;
  document.getElementById("inspect").disabled=true;
  try {
    const provider=window.ethereum?.isMetaMask ? window.ethereum :
      window.ethereum?.providers?.find(x=>x.isMetaMask);
    if(!provider) throw new Error("MetaMask provider not found; no alternate signer is allowed.");
    const accounts=await provider.request({method:"eth_requestAccounts"});
    if(!Array.isArray(accounts) || !accounts.some(a=>cleanAddress(a)===cleanAddress(OWNER))) {
      throw new Error("MetaMask did not authorize the ORIGINAL owner address. Stop.");
    }
    status.textContent = "MetaMask connected. Only approve an exact plain EIP-191 ownership statement; NEVER a token approval or transaction.";
    const signature=await provider.request({method:"personal_sign",params:[hexUtf8(challenge),OWNER]});
    if(!/^0x[0-9a-fA-F]{130}$/.test(String(signature))) {
      throw new Error("MetaMask returned a malformed ownership signature. Stop.");
    }
    status.textContent = "Ownership message signed. Sending this claim only to official APEX...";
    const receipt=await officialJson(APEX+"/api/arc/claim",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({address:OWNER,signature})
    });
    // Never display/copy/store full signature, only safe receipt fields.
    const tx=String(receipt.txHash ?? receipt.hash ?? receipt.transactionHash ?? "");
    const claimNo=Number(receipt.claimNumber ?? receipt.claim_number ?? 0);
    status.textContent= "APEX official response: "+(receipt.ok===true?"OK":"UNKNOWN")+
      "; transaction="+(/^(0x)?[a-fA-F0-9]{64}$/.test(tx)?tx:"not provided")+
      "; claimNumber="+(Number.isFinite(claimNo)?claimNo:"unknown")+
      ". Independently verify on Arc mainnet before recognizing earnings.";
  } catch(e) {
    status.textContent="Claim NOT confirmed. "+String(e?.message ?? "Unknown error").slice(0,250)+
      ". Single-attempt guard active; do not retry without first-party reconciliation.";
  } finally {
    challenge=null;
  }
}
if(typeof document!=="undefined") {
  document.getElementById("inspect")?.addEventListener("click",inspect);
  document.getElementById("claim")?.addEventListener("click",signAndClaim);
}
