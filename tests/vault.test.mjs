import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRegistry,exportPortfolio,importPortfolio} from '../public/journey/engine.mjs';
import {installedPacks} from '../public/journey/packs.mjs';
import {makeFormativeObservation} from '../public/journey/assessment.mjs';
import {VAULT_SCHEMA,VAULT_MIN_ITERATIONS,encryptPortfolio,decryptPortfolio,parseEncryptedVault} from '../public/journey/vault.mjs';
import {VAULT_DB_NAME,saveEncryptedDevice,readEncryptedDevice,clearEncryptedDevice} from '../public/journey/device-vault.mjs';
import {restorePortablePortfolio} from '../public/journey/restore.mjs';
import {ALIAS_SCHEMA} from '../public/journey/continuity.mjs';
const registry=createRegistry(installedPacks);
const profile={adult:true,locale:'fr',stage:'work',ageBand:'unspecified',pathId:'core.foundations',
 qualification:'Secret personal qualification',occupation:'Private learner occupation',minutesPerWeek:60,familiarity:{}};
const plain=exportPortfolio(registry,profile,[],{formative:[makeFormativeObservation(registry,'core.evidence',['source'])]});
const password='long unique passphrase with four uncommon words!';
const options={crypto:webcrypto};
test('V1.1: passphrase-encrypted roundtrip preserves a validated portfolio and formative observations',async()=>{
 const cipher=await encryptPortfolio(plain,password,options);
 const obj=JSON.parse(cipher);
 assert.equal(obj.schema,VAULT_SCHEMA);
 assert.equal(obj.iterations,VAULT_MIN_ITERATIONS);
 assert.equal(obj.cipher,'AES-256-GCM');
 assert.equal(obj.kdf,'PBKDF2-SHA256');
 assert.deepEqual(Object.keys(obj).sort(),['schema','cipher','kdf','iterations','salt','iv','data'].sort());
 assert.ok(!cipher.includes(profile.qualification));
 assert.ok(!cipher.includes(profile.occupation));
 assert.ok(!cipher.includes('core.evidence'));
 assert.ok(!cipher.includes('hf.portfolio.v1'));
 const result=await decryptPortfolio(cipher,password,options);
 assert.equal(result,plain);
 const imported=importPortfolio(result,registry);
 assert.equal(imported.profile.pathId,profile.pathId);
 assert.equal(imported.formative.length,1);
});

test('V1.1: a wrong passphrase and GCM-tagged ciphertext corruption fail closed',async()=>{
 const cipher=await encryptPortfolio(plain,password,options);
 await assert.rejects(decryptPortfolio(cipher,'a different long unique passphrase',options),/Incorrect passphrase or corrupted/);
 const raw=JSON.parse(cipher);
 raw.data=(raw.data[0]==='A'?'B':'A')+raw.data.slice(1);
 await assert.rejects(decryptPortfolio(JSON.stringify(raw),password,options),/Incorrect passphrase or corrupted/);
 const changed=JSON.parse(cipher);
 changed.iterations+=1;
 await assert.rejects(decryptPortfolio(JSON.stringify(changed),password,options),/Incorrect passphrase or corrupted/);
});

test('V1.1: encryption uses different random salt and IV for every backup',async()=>{
 const [one,two]=await Promise.all([
  encryptPortfolio(plain,password,options),encryptPortfolio(plain,password,options)
 ]);
 const a=JSON.parse(one),b=JSON.parse(two);
 assert.notEqual(a.salt,b.salt);
 assert.notEqual(a.iv,b.iv);
 assert.notEqual(a.data,b.data);
 assert.equal(await decryptPortfolio(one,password,options),plain);
 assert.equal(await decryptPortfolio(two,password,options),plain);
});

test('V1.1: reject weak passphrases, invalid portfolios and hostile encryption parameters',async()=>{
 await assert.rejects(encryptPortfolio(plain,'too short',options),/12 characters/);
 await assert.rejects(encryptPortfolio('{"test":1}',password,options),/Not a HUMAN FIRST portfolio/);
 await assert.rejects(encryptPortfolio('{not JSON}',password,options),/valid JSON/);
 await assert.rejects(encryptPortfolio(plain,password,{...options,iterations:1200}),/Unsupported key derivation/);
 await assert.rejects(encryptPortfolio(plain,password,{...options,iterations:10_000_000}),/Unsupported key derivation/);
 assert.throws(()=>parseEncryptedVault('{}'),/Unknown or missing/);
 assert.throws(()=>parseEncryptedVault('not json'),/Invalid encrypted vault JSON/);
 assert.throws(()=>parseEncryptedVault('x'.repeat(200_000)),/too large/);
});

