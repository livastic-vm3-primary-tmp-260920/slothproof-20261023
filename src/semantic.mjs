// Local inference using a freely inspectable open-weight sentence embedding model.
// The model ranks meaning, while policy.mjs enforces hard cash/eligibility gates.
import {env,pipeline} from '@huggingface/transformers';
export const MODEL = 'Xenova/all-MiniLM-L6-v2';
const CATEGORIES = Object.freeze([
  ['offline_qa','write reproducible software test cases from sanitized JSON API logs, browser headers, HTTP 402, CSV files'],
  ['development','implement an independently assigned software feature, code tests, documentation, open source developer work'],
  ['self_funded','spend your own money, stake a bond, pay to claim the reward, repay through cashback'],
  ['testnet_only','testnet coins, Sepolia faucet assets, trial tokens that do not represent real cash'],
  ['human_fieldwork','visit physical stores, record a selfie, provide identity documents, use personal phone'],
  ['social_promotion','follow social media, share a sponsored post, invite friends or promote a crypto referral'],
  ['writing','write an article, documentation, research report, tutorial or explainer'],
  ['competition','a prize contest with many competing submissions and only one winner'],
]);
function rows(t){
  const [n,d]=t.dims;
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||n*d!==t.data.length) throw Error('Bad model tensor');
  return Array.from({length:n},(_,i)=>t.data.subarray(i*d,(i+1)*d));
}
function cosine(a,b){let out=0; for(let i=0;i<a.length;i++) out+=a[i]*b[i];return out;}
export async function loadSemantic({offline=false,cacheDir='.model-cache'}={}) {
  env.allowRemoteModels = !offline;
  env.allowLocalModels = true;
  env.cacheDir = cacheDir;
  const extractor=await pipeline('feature-extraction',MODEL,{device:'cpu',dtype:'q8'});
  const prototypes=rows(await extractor(CATEGORIES.map(x=>x[1]),{pooling:'mean',normalize:true}));
  return async function analyze(texts) {
    if(!Array.isArray(texts) || texts.length>500) throw Error('Expected max 500 descriptions');
    if(!texts.length) return [];
    const a=rows(await extractor(texts.map(x=>String(x).slice(0,800)),{pooling:'mean',normalize:true}));
    return a.map(vec=>{
      const scores=CATEGORIES.map(([category],i)=>({category,similarity:Number(cosine(vec,prototypes[i]).toFixed(4))}));
      scores.sort((a,b)=>b.similarity-a.similarity);
      return {top:scores[0],runners_up:scores.slice(1,3)};
    });
  };
}
