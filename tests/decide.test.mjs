import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer as tcpServer} from 'node:net';
import {decisionStages,decisionLibrary,decideScenarios,decideScenario,reflectionPrompts} from '../public/decide-data.mjs';

const root=new URL('../public/',import.meta.url);
const file=path=>readFile(new URL(path,root),'utf8');
let processHandle=null,base='';
async function freePort(){
 const sock=tcpServer();sock.listen(0,'127.0.0.1');await once(sock,'listening');
 const n=sock.address().port;sock.close();await once(sock,'close');return n;
}
before(async()=>{
 const port=await freePort();base=`http://127.0.0.1:${port}`;
 processHandle=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',HF_SESSION_SECRET:randomBytes(32).toString('hex'),HF_AI_ENABLED:'0'},stdio:'ignore'});
 for(let i=0;i<120;i++){
  if(processHandle.exitCode!==null)throw Error('Server exited early');
  try{if((await fetch(base+'/api/health')).status===200)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,35));
 }
 throw Error('The app did not start');
});
after(()=>processHandle?.kill());

test('DECIDE: seven meaningful bilingual scenarios, no ranking or automated choice',()=>{
 assert.deepEqual(decisionStages,['frame','compare','verify','challenge','conclude']);
 assert.equal(decisionLibrary.length,7);
 assert.equal(new Set(decisionLibrary.map(x=>x.id)).size,7);
 assert.ok(new Set(decisionLibrary.map(x=>x.category)).size>=5);
 for(const language of ['fr','en']){
  const items=decideScenarios(language);assert.equal(items.length,7);
  for(const item of items){
   for(const key of ['title','short','situation','question','claim','challenge','transfer']){
    assert.ok(typeof item[key]==='string'&&item[key].length>=15,`${item.id}:${language}:${key}`);
   }
   assert.equal(item.options.length,2);
   assert.notEqual(item.options[0],item.options[1]);
   assert.ok(item.options.every(s=>s.length>=12));
   assert.equal(decideScenario(item.id,language).id,item.id);
  }
  assert.equal(reflectionPrompts(language).length,4);
 }
 assert.equal(decideScenario('does-not-exist'),null);
 assert.notEqual(decideScenario('conseil-ia','fr').claim,decideScenario('conseil-ia','en').claim);
});

test('DECIDE: website and four static assets resolve; security headers remain intact',async()=>{
 for(const resource of ['/decide','/decide?lang=en','/decide.html','/decide.js','/decide-data.mjs','/decide.css']){
  const r=await fetch(base+resource);
  assert.equal(r.status,200,resource);
  const data=await r.text();assert.ok(data.length>500,resource);
  assert.equal(r.headers.get('x-frame-options'),'DENY');
  assert.ok(r.headers.get('content-security-policy')?.includes("default-src 'none'"));
  assert.equal(r.headers.get('set-cookie'),null,resource);
 }
 assert.equal((await fetch(base+'/api/session')).status,200);
 assert.equal((await fetch(base+'/server/session-crypto.mjs')).status,404);
});

test('DECIDE: client stores no personal answers and does not call any network API',async()=>{
 const js=await file('decide.js');const html=await file('decide.html');
 // Comments document forbidden APIs without invoking them; check executable lines.
 const executable=js.replace(/^\s*\/\/.*$/gm,'');
 for(const pattern of [/\bfetch\s*\(/,/\bXMLHttpRequest\s*\(/,/\bWebSocket\s*\(/,/\bsendBeacon\s*\(/,/\b(?:localStorage|sessionStorage)\s*[.\[]/,/\bindexedDB\s*[.\[]/,/\bsetTimeout\s*\(/,/\bsetInterval\s*\(/]){
  assert.ok(!pattern.test(executable),`No DECIDE API/storage calls permitted: ${pattern}`);
 }
 assert.ok(js.includes('wipeFields();'));
 assert.ok(js.includes("$('adult-check').checked"));
 assert.ok(html.includes('id="adult-check"'));
 assert.ok(html.includes('id="exit-work"'));
 assert.ok(html.includes('id="finish-work"'));
 assert.ok(html.includes('id="print-worksheet"'));
 assert.ok(!html.includes('action="https://'));
 for(const id of decisionStages) assert.ok(html.includes(`id="stage-${id}"`));
});

test('DECIDE: public navigation works without regressing THINK, FOCUS or LEARN',async()=>{
 const [think,focus,learn]=await Promise.all([
  fetch(base+'/'),fetch(base+'/focus'),fetch(base+'/learn')
 ]);
 for(const response of [think,focus,learn])assert.equal(response.status,200);
 const home=await think.text();
 for(const id of ['domain-filters','level-filter','focus-nav-link','learn-nav-link','decide-nav-link','decide-hero-link']){
  assert.ok(home.includes(`id="${id}"`),`Missing ${id}`);
 }
 assert.ok((await focus.text()).includes('class="focus-decide-link"'));
 assert.ok((await learn.text()).includes('id="nav-decide"'));
 const catalog=await (await fetch(base+'/api/catalog?lang=fr')).json();
 assert.equal(catalog.exercises.length,20);
 const learnCatalog=await (await fetch(base+'/api/learn/catalog?lang=en')).json();
 assert.equal(learnCatalog.lessons.length,6);
});

test('DECIDE: private notes are never part of the printable worksheet and IA is only a fiction',async()=>{
 const [html,css,js]=await Promise.all([file('decide.html'),file('decide.css'),file('decide.js')]);
 assert.ok(html.includes('id="print-sheet"'));
 assert.match(css,/@media print\{/);
 assert.ok(css.includes('#work-view,footer'));
 assert.ok(css.includes('.print-sheet{display:block!important}'));
 assert.ok(js.includes("set('ai-claim',scenario.claim)"));
 assert.ok(js.includes('window.print()'));
 assert.match(html,/Aucune IA n’est appelée/);
 assert.ok(!html.includes('type="submit"'));
});