test('V1.1: reject malformed salts/nonces, injected fields and invalid ciphertext encoding',async()=>{
 const encrypted=await encryptPortfolio(plain,password,options);
 const a=JSON.parse(encrypted);
 a.extra='UNEXPECTED';
 assert.throws(()=>parseEncryptedVault(JSON.stringify(a)),/Unknown or missing/);
 delete a.extra;
 a.salt='AAAA';
 assert.throws(()=>parseEncryptedVault(JSON.stringify(a)),/Invalid salt/);
 const b=JSON.parse(encrypted);
 b.data='not_valid!';
 assert.throws(()=>parseEncryptedVault(JSON.stringify(b)),/Malformed/);
 const c=JSON.parse(encrypted);
 c.schema='hf.encrypted-portfolio.v77';
 assert.throws(()=>parseEncryptedVault(JSON.stringify(c)),/Unsupported/);
});

// Minimal deterministic IndexedDB mock for transaction behaviour without new packages.
function fakeIndexedDB(){
 const storage=new Map();
 let created=false;
 let upgrades=0;
 const factory={
  raw:storage,
  get upgrades(){return upgrades;},
  open(name,version){
   assert.equal(name,VAULT_DB_NAME);
   assert.equal(version,1);
   const request={result:null,onupgradeneeded:null,onsuccess:null,onerror:null,onblocked:null};
   const db={
    objectStoreNames:{contains:s=>created&&s==='encrypted'},
    createObjectStore(name){assert.equal(name,'encrypted');assert.equal(created,false);created=true;upgrades++;},
    close(){},
    transaction(name,mode){
     assert.equal(name,'encrypted');
     assert.equal(created,true,'The object store must be created in onupgradeneeded');
     const tx={oncomplete:null,onerror:null,onabort:null};
     tx.objectStore=()=>({
      get(key){return schedule(()=>storage.get(key));},
      put(value,key){assert.equal(mode,'readwrite');return schedule(()=>storage.set(key,value));},
      delete(key){assert.equal(mode,'readwrite');return schedule(()=>storage.delete(key));}
     });
     function schedule(action){
      const work={onsuccess:null,onerror:null,result:undefined};
      queueMicrotask(()=>{
       const value=action();work.result=value;
       work.onsuccess?.();
       queueMicrotask(()=>tx.oncomplete?.());
      });
      return work;
     }
     return tx;
    }
   };
   queueMicrotask(()=>{
    request.result=db;
    if(!created)request.onupgradeneeded?.();
    request.onsuccess?.();
   });
   return request;
  }
 };
 return factory;
}
test('V1.1: device storage is strictly opt-in, encrypted only, clearable and contains no passphrase',async()=>{
 const factory=fakeIndexedDB();
 assert.equal(await readEncryptedDevice({indexedDB:factory}),null);
 assert.equal(factory.upgrades,1,'IndexedDB onupgradeneeded must create the store exactly once');
 const cipher=await encryptPortfolio(plain,password,options);
 assert.equal(await saveEncryptedDevice(cipher,{indexedDB:factory}),true);
 assert.equal(factory.raw.size,1);
 const stored=[...factory.raw.values()][0];
 assert.equal(stored,cipher);
 assert.ok(!stored.includes(profile.occupation));
 assert.ok(!stored.includes(password));
 assert.equal(await decryptPortfolio(await readEncryptedDevice({indexedDB:factory}),password,options),plain);
 assert.equal(await clearEncryptedDevice({indexedDB:factory}),true);
 assert.equal(await readEncryptedDevice({indexedDB:factory}),null);
 assert.equal(factory.raw.size,0);
 await assert.rejects(saveEncryptedDevice('{"profile":"plaintext"}',{indexedDB:factory}),/Unknown or missing/);
});

