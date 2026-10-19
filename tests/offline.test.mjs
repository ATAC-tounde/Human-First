import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {createServer as tcpServer} from 'node:net';
import {once} from 'node:events';
import {offlineCard,offlineIds} from '../server/offline.mjs';

let child,base;
async function freePort(){const s=tcpServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;s.close();await once(s,'close');return p;}
before(async()=>{
 const p=await freePort();base=`http://127.0.0.1:${p}`;
 child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(p),HOST:'127.0.0.1',HF_SESSION_SECRET:randomBytes(32).toString('hex')},stdio:'ignore'});
 for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,30));}
 throw Error('test server did not start');
});
after(()=>child?.kill());
async function req(path,{method='GET',data,cookie}={}){
 const headers={};
 if(method==='POST'){headers['Content-Type']='application/json';headers['X-Think-First']='1';}
 if(cookie)headers.Cookie=`hf_session=${cookie}`;
 const r=await fetch(base+path,{method,headers,...(data?{body:JSON.stringify(data)}:{})});
 return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.match(/hf_session=([^;]+)/)?.[1]};
}

test('nine independent French/English offline tasks are ready and safe for demonstration',()=>{
 assert.equal(offlineIds().length,9);
 assert.equal(new Set(offlineIds()).size,9);
 for(const id of offlineIds()){
  for(const locale of ['fr','en']){
   const card=offlineCard(id,locale);
   assert.ok(card,`${id}:${locale}`);
   assert.ok(card.title.length>9);
   assert.ok(card.materials.length>4);
   assert.ok(card.minutes>=3 && card.minutes<=10);
   assert.equal(card.steps.length,3);
   assert.ok(card.steps.every(s=>s.length>28));
   assert.ok(card.check.length>20);
  }
  assert.notEqual(offlineCard(id,'fr').title,offlineCard(id,'en').title);
 }
 assert.equal(offlineCard('unknown'),null);
});

test('offline tasks are excluded from catalogue, early hints, transfer and recall prompts',async()=>{
 const list=await req('/api/catalog?lang=fr');
 assert.equal(list.status,200);
 const first=offlineCard('moyenne','fr');
 assert.ok(!JSON.stringify(list.body).includes(first.title));
 let x=await req('/api/session/start',{method:'POST',data:{adult:true,exerciseId:'moyenne',locale:'fr'}});
 assert.equal(x.status,200);let c=x.cookie;
 const sid=x.body.sessionId;
 assert.match(sid,/^[a-f0-9]{24}$/);
 assert.equal(x.body.offlineCard,undefined);
 x=await req('/api/session/attempt',{method:'POST',cookie:c,data:{answer:'La moyenne seule ne le démontre pas.'}});
 c=x.cookie;assert.equal(x.body.sessionId,sid);assert.equal(x.body.offlineCard,undefined);
 x=await req('/api/session/hint',{method:'POST',cookie:c,data:{}});
 c=x.cookie;assert.equal(x.body.offlineCard,undefined);
 x=await req('/api/session/explanation',{method:'POST',cookie:c,data:{}});
 c=x.cookie;assert.equal(x.body.offlineCard,undefined);
 x=await req('/api/session/transfer',{method:'POST',cookie:c,data:{}});
 c=x.cookie;assert.equal(x.body.offlineCard,undefined);
 assert.ok(!JSON.stringify(x.body).includes(first.title));
 x=await req('/api/session/answer',{method:'POST',cookie:c,data:{answer:'Il faut les résultats par personne.'}});
 assert.equal(x.status,200);
 assert.equal(x.body.offlineCard.title,first.title);
 assert.equal(x.body.offlineCard.steps.length,3);
 const resumed=await req('/api/session',{cookie:x.cookie});
 assert.equal(resumed.body.offlineCard.title,first.title);
});

test('recall offline activities are revealed only after recall submission, and are translated',async()=>{
 let x=await req('/api/session/recall/start',{method:'POST',data:{adult:true,exerciseId:'deduction',locale:'en'}});
 assert.equal(x.status,200);assert.equal(x.body.offlineCard,undefined);
 let c=x.cookie;
 x=await req('/api/session/recall/answer',{method:'POST',cookie:c,data:{hasAnswer:true}});
 assert.equal(x.status,200);assert.equal(x.body.stage,'recall-finished');
 assert.equal(x.body.offlineCard.title,offlineCard('deduction','en').title);
});

test('session ID changes when starting a distinct exercise, without revealing cookie credentials',async()=>{
 const a=await req('/api/session/start',{method:'POST',data:{adult:true,exerciseId:'deduction'}});
 const b=await req('/api/session/start',{method:'POST',data:{adult:true,exerciseId:'moyenne'}});
 assert.notEqual(a.body.sessionId,b.body.sessionId);
 assert.ok(!JSON.stringify(a.body).includes('v1.'));
 assert.ok(!JSON.stringify(b.body).includes('v1.'));
});