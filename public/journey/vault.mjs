/**
 * HUMAN FIRST: encrypted portfolio backup envelope, schema v1.1.
 * Only explicit user action encrypts/decrypts. No network or persistence here.
 *
 * PBKDF2-SHA256 slows offline guessing, but cannot rescue weak passphrases:
 * use a long unique passphrase and retain the exported backup safely.
 */
export const VAULT_SCHEMA='hf.encrypted-portfolio.v1';
export const VAULT_MIN_ITERATIONS=310_000;
export const VAULT_MAX_ITERATIONS=1_000_000;
export const VAULT_MAX_TEXT=80_000;
export const VAULT_MAX_ENVELOPE=135_000;
const cryptoLabel='AES-256-GCM';
const kdfLabel='PBKDF2-SHA256';
const fields=['cipher','data','iterations','iv','kdf','salt','schema'];
const utf8=new TextEncoder();
const dec=new TextDecoder('utf-8',{fatal:true});
const assert=(condition,message)=>{if(!condition)throw new TypeError(message);};
const isPlain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&
 (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
function encoded(bytes){
 let binary='';
 for(let i=0;i<bytes.length;i+=4096)binary+=String.fromCharCode(...bytes.subarray(i,i+4096));
 return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
function decoded(str){
 assert(typeof str==='string'&&str.length>0&&str.length<120_000&&/^[a-zA-Z0-9_-]+$/.test(str),'Malformed encrypted field');
 const binary=atob(str.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-str.length%4)%4));
 return Uint8Array.from(binary,ch=>ch.charCodeAt(0));
}
function passwordBytes(password){
 assert(typeof password==='string'&&password.length>=12&&password.length<=256&&!/^\s+$/.test(password),'Use a unique passphrase of at least 12 characters');
 return utf8.encode(password);
}
function webCrypto(options){
 const cryptoImpl=options.crypto??globalThis.crypto;
 assert(cryptoImpl&&typeof cryptoImpl.getRandomValues==='function'&&cryptoImpl.subtle,'Web Crypto requires HTTPS or localhost');
 return cryptoImpl;
}
function iterationsAllowed(value){
 assert(Number.isSafeInteger(value)&&value>=VAULT_MIN_ITERATIONS&&value<=VAULT_MAX_ITERATIONS,'Unsupported key derivation cost');
 return value;
}
async function derive(secret,salt,iterations,cryptoImpl){
 const material=await cryptoImpl.subtle.importKey('raw',secret,'PBKDF2',false,['deriveKey']);
 return cryptoImpl.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},
  material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
function validatePortfolio(plaintext){
 assert(typeof plaintext==='string'&&utf8.encode(plaintext).length<=VAULT_MAX_TEXT,'Portfolio must be JSON under 80 kB');
 let data;
 try{data=JSON.parse(plaintext);}catch{throw new TypeError('Portfolio must be valid JSON');}
 assert(isPlain(data)&&data.schema==='hf.portfolio.v1'&&isPlain(data.profile),'Not a HUMAN FIRST portfolio');
 return plaintext;
}
function header(raw){
 return utf8.encode(JSON.stringify({
  schema:raw.schema,kdf:raw.kdf,cipher:raw.cipher,
  iterations:raw.iterations,salt:raw.salt,iv:raw.iv
 }));
}
export function parseEncryptedVault(text){
 assert(typeof text==='string'&&text.length<=VAULT_MAX_ENVELOPE,'Encrypted vault file is too large');
 let envelope;
 try{envelope=JSON.parse(text);}catch{throw new TypeError('Invalid encrypted vault JSON');}
 assert(isPlain(envelope),'Encrypted vault must be a JSON object');
 assert(Object.keys(envelope).sort().join('|')===fields.join('|'),'Unknown or missing encrypted vault fields');
 assert(envelope.schema===VAULT_SCHEMA&&envelope.cipher===cryptoLabel&&envelope.kdf===kdfLabel,'Unsupported encryption format');
 iterationsAllowed(envelope.iterations);
 const salt=decoded(envelope.salt),iv=decoded(envelope.iv),data=decoded(envelope.data);
 assert(salt.length===16&&iv.length===12,'Invalid salt or initialization vector');
 assert(data.length>=16&&data.length<=VAULT_MAX_TEXT+16,'Invalid encrypted payload size');
 return {envelope,salt,iv,data};
}
export async function encryptPortfolio(plaintext,passphrase,options={}){
 validatePortfolio(plaintext);
 const secret=passwordBytes(passphrase),cryptoImpl=webCrypto(options);
 const iterations=iterationsAllowed(options.iterations??VAULT_MIN_ITERATIONS);
 const salt=cryptoImpl.getRandomValues(new Uint8Array(16));
 const iv=cryptoImpl.getRandomValues(new Uint8Array(12));
 const envelope={schema:VAULT_SCHEMA,kdf:kdfLabel,cipher:cryptoLabel,
  iterations,salt:encoded(salt),iv:encoded(iv),data:''};
 try{
  const key=await derive(secret,salt,iterations,cryptoImpl);
  const ciphertext=await cryptoImpl.subtle.encrypt({name:'AES-GCM',iv,additionalData:header(envelope),tagLength:128},
   key,utf8.encode(plaintext));
  envelope.data=encoded(new Uint8Array(ciphertext));
  const result=JSON.stringify(envelope);
  parseEncryptedVault(result);
  return result;
 }finally{secret.fill(0);}
}
export async function decryptPortfolio(encrypted,passphrase,options={}){
 const {envelope,salt,iv,data}=parseEncryptedVault(encrypted);
 const secret=passwordBytes(passphrase),cryptoImpl=webCrypto(options);
 try{
  const key=await derive(secret,salt,envelope.iterations,cryptoImpl);
  let plaintext;
  try{
   const result=await cryptoImpl.subtle.decrypt({name:'AES-GCM',iv,additionalData:header(envelope),tagLength:128},key,data);
   plaintext=dec.decode(result);
  }catch{
   throw new Error('Incorrect passphrase or corrupted encrypted backup');
  }
  return validatePortfolio(plaintext);
 }finally{secret.fill(0);}
}