test('V1.1: unavailable IndexedDB, blocked and failed opens report errors without losing the current portfolio',async()=>{
 const broken=(event)=>({open:()=>{
  const request={onerror:null,onblocked:null,onsuccess:null,onupgradeneeded:null};
  queueMicrotask(()=>request[event]?.());
  return request;
 }});
 await assert.rejects(readEncryptedDevice({indexedDB:{}}),/not available/);
 await assert.rejects(readEncryptedDevice({indexedDB:broken('onerror')}),/could not be opened/);
 await assert.rejects(readEncryptedDevice({indexedDB:broken('onblocked')}),/Close other HUMAN FIRST tabs/);
 await assert.rejects(saveEncryptedDevice(await encryptPortfolio(plain,password,options),{indexedDB:broken('onerror')}),/could not be opened/);
});

test('V1.1: current-catalog backup ignores a stale old-catalog alias, but older portfolios require an exact mapping',()=>{
 const current=JSON.parse(plain);
 const manifest={schema:ALIAS_SCHEMA,fromCatalogVersion:'old-pack-v0',toCatalogVersion:registry.version,
  competencies:[{from:'core.old-evidence',to:'core.evidence'}],pathways:[]};
 assert.equal(restorePortablePortfolio(plain,registry,manifest).profile.pathId,'core.foundations');
 const old=structuredClone(current);
 old.catalogVersion=manifest.fromCatalogVersion;
 old.profile.familiarity={'core.old-evidence':'exploring'};
 assert.throws(()=>restorePortablePortfolio(JSON.stringify(old),registry),/Different catalog version/);
 const restored=restorePortablePortfolio(JSON.stringify(old),registry,manifest);
 assert.equal(restored.profile.familiarity['core.evidence'],'exploring');
 assert.equal(restored.migrated,true);
 const wrong=JSON.stringify({...current,catalogVersion:'version-without-manifest'});
 assert.throws(()=>restorePortablePortfolio(wrong,registry,manifest),/version does not match/);
 const drop=structuredClone(current);
 drop.profile.familiarity={'core.removed-skill':'confident'};
 assert.throws(()=>restorePortablePortfolio(JSON.stringify(drop),registry),/Unknown competency/);
 const missing=structuredClone(current);
 delete missing.catalogVersion;
 assert.throws(()=>restorePortablePortfolio(JSON.stringify(missing),registry),/Missing catalog version/);
});

test('V1.1: existing JSON import remains functional and no secrets are sent by learning code',async()=>{
 const base=join(dirname(fileURLToPath(import.meta.url)),'..');
 const app=await readFile(join(base,'public/journey/app.mjs'),'utf8');
 const html=await readFile(join(base,'public/journey.html'),'utf8');
 const server=await readFile(join(base,'server/index.mjs'),'utf8');
 for(const id of ['vault-panel','vault-passphrase','vault-confirm','vault-download','vault-import','vault-save-device',
  'vault-resume-device','vault-clear-device','vault-status'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/exportPortfolio\s*\(\s*registry\s*,\s*program\.generatedFor\s*,\s*events\s*,\s*\{\s*formative\s*\}\s*\)/);
 assert.match(app,/restorePortablePortfolio\s*\(\s*plain\s*,\s*registry\s*,\s*aliasManifest\s*\)/);
 assert.match(app,/\$\(['"]vault-passphrase['"]\)\.value\s*=\s*['"]{2}/);
 assert.match(app,/secret\s*!==\s*\$\(['"]vault-confirm['"]\)\.value/,'Backups require passphrase confirmation');
 assert.match(app,/readEncryptedDevice\s*\(\s*\)\s*&&\s*!window\.confirm/,'Overwriting a device backup requires confirmation');
 assert.match(app,/\$\(['"]vault-confirm['"]\)\.value\s*=\s*['"]{2}/,'Confirmation field must be cleared');
 assert.match(html,/id="vault-import-label"[^>]*tabindex="0"/,'Keyboard file import must be reachable');
 assert.match(html,/id="vault-import"[^>]*tabindex="-1"/,'The invisible native input must not add a second focus stop');
 assert.match(app,/program\s*&&\s*!window\.confirm\s*\(/,'Restoration must preserve the current work unless approved');
 assert.ok(!/\bfetch\s*\(/.test(app.replace(/^\s*\/\/.*$/gm,'')),'No network posting of personal profile or password');
 assert.ok(!/\blocalStorage\s*[.\[]/.test(app),'No cleartext localStorage');
 for(const route of ['/journey/vault.mjs','/journey/device-vault.mjs'])assert.ok(server.includes("'"+route+"'"));
 assert.equal(importPortfolio(plain,registry).profile.pathId,profile.pathId);
});
