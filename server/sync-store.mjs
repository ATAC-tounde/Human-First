/**
 * HUMAN FIRST V1.2 - opt-in encrypted backup storage adapter.
 * Pilot: one trusted Node process with a durable filesystem, NEVER Vercel ephemeral disk.
 * The server only accepts the V1.1 authenticated ciphertext envelope and cannot
 * read learner metadata without the learner's independent encryption passphrase.
 * A possession-only high entropy capability controls READ/WRITE/DELETE. This is
 * not an account, identity verification, or multi-tenant authorization system.
 */
import {mkdir,readFile,writeFile,rename,unlink,open} from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {isAbsolute,join} from 'node:path';
import {parseEncryptedVault,VAULT_MAX_ENVELOPE} from '../public/journey/vault.mjs';
export const SYNC_KEY_PATTERN=/^hfs1_[A-Za-z0-9_-]{43}$/;
export const SYNC_MAX_ENVELOPE=VAULT_MAX_ENVELOPE;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export function validateSyncKey(token){
 if(typeof token!=='string'||!SYNC_KEY_PATTERN.test(token))throw Object.assign(new Error('Invalid capability format'),{httpCode:401});
 const bytes=Buffer.from(token.slice(5),'base64url');
 if(bytes.length!==32||bytes.toString('base64url')!==token.slice(5))
  throw Object.assign(new Error('Invalid capability encoding'),{httpCode:401});
 return token;
}
export function vaultFileName(token){
 validateSyncKey(token);
 // Domain separation prevents cross-protocol token-hash correlation.
 return createHash('sha256').update('HUMAN-FIRST-VAULT-V1:'+token).digest('hex')+'.vault';
}
export function newRevision(){
 // Fresh generation token rather than a ciphertext digest: prevents ABA when
 // an earlier ciphertext is re-uploaded and stale If-Match would otherwise pass.
 return '"'+randomBytes(32).toString('hex')+'"';
}
export function validateEncryptedPayload(raw){
 if(typeof raw!=='string'||Buffer.byteLength(raw,'utf8')>SYNC_MAX_ENVELOPE)
  throw Object.assign(new Error('Encrypted backup exceeds allowed size'),{httpCode:413});
 try{parseEncryptedVault(raw);}catch{throw Object.assign(new Error('Unsupported encrypted backup envelope'),{httpCode:400});}
 return raw;
}
async function locked(path,action){
 let handle;
 for(let attempt=0;attempt<20;attempt++){
  try{handle=await open(path+'.lock','wx',0o600);break;}
  catch(error){
   if(error.code!=='EEXIST')throw error;
   await delay(30);
  }
 }
 if(!handle)throw Object.assign(new Error('Encrypted vault is busy; retry later'),{httpCode:503});
 try{return await action();}
 finally{await handle.close();await unlink(path+'.lock').catch(()=>{});}
}
async function existing(path){
 try{
  const raw=await readFile(path,'utf8');
  let slot;
  try{slot=JSON.parse(raw);}catch{throw new Error('Encrypted slot metadata is corrupt');}
  if(slot?.schema!=='hf.remote.slot.v1'||!/^"[a-f0-9]{64}"$/.test(slot.revision))
   throw new Error('Encrypted slot metadata is invalid');
  validateEncryptedPayload(slot.content);
  return {content:slot.content,revision:slot.revision};
 }catch(error){
  if(error.code==='ENOENT')return null;
  throw error;
 }
}
export function createEncryptedSyncStore(rootDir){
 if(typeof rootDir!=='string'||!isAbsolute(rootDir))throw new TypeError('HF_SYNC_STORAGE_DIR must be an absolute durable directory');
 const root=rootDir;
 let preparing;
 const prepare=()=>preparing??=mkdir(root,{recursive:true,mode:0o700});
 const pathFor=token=>join(root,vaultFileName(token));
 return {
  async get(token){await prepare();return existing(pathFor(token));},
  async put(token,content,condition){
   validateSyncKey(token);
   validateEncryptedPayload(content);
   await prepare();
   const path=pathFor(token);
   return locked(path,async()=>{
    const old=await existing(path);
    if(condition===undefined||condition===null)
     throw Object.assign(new Error('Conditional update required'),{httpCode:428});
    if(condition==='*'){
     if(old)throw Object.assign(new Error('Backup already exists; download or inspect first'),{httpCode:412});
    }else if(!old||condition!==old.revision){
     throw Object.assign(new Error('Backup changed; nothing overwritten'),{httpCode:412});
    }
    const revision=newRevision();
    const stored=JSON.stringify({schema:'hf.remote.slot.v1',revision,content});
    const tmp=path+'.'+randomBytes(12).toString('hex')+'.tmp';
    try{
     await writeFile(tmp,stored,{encoding:'utf8',flag:'wx',mode:0o600});
     await rename(tmp,path);
    }finally{await unlink(tmp).catch(()=>{});}
    return {revision,created:!old};
   });
  },
  async delete(token,condition){
   validateSyncKey(token);
   await prepare();const path=pathFor(token);
   return locked(path,async()=>{
    const old=await existing(path);
    if(!old)throw Object.assign(new Error('Backup not found'),{httpCode:404});
    if(!condition)throw Object.assign(new Error('Conditional deletion required'),{httpCode:428});
    if(condition!==old.revision)throw Object.assign(new Error('Backup changed; deletion refused'),{httpCode:412});
    await unlink(path);
    return true;
   });
  }
 };
}
