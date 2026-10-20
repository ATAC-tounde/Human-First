/**
 * HUMAN FIRST V1.2 optional remote ciphertext transport.
 * The server receives an opaque 256-bit capability and AES-GCM ciphertext ONLY.
 * No passphrase, portfolio plaintext, cookies, or account data are transferred.
 */
import {parseEncryptedVault} from './vault.mjs';
export const REMOTE_SYNC_KEY_PATTERN=/^hfs1_[A-Za-z0-9_-]{43}$/;
const base='/api/sync/v1';
function validateKey(key){
 if(typeof key!=='string'||!REMOTE_SYNC_KEY_PATTERN.test(key))
  throw new TypeError('Invalid sync key. Use a complete 256-bit pairing code.');
 return key;
}
export function generateSyncKey(cryptoImpl=globalThis.crypto){
 if(!cryptoImpl?.getRandomValues)throw new Error('Secure Web Crypto is required');
 const bytes=cryptoImpl.getRandomValues(new Uint8Array(32));
 let binary='';
 for(const b of bytes)binary+=String.fromCharCode(b);
 return 'hfs1_'+btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
function transport(fetchFn){
 const fn=fetchFn??globalThis.fetch;
 if(typeof fn!=='function')throw new TypeError('Fetch transport is not available');
 return fn;
}
function requestHeaders(key,extra={}){
 return {'x-hf-sync-key':validateKey(key),'x-think-first':'1',...extra};
}
const etag=revision=>typeof revision==='string'&&/^"[a-f0-9]{64}"$/.test(revision);
async function responseJson(res){
 let data;
 try{data=await res.json();}catch{throw new Error('Invalid synchronization response');}
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Invalid synchronization response');
 return data;
}
export async function remoteSyncConfig(fetchFn){
 const response=await transport(fetchFn)('/api/sync/config',{method:'GET',cache:'no-store',credentials:'omit'});
 if(!response.ok)throw new Error('Cannot check synchronization availability');
 const config=await responseJson(response);
 return {enabled:config.enabled===true,kind:config.kind??'disabled'};
}
export async function readRemoteBackup(key,fetchFn){
 const res=await transport(fetchFn)(base,{method:'GET',headers:requestHeaders(key),
  cache:'no-store',credentials:'omit',redirect:'error'});
 if(res.status===404)return {exists:false,revision:null,content:null};
 if(!res.ok)throw new Error('Remote backup read refused ('+res.status+')');
 const data=await responseJson(res);
 if(!etag(data.revision)||data.revision!==res.headers.get('etag'))throw new Error('Invalid remote revision');
 parseEncryptedVault(data.content);
 return {exists:true,content:data.content,revision:data.revision};
}
export async function writeRemoteBackup(key,cipher,revision=null,fetchFn){
 parseEncryptedVault(cipher);
 if(revision!==null&&!etag(revision))throw new TypeError('Invalid expected revision');
 const res=await transport(fetchFn)(base,{method:'PUT',
  headers:requestHeaders(key,{'Content-Type':'application/json',
   ...(revision===null?{'If-None-Match':'*'}:{'If-Match':revision})}),
  body:cipher,cache:'no-store',credentials:'omit',redirect:'error'});
 if(res.status===412)throw new Error('Remote backup changed. Nothing overwritten. Download/review it first.');
 if(!res.ok)throw new Error('Encrypted backup upload refused ('+res.status+')');
 const data=await responseJson(res);
 if(!etag(data.revision)||data.revision!==res.headers.get('etag'))
  throw new Error('Invalid remote write acknowledgement');
 return data.revision;
}
export async function deleteRemoteBackup(key,revision,fetchFn){
 if(!etag(revision))throw new TypeError('Exact revision required for remote deletion');
 const res=await transport(fetchFn)(base,{method:'DELETE',
  headers:requestHeaders(key,{'If-Match':revision}),
  cache:'no-store',credentials:'omit',redirect:'error'});
 if(res.status===412)throw new Error('Remote backup changed; deletion was refused.');
 if(!res.ok)throw new Error('Remote deletion refused ('+res.status+')');
 const data=await responseJson(res);
 if(data.deleted!==true)throw new Error('Invalid remote deletion acknowledgement');
 return true;
}
