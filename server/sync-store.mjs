/**
 * HUMAN FIRST V1.2 - opt-in encrypted backup storage adapter.
 * Pilot: one trusted Node process with a durable filesystem, NEVER Vercel ephemeral disk.
 * The server validates the V1.1 envelope shape but cannot authenticate AES-GCM
 * without the passphrase. The official client encrypts before each transfer.
 * A possession-only high entropy capability controls READ/WRITE/DELETE. This is
 * not an account, identity verification, or multi-tenant authorization system.
 */
import {mkdir,readFile,rename,unlink,open} from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {isAbsolute,join} from 'node:path';
import {parseEncryptedVault,VAULT_MAX_ENVELOPE} from '../public/journey/vault.mjs';
export const SYNC_KEY_PATTERN=/^hfs1_[A-Za-z0-9_-]{43}$/;
export const SYNC_MAX_ENVELOPE=VAULT_MAX_ENVELOPE;
// Single-process pilot: in-memory per-vault queue; a crashed process leaves
// no persistent .lock files that could deny all future writes on restart.
const pendingWrites=new Map();
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
 const previous=pendingWrites.get(path)??Promise.resolve();
 let release;
 const held=new Promise(resolve=>{release=resolve;});
 pendingWrites.set(path,held);
 await previous;
 try{return await action();}
 finally{
  if(pendingWrites.get(path)===held)pendingWrites.delete(path);
  release();
 }
}
// On POSIX, sync the containing directory after rename/unlink to persist
// directory entry changes on durable media. Windows does not consistently
// expose directory fsync through Node; durability remains platform-dependent.
async function syncDirectory(root){
 if(process.platform==='win32')return;
 const handle=await open(root,'r');
 try{await handle.sync();}
 finally{await handle.close();}
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
     const handle=await open(tmp,'wx',0o600);
     try{
      await handle.writeFile(stored,'utf8');
      await handle.sync();
     }finally{await handle.close();}
     await rename(tmp,path);
     await syncDirectory(root);
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
    await syncDirectory(root);
    return true;
   });
  }
 };
}
