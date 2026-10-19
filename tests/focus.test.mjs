import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer as tcpServer} from 'node:net';
import {focusCards,focusLibrary,getFocusCard} from '../public/focus-library.mjs';

async function port(){const s=tcpServer();s.listen(0,'127.0.0.1');await once(s,'listening');const n=s.address().port;s.close();await once(s,'close');return n;}
let child,base;
before(async()=>{
 const p=await port();base=`http://127.0.0.1:${p}`;
 child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,HOST:'127.0.0.1',PORT:String(p),HF_SESSION_SECRET:randomBytes(32).toString('hex')},stdio:'ignore'});
 for(let attempt=0;attempt<120;attempt++) {try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,30));}
 throw Error('Server did not start');
});
after(()=>child?.kill());

test('FOCUS provides six original bilingual activities with concrete offscreen instructions',()=>{
 assert.equal(focusLibrary.length,6);
 assert.equal(new Set(focusLibrary.map(x=>x.id)).size,6);
 for(const locale of ['fr','en']){
  const cards=focusCards(locale);assert.equal(cards.length,6);
  for(const card of cards){
   for(const key of ['title','subtitle','material','duration'])assert.ok(typeof card[key]==='string'&&card[key].length>10,`${card.id}:${locale}:${key}`);
   assert.equal(card.steps.length,3,`${card.id}:${locale}:steps`);
   assert.equal(card.reflect.length,3,`${card.id}:${locale}:reflect`);
   for(const line of [...card.steps,...card.reflect])assert.ok(line.length>=12, `${card.id}:${locale}:instruction too short`);
   assert.equal(getFocusCard(card.id,locale)?.id,card.id);
  }
 }
 assert.equal(getFocusCard('not-an-exercise'),null);
});

test('FOCUS public routes work with and without a language query, without any new session',async()=>{
 for(const url of ['/focus','/focus?lang=en','/focus.html?lang=fr','/focus.js','/focus.css','/focus-library.mjs']){
  const r=await fetch(base+url);assert.equal(r.status,200,url);const body=await r.text();assert.ok(body.length>100,url);
  assert.equal(r.headers.get('x-frame-options'),'DENY');
  assert.ok(r.headers.get('content-security-policy')?.includes("default-src 'none'"));
  assert.equal(r.headers.get('set-cookie'),null,url);
 }
 const before=await fetch(base+'/api/session');assert.equal((await before.json()).stage,'idle');
 const secret=await fetch(base+'/server/session-crypto.mjs');assert.equal(secret.status,404);
});

test('FOCUS client sends no user notes, does not save texts and has no time pressure',async()=>{
 const client=await readFile(new URL('../public/focus.js',import.meta.url),'utf8');
 const page=await readFile(new URL('../public/focus.html',import.meta.url),'utf8');
 for(const pattern of [/\bfetch\s*\(/,/\bXMLHttpRequest\b/,/\bWebSocket\b/,/\bsendBeacon\b/,/\b(?:window\.)?(?:localStorage|sessionStorage)\s*[.\[]/,/\bsetInterval\s*\(/,/\bsetTimeout\s*\(/,/\bindexedDB\b/i]){
  // Privacy principles may be discussed in comments, but no API invocations are allowed.
  assert.ok(!pattern.test(client),`Forbidden client capability: ${pattern}`);
 }
 assert.ok(page.includes('id="focus-adult-check"'));
 assert.ok(client.includes("if(!$('focus-adult-check').checked)"));
 assert.ok(page.includes('maxlength="280"'));
 assert.ok(page.includes('maxlength="1000"'));
 assert.ok(client.includes("$('focus-intention').value='';"));
 assert.ok(client.includes("$('focus-reflection').value='';"));
 assert.ok(!page.includes('action="https://'));
});

test('FOCUS page is reachable from the THINK FIRST homepage',async()=>{
 const page=await (await fetch(base+'/')).text();
 assert.ok(page.includes('id="focus-nav-link"'));
 assert.ok(page.includes('id="focus-hero-link"'));
 assert.ok(page.includes('/focus?lang=fr'));
});
test('V0.5 integration preserves the current twenty THINK challenges and no premature LEARN link',async()=>{
 const response=await fetch(base+'/api/catalog?lang=fr');
 assert.equal(response.status,200);
 const catalog=await response.json();
 assert.equal(catalog.exercises.length,20);
 const page=await (await fetch(base+'/focus')).text();
 assert.ok(!page.includes('href="/learn"'),'LEARN will be introduced in V0.6');
 const homepage=await (await fetch(base+'/')).text();
 assert.ok(homepage.includes('id="domain-filters"'),'existing domain filters preserved');
 assert.ok(homepage.includes('id="level-filter"'),'existing difficulty filter preserved');
 assert.ok(homepage.includes('id="offscreen-card"'),'existing offline card preserved');
});
