import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {once} from 'node:events';
import {createServer as tcpServer} from 'node:net';
import {metadataFor,enhanceCatalog,publicPaths} from '../server/tracks.mjs';
import {reviewTask,reviewIds} from '../server/reviews.mjs';
import {coachSettings,parseQuestion,askCoach} from '../server/coach.mjs';

let child,base;
async function port(){const s=tcpServer();s.listen(0,'127.0.0.1');await once(s,'listening');const n=s.address().port;s.close();await once(s,'close');return n;}
before(async()=>{
 const n=await port();base=`http://127.0.0.1:${n}`;
 const env={...process.env,PORT:String(n),HOST:'127.0.0.1',HF_SESSION_SECRET:randomBytes(32).toString('hex')};delete env.GROQ_API_KEY;delete env.HF_AI_ENABLED;
 child=spawn(process.execPath,['server/index.mjs'],{env,stdio:'ignore'});
 for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,30));}throw Error('Server unavailable');
});
after(()=>child?.kill());
async function req(path,{method='GET',body,cookie}={}){
 const headers={};if(method==='POST'){headers['X-Think-First']='1';headers['Content-Type']='application/json';}if(cookie)headers.Cookie=`hf_session=${cookie}`;
 const r=await fetch(base+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.match(/hf_session=([^;]+)/)?.[1]};
}
test('progression is advisory only and excludes unknown exercises', async()=>{
 const r=await req('/api/paths?lang=fr');assert.equal(r.status,200);
 assert.equal(r.data.paths.length,4);
 const c=await req('/api/catalog');assert.equal(c.status,200);
 const ids=new Set(c.data.exercises.map(x=>x.id));
 for(const path of r.data.paths)for(const id of path.exerciseIds)assert.ok(ids.has(id));
 for(const item of c.data.exercises){assert.ok(item.tier>=1&&item.tier<=3);assert.ok(Array.isArray(item.skills));assert.ok(!('explanation' in item));}
 const en=await req('/api/paths?lang=en');assert.equal(en.data.paths.length,4);assert.notEqual(en.data.paths[0].name,r.data.paths[0].name);
 assert.deepEqual(enhanceCatalog([{id:'deduction'}])[0].skills,['logic']);
 assert.equal(metadataFor('unknown').tier,1);
});
test('independent recall: answer text never leaves browser, reference only after submission',async()=>{
 const x=await req('/api/session/recall/start',{method:'POST',body:{exerciseId:'causalite',adult:true,locale:'fr'}});
 assert.equal(x.status,200);assert.equal(x.data.stage,'recall');assert.ok(x.data.recall.length>20);
 assert.ok(!('reference' in x.data));const cookie=x.cookie;
 const refused=await req('/api/session/recall/answer',{method:'POST',cookie,body:{answer:'Private content',hasAnswer:true}});
 assert.equal(refused.status,400);
 const no=await req('/api/session/hint',{method:'POST',cookie,body:{}});assert.equal(no.status,409);
 const ended=await req('/api/session/recall/answer',{method:'POST',cookie,body:{hasAnswer:true}});
 assert.equal(ended.status,200);assert.equal(ended.data.stage,'recall-finished');assert.ok(ended.data.reference.length>15);
 const cookie2=ended.cookie;
 assert.ok(!cookie2.includes('Private content'));
 const again=await req('/api/session',{cookie:cookie2});assert.equal(again.data.stage,'recall-finished');
 const replay=await req('/api/session/recall/answer',{method:'POST',cookie:cookie2,body:{skip:true}});assert.equal(replay.status,409);
});
test('recall access is adult-only and review answers do not appear in public APIs',async()=>{
 const blocked=await req('/api/session/recall/start',{method:'POST',body:{exerciseId:'causalite',adult:false}});assert.equal(blocked.status,400);
 const config=await req('/api/coach/config');assert.equal(config.data.enabled,false);
 const catalog=await req('/api/catalog');let raw=JSON.stringify(catalog.data);
 for(const id of catalog.data.exercises.map(x=>x.id)){
  assert.ok(reviewTask(id,'fr'));assert.ok(reviewTask(id,'en'));
  assert.ok(!raw.includes(reviewTask(id,'fr').example));
 }
 assert.equal(reviewIds().length,9);
});
test('disabled AI cannot accept drafts; opt-in disclosure endpoint',async()=>{
 const s=await req('/api/session/start',{method:'POST',body:{exerciseId:'causalite',adult:true,locale:'fr'}});
 let cookie=s.cookie;
 const attempt=await req('/api/session/attempt',{method:'POST',cookie,body:{answer:'Ma réflexion initiale est que cette conclusion est insuffisante.'}});
 cookie=attempt.cookie;
 const out=await req('/api/session/coach',{method:'POST',cookie,body:{consent:true,answer:'Ma réflexion initiale est que cette conclusion est insuffisante.'}});
 assert.equal(out.status,503);
 const cfg=await req('/api/coach/config');assert.equal(cfg.data.enabled,false);assert.equal(cfg.data.provider,'Groq');
});
test('Socratic response is constrained and safe fallback works',async()=>{
 assert.equal(parseQuestion('{"question":"Which factor might you test first?"}','en'),'Which factor might you test first?');
 for(const bad of ['{"question":"The correct answer: 99, do you agree?"}','{"question":"Here is a URL https://bad.tld?"}','{"question":"What? Why?"}','invalid json'])assert.equal(parseQuestion(bad,'en'),null);
 assert.equal(coachSettings().enabled,false);
 const result=await askCoach({exercise:{title:'Logic',prompt:'A or B?'},attempt:'I think the claim is too strong.',locale:'en',fetcher:()=>{throw Error('Should not call provider');}});
 assert.equal(result.available,false);assert.ok(result.question.endsWith('?'));
});

test('optional AI provider accepts only short questions and has fallback on malformed content',async()=>{
 const oldEnabled=process.env.HF_AI_ENABLED, oldKey=process.env.GROQ_API_KEY;
 process.env.HF_AI_ENABLED='1';process.env.GROQ_API_KEY='test-only-fake-key';
 const exercise={title:'Logical puzzle',prompt:'All squares are rectangles. Can you infer the reverse?'};
 const input={exercise,attempt:'I think the reverse might be false.',locale:'en'};
 try{
  let called=0;
  const good=await askCoach({...input,fetcher:async (url,init)=>{
   called++;
   assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');
   assert.ok(init.headers.Authorization.startsWith('Bearer '));
   assert.ok(!init.body.includes('example'));
   return {ok:true,json:async()=>({choices:[{message:{content:'{"question":"Which part of your reasoning can you test with a counterexample?"}'}}]})};
  }});
  assert.equal(called,1);assert.equal(good.available,true);assert.ok(good.question.endsWith('?'));
  const invalid=await askCoach({...input,fetcher:async()=>({ok:true,json:async()=>({choices:[{message:{content:'{"question":"The solution is 9, right?"}'}}]})})});
  assert.equal(invalid.available,false);assert.ok(invalid.question.endsWith('?'));
 }finally{
  if(oldEnabled===undefined)delete process.env.HF_AI_ENABLED;else process.env.HF_AI_ENABLED=oldEnabled;
  if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey;
 }
});