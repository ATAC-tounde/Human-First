/**
 * Optional V1.2 sync pilot transport. Disabled by default, and deliberately
 * disabled on Vercel ephemeral functions. Not a replacement for real accounts.
 */
import {createEncryptedSyncStore,SYNC_MAX_ENVELOPE,validateSyncKey} from './sync-store.mjs';
const headers={
 'Cache-Control':'no-store',
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer',
 'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",
 'X-Frame-Options':'DENY'
};
let activeStore,configuredDirectory;
export function syncConfigured(env=process.env){
 return env.HF_SYNC_ENABLED==='1'&&Boolean(env.HF_SYNC_STORAGE_DIR)&&!env.VERCEL;
}
function store(){
 const dir=process.env.HF_SYNC_STORAGE_DIR;
 if(!activeStore||configuredDirectory!==dir){
  activeStore=createEncryptedSyncStore(dir);
  configuredDirectory=dir;
 }
 return activeStore;
}
function send(res,status,data,extra={}){
 res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8',...extra});
 res.end(JSON.stringify(data));
}
function failure(res,status,code){send(res,status,{error:code});}
function secureRequest(req){
 const hostname=(req.headers.host??'').split(':')[0].toLowerCase();
 if((hostname==='localhost'||hostname==='127.0.0.1'||hostname==='[::1]')&&!process.env.VERCEL)return true;
 if(req.socket.encrypted)return true;
 return process.env.TRUST_PROXY==='1'&&req.headers['x-forwarded-proto']==='https';
}
function sameOrigin(req){
 const origin=req.headers.origin;
 if(!origin)return true; // Script/curl clients still need the 256-bit private key.
 try{
  const o=new URL(origin);
  return o.host===req.headers.host&&['http:','https:'].includes(o.protocol);
 }catch{return false;}
}
function precondition(req){
 const newer=req.headers['if-none-match'],matching=req.headers['if-match'];
 if(newer==='*'&&!matching)return '*';
 if(!newer&&/^"[a-f0-9]{64}"$/.test(matching??''))return matching;
 return null;
}
async function readPayload(req){
 if(req.headers['content-type']?.split(';')[0].trim()!=='application/json')
  throw Object.assign(new Error('Expected JSON encrypted payload'),{httpCode:415});
 const chunks=[];let bytes=0;
 for await(const chunk of req){
  bytes+=chunk.length;
  if(bytes>SYNC_MAX_ENVELOPE)throw Object.assign(new Error('Backup too large'),{httpCode:413});
  chunks.push(chunk);
 }
 return Buffer.concat(chunks).toString('utf8');
}
export async function handleEncryptedSync(req,res,url){
 if(url.pathname==='/api/sync/config'){
  if(req.method!=='GET'){failure(res,405,'method_not_allowed');return true;}
  send(res,200,{enabled:syncConfigured(),kind:'encrypted-capability-pilot',
   durableStorageRequired:true,cloudAccountAvailable:false});
  return true;
 }
 if(url.pathname!=='/api/sync/v1')return false;
 if(!syncConfigured()){failure(res,503,'sync_disabled');return true;}
 if(!secureRequest(req)){failure(res,403,'secure_origin_required');return true;}
 if(!sameOrigin(req)){failure(res,403,'origin_not_allowed');return true;}
 if(!['GET','PUT','DELETE'].includes(req.method)){failure(res,405,'method_not_allowed');return true;}
 let token;
 try{token=validateSyncKey(req.headers['x-hf-sync-key']);}
 catch{failure(res,401,'invalid_capability');return true;}
 try{
  if(req.method==='GET'){
   const file=await store().get(token);
   if(!file){failure(res,404,'not_found');return true;}
   send(res,200,{content:file.content,revision:file.revision},{ETag:file.revision});
   return true;
  }
  const condition=precondition(req);
  if(!condition){failure(res,428,'precondition_required');return true;}
  if(req.method==='DELETE'){
   if(condition==='*'){failure(res,400,'exact_revision_required');return true;}
   await store().delete(token,condition);
   send(res,200,{deleted:true});return true;
  }
  const encrypted=await readPayload(req);
  const result=await store().put(token,encrypted,condition);
  send(res,result.created?201:200,{stored:true,revision:result.revision},{ETag:result.revision});
  return true;
 }catch(e){
  const code=[400,401,403,404,412,413,415,428,503].includes(e.httpCode)?e.httpCode:500;
  const message={
   400:'invalid_encrypted_backup',404:'not_found',412:'revision_conflict',
   413:'backup_too_large',415:'invalid_content_type',428:'precondition_required',
   503:'temporary_unavailable',500:'internal_error'
  }[code]??'invalid_request';
  failure(res,code,message);
  return true;
 }
}
