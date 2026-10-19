import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer as tcpServer} from 'node:net';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {syllabus,getLesson,lessonIds,lessonForStage} from '../server/learn-catalog.mjs';
let app,base;
async function freePort(){const srv=tcpServer();srv.listen(0,'127.0.0.1');await once(srv,'listening');const port=srv.address().port;srv.close();await once(srv,'close');return port;}
before(async()=>{
 const port=await freePort();base=`http://127.0.0.1:${port}`;
 app=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',HF_SESSION_SECRET:randomBytes(32).toString('hex')},stdio:'ignore'});
 for(let i=0;i<130;i++){
  try{if((await fetch(base+'/api/health')).ok)return;}catch{}
  await new Promise(r=>setTimeout(r,40));
 }throw Error('LEARN server did not start');
});
after(()=>app?.kill());
async function req(path,{body,method='GET',cookie,headers={}}={}){
 const opts={method,headers:{...(method==='POST'?{'Content-Type':'application/json','X-Think-First':'1'}:{}),...headers}};
 if(cookie)opts.headers.Cookie=cookie;
 if(body!==undefined)opts.body=JSON.stringify(body);
 const r=await fetch(base+path,opts);
 const data=await r.json();const rawCookie=r.headers.get('set-cookie');
 return {status:r.status,data,rawCookie,cookie:rawCookie?.split(';')[0]};
}
async function start(id='evidence',locale='fr',mode='study'){
 const s=await req('/api/learn/start',{method:'POST',body:{adult:true,lessonId:id,locale,mode}});
 assert.equal(s.status,200);assert.ok(s.cookie.startsWith('hf_learn='));return s;
}
test('LEARN: six editorially complete FR/EN lessons and honest syllabus',()=>{
 assert.equal(lessonIds().length,6);assert.equal(new Set(lessonIds()).size,6);
 for(const lang of ['fr','en']){
  const course=syllabus(lang);assert.equal(course.length,6);
  for(const entry of course){
   const full=getLesson(entry.id,lang);assert.ok(full);
   assert.equal(full.sections.length,3);
   for(const block of full.sections){assert.ok(block.heading.length>9);assert.ok(block.text.length>75);}
   assert.equal(full.rubric.length,3);
   assert.ok(full.feedback.length>80);assert.ok(full.transferReference.length>80);assert.notEqual(full.recall,full.transfer);
   assert.ok(full.offline.length>30);assert.ok(!('feedback' in entry));assert.ok(!('transferReference' in entry));
   assert.deepEqual(Object.keys(lessonForStage(full,'learn-recall')).sort(),['domain','id','locale','objective','recall','stage','tier','title','version'].sort());
  }
 }
});
test('LEARN: GET API syllabus exposes only titles, prerequisites and goals',async()=>{
 for(const lang of ['fr','en']){
  const x=await req('/api/learn/catalog?lang='+lang);assert.equal(x.status,200);assert.equal(x.data.locale,lang);
  assert.equal(x.data.lessons.length,6);
  const payload=JSON.stringify(x.data);
  for(const lesson of x.data.lessons){const full=getLesson(lesson.id,lang);
   for(const secret of [full.recall,full.feedback,full.transfer,full.transferReference,full.offline])assert.equal(payload.includes(secret),false);
  }
 }
 const fallback=await req('/api/learn/catalog?lang=unknown');assert.equal(fallback.data.locale,'fr');
});
test('LEARN: adult declaration, anti-CSRF and invalid ID/mode',async()=>{
 assert.equal((await req('/api/learn/start',{method:'POST',body:{adult:false,lessonId:'evidence'}})).status,400);
 assert.equal((await req('/api/learn/start',{method:'POST',body:{adult:true,lessonId:'unknown'}})).status,404);
 assert.equal((await req('/api/learn/start',{method:'POST',body:{adult:true,lessonId:'evidence',mode:'debug'}})).status,400);
 assert.equal((await req('/api/learn/start',{method:'POST',body:{adult:true,lessonId:'evidence'},headers:{'X-Think-First':'0'}})).status,403);
 assert.equal((await req('/api/learn/start',{method:'POST',body:{adult:true,lessonId:'evidence'},headers:{Origin:'https://evil.example'}})).status,403);
});
test('LEARN: full study → private recall → feedback → transfer → finish, strict stage gates',async()=>{
 const startData=await start('causality','fr');let cookie=startData.cookie;
 assert.equal(startData.data.stage,'learn-study');assert.equal(startData.data.sections.length,3);
 assert.ok(!('recall' in startData.data));assert.ok(!('feedback' in startData.data));assert.ok(!('transfer' in startData.data));
 assert.equal((await req('/api/learn/finish',{method:'POST',cookie,body:{hasAnswer:true}})).status,409);
 const recalled=await req('/api/learn/study-done',{method:'POST',cookie,body:{}});assert.equal(recalled.status,200);cookie=recalled.cookie;
 assert.equal(recalled.data.stage,'learn-recall');assert.ok(recalled.data.recall);
 assert.ok(!('feedback' in recalled.data));assert.ok(!('transfer' in recalled.data));
 assert.ok(!('transferReference' in recalled.data));assert.ok(!('sections' in recalled.data));
 assert.equal((await req('/api/learn/recall-done',{method:'POST',cookie,body:{hasAnswer:true,answer:'PRIVATE_DEMO_TEXT'}})).status,400);
 assert.equal((await req('/api/learn/recall-done',{method:'POST',cookie,body:{text:'PRIVATE_DEMO_TEXT',hasAnswer:true}})).status,400);
 assert.equal((await req('/api/learn/recall-done',{method:'POST',cookie,body:{}})).status,400);
 const feedback=await req('/api/learn/recall-done',{method:'POST',cookie,body:{hasAnswer:true}});assert.equal(feedback.status,200);cookie=feedback.cookie;
 assert.equal(feedback.data.stage,'learn-feedback');assert.equal(feedback.data.rubric.length,3);assert.ok(feedback.data.feedback);
 assert.equal(feedback.data.recalled,true);assert.ok(!('transfer' in feedback.data));
 const before=await req('/api/learn/session',{cookie});assert.equal(before.data.stage,'learn-feedback');assert.ok(!('transfer' in before.data));
 const transfer=await req('/api/learn/apply',{method:'POST',cookie,body:{}});assert.equal(transfer.status,200);cookie=transfer.cookie;
 assert.equal(transfer.data.stage,'learn-apply');assert.ok(transfer.data.transfer);
 assert.equal(transfer.data.transferReference,undefined);assert.equal(transfer.data.rubric,undefined);
 assert.equal((await req('/api/learn/finish',{method:'POST',cookie,body:{answer:'PRIVATE_DEMO_TEXT',hasAnswer:true}})).status,400);
 const done=await req('/api/learn/finish',{method:'POST',cookie,body:{hasAnswer:true}});assert.equal(done.status,200);cookie=done.cookie;
 assert.equal(done.data.stage,'learn-finished');assert.equal(done.data.completed,true);
 assert.ok(done.data.offline);assert.ok(done.data.transferReference);
 assert.equal((await req('/api/learn/finish',{method:'POST',cookie,body:{skip:true}})).status,409);
 assert.equal((await req('/api/learn/reset',{method:'POST',cookie,body:{}})).status,200);
 assert.equal((await req('/api/learn/session',{cookie:'hf_learn='})).data.stage,'idle');
});
test('LEARN: optional direct-review starts without study and cannot reveal transfer prematurely',async()=>{
 const opened=await start('retrieve','en','review');let cookie=opened.cookie;
 assert.equal(opened.data.stage,'learn-recall');assert.ok(opened.data.recall.includes('Without rereading'));
 assert.equal(opened.data.sections,undefined);assert.equal(opened.data.feedback,undefined);
 const no=await req('/api/learn/study-done',{method:'POST',cookie,body:{}});assert.equal(no.status,409);
 const result=await req('/api/learn/recall-done',{method:'POST',cookie,body:{skip:true}});
 assert.equal(result.data.stage,'learn-feedback');assert.equal(result.data.recalled,false);
});
test('LEARN: encrypted cookie cannot be modified, does not include learning notes',async()=>{
 const opened=await start();const secret='PRIVATE_ANSWERS_ARE_BROWSER_ONLY';assert.ok(!opened.cookie.includes(secret));
 const token=opened.cookie.split('=')[1];assert.ok(token.startsWith('v1.'));
 const bad=opened.cookie.slice(0,-10)+'abcdefghiZ';
 assert.equal((await req('/api/learn/session',{cookie:bad})).data.stage,'idle');
 assert.equal((await req('/api/learn/session',{cookie:opened.cookie})).data.stage,'learn-study');
});
test('LEARN and THINK sessions use different cookies',async()=>{
 const think=await req('/api/session/start',{method:'POST',body:{adult:true,exerciseId:'moyenne'}});
 const learn=await start('averages');assert.ok(think.cookie.startsWith('hf_session='));
 const combined=think.cookie+'; '+learn.cookie;
 assert.equal((await req('/api/learn/session',{cookie:combined})).data.stage,'learn-study');
 assert.equal((await req('/api/session',{cookie:combined})).data.stage,'training');
});
test('LEARN routes and source boundary: private lessons never served as static files',async()=>{
 for(const path of ['/learn','/learn.html','/learn.js','/learn.css']){
  const res=await fetch(base+path);assert.equal(res.status,200,path);
  assert.ok((await res.text()).length>500);
 }
 const source=await fetch(base+'/server/learn-catalog.mjs');assert.equal(source.status,404);
 const head=await fetch(base+'/learn');assert.ok(head.headers.get('content-security-policy').includes("default-src 'none'"));
});

