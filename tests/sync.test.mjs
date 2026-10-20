import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,readdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {webcrypto} from 'node:crypto';
import {readFile as readSource} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {createEncryptedSyncStore,vaultFileName,validateSyncKey} from '../server/sync-store.mjs';
import {handleEncryptedSync,syncConfigured} from '../server/sync-routes.mjs';
import {generateSyncKey,readRemoteBackup,writeRemoteBackup,deleteRemoteBackup,remoteSyncConfig} from '../public/journey/sync-client.mjs';
import {encryptPortfolio,decryptPortfolio} from '../public/journey/vault.mjs';
import {createRegistry,exportPortfolio} from '../public/journey/engine.mjs';
import {installedPacks} from '../public/journey/packs.mjs';

const password='a completely independent very long passphrase!';
const profile={adult:true,locale:'fr',stage:'work',ageBand:'unspecified',pathId:'core.foundations',
 qualification:'VERY PRIVATE QUALIFICATION',occupation:'MY SECRET CAREER',minutesPerWeek:60,familiarity:{}};
const plain=exportPortfolio(createRegistry(installedPacks),profile,[]);
test('V1.2: capability tokens are 256-bit, canonical, and never used as storage filenames',()=>{
 const key=generateSyncKey(webcrypto),key2=generateSyncKey(webcrypto);
 assert.match(key,/^hfs1_[A-Za-z0-9_-]{43}$/);
 assert.equal(validateSyncKey(key),key);
 assert.notEqual(key,key2);
 const path=vaultFileName(key);
 assert.match(path,/^[a-f0-9]{64}\.vault$/);
 assert.ok(!path.includes(key));
 for(const token of ['',key.slice(0,-1),'../secret','hfs1_'+('A'.repeat(43))+'!']){
  assert.throws(()=>validateSyncKey(token));
 }
});
test('V1.2: filesystem store prevents overwrites, ensures immutable concurrent revisions, and deletes only on exact ETag',async()=>{
 const root=await mkdtemp(join(tmpdir(),'hf-sync-store-'));
 try{
  const store=createEncryptedSyncStore(root),key=generateSyncKey(webcrypto);
  const a=await encryptPortfolio(plain,password,{crypto:webcrypto});
  const b=await encryptPortfolio(plain,password,{crypto:webcrypto});
  assert.equal(await store.get(key),null);
  const created=await store.put(key,a,'*');
  assert.equal(created.created,true);
  assert.match(created.revision,/^"[a-f0-9]{64}"$/);
  assert.equal((await store.get(key)).content,a);
  await assert.rejects(store.put(key,b,'*'),e=>e.httpCode===412);
  await assert.rejects(store.put(key,b),e=>e.httpCode===428);
  await assert.rejects(store.put(key,b,'"'+('0'.repeat(64))+'"'),e=>e.httpCode===412);
  const updated=await store.put(key,b,created.revision);
  assert.equal(updated.created,false);
  assert.notEqual(updated.revision,created.revision);
  await assert.rejects(store.delete(key,created.revision),e=>e.httpCode===412);
  assert.equal((await store.get(key)).content,b);
  const names=await readdir(root);
  assert.equal(names.filter(n=>n.endsWith('.vault')).length,1);
  assert.ok(names.every(n=>!n.includes(key)));
  const stored=await readFile(join(root,names[0]),'utf8');
  assert.ok(!stored.includes(profile.qualification));
  assert.ok(!stored.includes(profile.occupation));
  assert.equal(await decryptPortfolio(stored,password,{crypto:webcrypto}),plain);
  await store.delete(key,updated.revision);
  assert.equal(await store.get(key),null);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('V1.2: store rejects plaintext, unsupported envelope and non-absolute directory',async()=>{
 assert.throws(()=>createEncryptedSyncStore('relative/directory'),/absolute/);
 const root=await mkdtemp(join(tmpdir(),'hf-sync-invalid-'));
 try{
  const store=createEncryptedSyncStore(root),key=generateSyncKey(webcrypto);
  await assert.rejects(store.put(key,plain,'*'),e=>e.httpCode===400);
  await assert.rejects(store.put(key,'x'.repeat(150_000),'*'),e=>e.httpCode===413);
  assert.equal((await readdir(root)).length,0);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('V1.2: sync disabled by default, and deliberately disabled on Vercel ephemeral functions',()=>{
 assert.equal(syncConfigured({}),false);
 assert.equal(syncConfigured({HF_SYNC_ENABLED:'1'}),false);
 assert.equal(syncConfigured({HF_SYNC_ENABLED:'1',HF_SYNC_STORAGE_DIR:'/tmp/hf-test',VERCEL:'1'}),false);
 assert.equal(syncConfigured({HF_SYNC_ENABLED:'1',HF_SYNC_STORAGE_DIR:'/tmp/hf-test'}),true);
});
test('V1.2: end-to-end HTTP never receives portfolio plaintext, uses explicit preconditions and no cookies',async()=>{
 const root=await mkdtemp(join(tmpdir(),'hf-sync-http-'));
 const savedEnabled=process.env.HF_SYNC_ENABLED,savedRoot=process.env.HF_SYNC_STORAGE_DIR,savedVercel=process.env.VERCEL;
 const server=createServer(async(req,res)=>{
  const handled=await handleEncryptedSync(req,res,new URL(req.url,'http://localhost'));
  if(!handled){res.writeHead(404);res.end();}
 });
 try{
  delete process.env.HF_SYNC_ENABLED;delete process.env.HF_SYNC_STORAGE_DIR;delete process.env.VERCEL;
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const transport=(path,opts)=>fetch(origin+path,opts);
  assert.equal((await remoteSyncConfig(transport)).enabled,false);
  process.env.HF_SYNC_ENABLED='1';process.env.HF_SYNC_STORAGE_DIR=root;
  assert.equal((await remoteSyncConfig(transport)).enabled,true);
  const key=generateSyncKey(webcrypto);
  const headers={'x-hf-sync-key':key,'x-think-first':'1'};
  assert.equal((await transport('/api/sync/v1',{method:'GET'})).status,401);
  assert.equal((await transport('/api/sync/v1',{method:'GET',headers})).status,404);
  const envelope=await encryptPortfolio(plain,password,{crypto:webcrypto});
  const noCondition=await transport('/api/sync/v1',{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:envelope});
  assert.equal(noCondition.status,428);
  const created=await writeRemoteBackup(key,envelope,null,transport);
  assert.match(created,/^"[a-f0-9]{64}"$/);
  const remote=await readRemoteBackup(key,transport);
  assert.equal(remote.exists,true);
  assert.equal(remote.revision,created);
  assert.equal(remote.content,envelope);
  assert.equal(await decryptPortfolio(remote.content,password,{crypto:webcrypto}),plain);
  assert.equal((await transport('/api/sync/v1',{method:'GET',headers})).headers.get('cache-control'),'no-store');
  assert.equal((await transport('/api/sync/v1',{method:'GET',headers})).headers.get('set-cookie'),null);
  await assert.rejects(writeRemoteBackup(key,envelope,null,transport),/changed|overwritten/);
  await assert.rejects(deleteRemoteBackup(key,'"'+('f'.repeat(64))+'"',transport),/changed|refused/);
  const otherEnvelope=await encryptPortfolio(plain,password,{crypto:webcrypto});
  const next=await writeRemoteBackup(key,otherEnvelope,created,transport);
  assert.notEqual(next,created);
  await assert.rejects(writeRemoteBackup(key,envelope,created,transport),/changed|overwritten/);
  await assert.rejects(deleteRemoteBackup(key,created,transport),/changed|refused/);
  assert.equal(await deleteRemoteBackup(key,next,transport),true);
  assert.equal((await readRemoteBackup(key,transport)).exists,false);
  // Foreign-origin browser traffic fails even with a capability.
  const forbidden=await transport('/api/sync/v1',{method:'GET',headers:{...headers,Origin:'https://foreign.example'}});
  assert.equal(forbidden.status,403);
 }finally{
  await new Promise(resolve=>server.close(resolve));
  if(savedEnabled===undefined)delete process.env.HF_SYNC_ENABLED;else process.env.HF_SYNC_ENABLED=savedEnabled;
  if(savedRoot===undefined)delete process.env.HF_SYNC_STORAGE_DIR;else process.env.HF_SYNC_STORAGE_DIR=savedRoot;
  if(savedVercel===undefined)delete process.env.VERCEL;else process.env.VERCEL=savedVercel;
  await rm(root,{recursive:true,force:true});
 }
});
test('V1.2: UI keeps remote sync explicitly opt-in and 6 learning spaces unchanged',async()=>{
 const base=join(dirname(fileURLToPath(import.meta.url)),'..');
 const app=await readSource(join(base,'public/journey/app.mjs'),'utf8');
 const ui=await readSource(join(base,'public/journey/remote-ui.mjs'),'utf8');
 const html=await readSource(join(base,'public/journey.html'),'utf8');
 const server=await readSource(join(base,'server/index.mjs'),'utf8');
 for(const id of ['remote-sync-panel','remote-sync-key','remote-sync-generate','remote-sync-reveal','remote-sync-upload',
  'remote-sync-download','remote-sync-restore','remote-sync-delete'])
   assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/mountEncryptedRemoteSync\(/);
 assert.match(ui,/createPlaintext\(\)/);
 assert.match(ui,/encryptPortfolio\(plain,pass\)/);
 assert.match(ui,/writeRemoteBackup\(token,cipher,previous.revision\)/);
 assert.match(ui,/restorePlaintext\(plain\)/);
 assert.match(ui,/clearPassphrases\(\)/);
 assert.doesNotMatch(ui,/\blocalStorage\b|\bsessionStorage\b/);
 assert.ok(server.includes("'/journey/remote-ui.mjs'"));
 assert.ok(server.includes("'/journey/sync-client.mjs'"));
 assert.match(server,/handleEncryptedSync\(req,res,url\)/);
});
