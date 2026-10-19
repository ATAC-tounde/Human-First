import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer as tcpServer} from 'node:net';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {offlineCard,offlineIds} from '../server/offline.mjs';
import {getExercise,localizeExercise} from '../server/catalog.mjs';
let child,base;
async function freePort(){
 const s=tcpServer();s.listen(0,'127.0.0.1');await once(s,'listening');
 const p=s.address().port;s.close();await once(s,'close');return p;
}
before(async()=>{
 const port=await freePort();base='http://127.0.0.1:'+port;
 child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',HF_SESSION_SECRET:randomBytes(32).toString('hex'),HF_AI_ENABLED:'0'},stdio:'ignore'});
 for(let i=0;i<100;i++){
   if(child.exitCode!==null)throw Error('Server stopped');
   try{if((await fetch(base+'/api/health')).ok)return;}catch{}
   await new Promise(r=>setTimeout(r,30));
 }
 throw Error('Test server did not start');
});
after(()=>child?.kill());
async function req(path,{method='GET',cookie,data}={}){
 const headers={};
 if(method==='POST'){headers['Content-Type']='application/json';headers['X-Think-First']='1';}
 if(cookie)headers.Cookie='hf_session='+cookie;
 const r=await fetch(base+path,{method,headers,...(data?{body:JSON.stringify(data)}:{})});
 const raw=r.headers.get('set-cookie');
 return {status:r.status,data:await r.json(),cookie:raw?.match(/hf_session=([^;]+)/)?.[1]};
}
test('V0.4.1: twenty distinct, bilingual activities without compulsory screen time',()=>{
 const ids=offlineIds();
 assert.equal(ids.length,20);
 assert.equal(new Set(ids).size,20);
 for(const id of ids)for(const language of ['fr','en']){
  assert.ok(getExercise(id));
  const card=offlineCard(id,language);
  assert.ok(card&&card.title.length>8,id+':'+language+':title');
  assert.equal(card.steps.length,3,id+':'+language+':steps');
  assert.ok(card.steps.every(x=>typeof x==='string'&&x.length>=20),id+':'+language+':steps');
  assert.ok(card.check.length>20,id+':'+language+':check');
  assert.ok(card.minutes>=3&&card.minutes<=15,id+':'+language+':duration');
  const localized=localizeExercise(getExercise(id),language);
  assert.ok(localized.title);
 }
 assert.equal(offlineCard('unknown'),null);
});
test('Activity cards are inaccessible before the independent transfer is completed',async()=>{
 const available=await req('/api/catalog');
 assert.equal(available.data.exercises.length,20);
 for(const id of offlineIds()){
  const card=offlineCard(id,'fr');
  assert.ok(!JSON.stringify(available.data).includes(card.check),id);
 }
 let x=await req('/api/session/start',{method:'POST',data:{adult:true,exerciseId:'causalite',locale:'fr'}});
 assert.equal(x.status,200);const id=x.data.sessionId;
 assert.match(id,/^[0-9a-f]{24}$/);
 let cookie=x.cookie;
 assert.equal(x.data.offlineCard,undefined);
 for(const [path,data] of [
  ['/api/session/attempt',{answer:'La causalité exige une comparaison indépendante.'}],
  ['/api/session/hint',{}],
  ['/api/session/explanation',{}],
  ['/api/session/transfer',{}]
 ]){
  x=await req(path,{method:'POST',cookie,data});
  assert.equal(x.status,200,path);
  cookie=x.cookie;
  assert.equal(x.data.sessionId,id);
  assert.equal(x.data.offlineCard,undefined,path);
 }
 x=await req('/api/session/answer',{method:'POST',cookie,data:{answer:'Il faut comparer et envisager une autre cause.'}});
 assert.equal(x.status,200);
 assert.equal(x.data.offlineCard.steps.length,3);
 assert.ok(x.data.reflection.offlineChallenge,'Existing V0.3 offline text must remain');
 const resumed=await req('/api/session',{cookie:x.cookie});
 assert.equal(resumed.data.offlineCard.title,x.data.offlineCard.title);
});
test('Review card unlocked only after recall; no free text sent to server',async()=>{
 let x=await req('/api/session/recall/start',{method:'POST',data:{adult:true,exerciseId:'alarme',locale:'en'}});
 assert.equal(x.status,200);assert.equal(x.data.offlineCard,undefined);
 const cookie=x.cookie;
 const leaking=await req('/api/session/recall/answer',{method:'POST',cookie,data:{hasAnswer:true,answer:'PRIVATE'}});
 assert.equal(leaking.status,400);
 x=await req('/api/session/recall/answer',{method:'POST',cookie,data:{hasAnswer:true}});
 assert.equal(x.status,200);
 assert.equal(x.data.stage,'recall-finished');
 assert.ok(x.data.offlineCard.title.length>8);
});
test('Session ID is non-secret, unique across sessions and not a cookie token',async()=>{
 const a=await req('/api/session/start',{method:'POST',data:{adult:true,exerciseId:'causalite'}});
 const b=await req('/api/session/start',{method:'POST',data:{adult:true,exerciseId:'moyenne'}});
 assert.notEqual(a.data.sessionId,b.data.sessionId);
 assert.ok(!JSON.stringify(a.data).includes('v1.'));
 assert.ok(!JSON.stringify(b.data).includes('v1.'));
});
