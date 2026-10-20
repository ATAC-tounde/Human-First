/** Optional encrypted local device slot, never a cloud sync or automatic backup.
 * Only opaque authenticated ciphertext reaches IndexedDB. The passphrase never does.
 * Browser storage may be evicted or shared with anyone using this browser profile.
 */
import {parseEncryptedVault} from './vault.mjs';
export const VAULT_DB_NAME='human-first-private-vault-v1';
const STORE='encrypted';
const SLOT='primary';
function openDevice(options={}){
 const factory=options.indexedDB??globalThis.indexedDB;
 if(!factory?.open)throw new Error('Device storage is not available in this browser');
 return new Promise((resolve,reject)=>{
  const request=factory.open(VAULT_DB_NAME,1);
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(new Error('Device storage could not be opened'));
  request.onblocked=()=>reject(new Error('Close other HUMAN FIRST tabs before changing device storage'));
 });
}
async function transact(mode,operation,options={}){
 const db=await openDevice(options);
 try{
  return await new Promise((resolve,reject)=>{
   let tx;
   try{tx=db.transaction(STORE,mode);}catch{reject(new Error('Device storage is unavailable'));return;}
   let value;
   const request=operation(tx.objectStore(STORE));
   request.onsuccess=()=>{value=request.result;};
   request.onerror=()=>reject(new Error('Encrypted device storage failed'));
   tx.oncomplete=()=>resolve(value);
   tx.onerror=()=>reject(new Error('Encrypted device transaction failed'));
   tx.onabort=()=>reject(new Error('Encrypted device transaction aborted'));
  });
 }finally{db.close();}
}
export async function saveEncryptedDevice(encrypted,options={}){
 parseEncryptedVault(encrypted);
 await transact('readwrite',store=>store.put(encrypted,SLOT),options);
 return true;
}
export async function readEncryptedDevice(options={}){
 const result=await transact('readonly',store=>store.get(SLOT),options);
 if(result===undefined)return null;
 if(typeof result!=='string')throw new Error('Device backup is corrupted');
 parseEncryptedVault(result);
 return result;
}
export async function clearEncryptedDevice(options={}){
 await transact('readwrite',store=>store.delete(SLOT),options);
 return true;
}