test('LEARN integration preserves twenty THINK challenges and FOCUS navigation',async()=>{
 const c=await req('/api/catalog?lang=fr');
 assert.equal(c.status,200);
 assert.equal(c.data.exercises.length,20);
 const focus=await fetch(base+'/focus');
 assert.equal(focus.status,200);
 const focusHtml=await focus.text();
 assert.ok(focusHtml.includes('class="focus-learn-link"'));
 const library=await fetch(base+'/focus-library.mjs');
 assert.equal(library.status,200);
 const home=await fetch(base+'/');
 const page=await home.text();
 for(const id of ['domain-filters','level-filter','focus-nav-link','learn-nav-link','focus-hero-link','learn-hero-link','offscreen-card']){
  assert.ok(page.includes('id="'+id+'"'),id+' missing from current home');
 }
 const learnPage=await (await fetch(base+'/learn')).text();
 assert.ok(learnPage.includes('id="catalog-screen"'));
});

test('LEARN and THINK cookies cannot impersonate one another',async()=>{
 const l=await start('evidence');
 const t=await req('/api/session/start',{method:'POST',body:{adult:true,exerciseId:'moyenne'}});
 assert.equal(t.status,200);
 assert.equal((await req('/api/learn/session',{cookie:t.cookie})).data.stage,'idle');
 assert.equal((await req('/api/session',{cookie:l.cookie})).data.stage,'idle');
});
