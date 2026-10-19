import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';

let child, base;
const testKey=randomBytes(32).toString('hex');
const cookieJar=new Map();
async function freePort() {
  const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');
  const port=server.address().port;server.close();await once(server,'close');return port;
}
before(async()=>{
  const port=await freePort();base=`http://127.0.0.1:${port}`;
  child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',HF_SESSION_SECRET:testKey},stdio:'ignore'});
  for(let i=0;i<90;i++){
    if(child.exitCode!==null) throw new Error('Serveur arrêté au démarrage');
    try{const r=await fetch(base+'/api/health');if(r.ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,35));
  }
  throw new Error('Serveur indisponible');
});
after(()=>{child?.kill();});

async function request(path,{method='GET',data,session,origin,host}={}) {
  const headers={};
  if(method!=='GET'){headers['Content-Type']='application/json';headers['X-Think-First']='1';}
  if(session){const current=cookieJar.has(session)?cookieJar.get(session):session;if(current)headers.Cookie=`hf_session=${current}`;}
  if(origin)headers.Origin=origin;
  const res=await fetch((host||base)+path,{method,headers,...(data!==undefined?{body:JSON.stringify(data)}:{})});
  const json=await res.json();
  const setCookie=res.headers.get('set-cookie');
  const cookie=setCookie?.match(/hf_session=([^;]+)/)?.[1];
  if(session&&setCookie?.includes('hf_session='))cookieJar.set(session,cookie||null);
  return {status:res.status,body:json,headers:res.headers,cookie};
}
async function start(id='causalite') {
  const res=await request('/api/session/start',{method:'POST',data:{exerciseId:id,adult:true}});
  assert.equal(res.status,200);assert.ok(res.cookie);cookieJar.set(res.cookie,res.cookie);return res;
}

test('santé : services IA et recherche désactivés',async()=>{
  const res=await request('/api/health');
  assert.equal(res.status,200);assert.equal(res.body.research,'disabled');assert.equal(res.body.ai,'disabled');
});
test('catalogue n’expose ni solutions, ni transferts, ni barèmes',async()=>{
  const r=await request('/api/catalog');assert.equal(r.status,200);assert.equal(r.body.exercises.length,9);
  const text=JSON.stringify(r.body);
  for(const secret of ['Après l’ouverture d’une bibliothèque','dauphins ou des baleines','"explanation"','"review"','"transfer"']) assert.ok(!text.includes(secret),`Secret exposé : ${secret}`);
});
test('contrôle adulte et header anti-CSRF',async()=>{
  const noAdult=await request('/api/session/start',{method:'POST',data:{exerciseId:'causalite',adult:false}});
  assert.equal(noAdult.status,400);
  const noHeader=await fetch(base+'/api/session/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({exerciseId:'causalite',adult:true})});
  assert.equal(noHeader.status,403);
  const origin=await request('/api/session/start',{method:'POST',data:{exerciseId:'causalite',adult:true},origin:'https://danger.invalid'});
  assert.equal(origin.status,403);
});
test('parcours complet : essai, 3 indices, explication, transfert, bilan',async()=>{
  const started=await start();const session=started.cookie;
  assert.equal(started.body.stage,'training');assert.ok(started.body.training.prompt);
  assert.ok(!JSON.stringify(started.body).includes('Après l’ouverture d’une bibliothèque'));
  assert.equal(started.body.revealedHints.length,0);
  assert.equal(started.body.training.hints,undefined);
  assert.equal(started.body.training.guide,undefined);
  const forbidden=await request('/api/session/transfer',{method:'POST',session,data:{}});
  assert.equal(forbidden.status,409);
  const beforeAttempt=await request('/api/session/hint',{method:'POST',session,data:{}});
  assert.equal(beforeAttempt.status,409);
  const attempt=await request('/api/session/attempt',{method:'POST',session,data:{answer:'Je ne peux pas être certain sans comparaison.'}});
  assert.equal(attempt.status,200);assert.equal(attempt.body.attempted,true);
  const labels=[];
  for(let i=1;i<=3;i++){
    const hint=await request('/api/session/hint',{method:'POST',session,data:{}});
    assert.equal(hint.status,200);assert.equal(hint.body.hintsUsed,i);assert.equal(hint.body.revealedHints.length,i);labels.push(hint.body.revealedHints.at(-1));
  }
  assert.equal(new Set(labels).size,3);
  const exhausted=await request('/api/session/hint',{method:'POST',session,data:{}});assert.equal(exhausted.status,409);
  const explanation=await request('/api/session/explanation',{method:'POST',session,data:{}});
  assert.equal(explanation.status,200);assert.equal(explanation.body.stage,'explanation');
  assert.ok(explanation.body.explanation.includes('relation causale'));
  const transfer=await request('/api/session/transfer',{method:'POST',session,data:{}});
  assert.equal(transfer.status,200);assert.equal(transfer.body.stage,'transfer');
  assert.equal(transfer.body.revealedHints,undefined);
  assert.ok(transfer.body.transfer.includes('bibliothèque'));
  for (const leak of ['review','example','explication','explanation','solution']) assert.ok(!(leak in transfer.body),`Fuite d'une propriété ${leak}`);
  assert.ok(!JSON.stringify(transfer.body).includes('villes similaires'));
  const repeat=await request('/api/session',{session});
  assert.equal(repeat.body.stage,'transfer');assert.ok(!JSON.stringify(repeat.body).includes('villes similaires'));
  const final=await request('/api/session/answer',{method:'POST',session,data:{answer:'Je ne peux pas conclure à la cause; il faudrait comparer des villes proches.'}});
  assert.equal(final.status,200);assert.equal(final.body.stage,'finished');assert.equal(final.body.reflection.review.length,3);
  assert.equal(final.body.summary.hintsUsed,3);
  const noMore=await request('/api/session/hint',{method:'POST',session,data:{}});
  assert.equal(noMore.status,409);
  const reset=await request('/api/session/reset',{method:'POST',session,data:{}});
  assert.equal(reset.status,200);
  const gone=await request('/api/session',{session});assert.equal(gone.body.stage,'idle');
});
test('accès direct à l’explication, transfert sans aide, fin volontaire',async()=>{
  const started=await start('deduction');const session=started.cookie;
  const explanation=await request('/api/session/explanation',{method:'POST',session,data:{}});
  assert.equal(explanation.status,200);
  const transfer=await request('/api/session/transfer',{method:'POST',session,data:{}});
  assert.equal(transfer.status,200);assert.ok(!('training' in transfer.body));
  const blocked=await request('/api/session/explanation',{method:'POST',session,data:{}});
  assert.equal(blocked.status,409);
  const result=await request('/api/session/answer',{method:'POST',session,data:{skip:true}});
  assert.equal(result.status,200);assert.equal(result.body.stage,'finished');assert.equal(result.body.summary.assistance,'explication directe');
});
test('entêtes sûrs, pas de fichier serveur accessible',async()=>{
  const res=await fetch(base+'/');assert.equal(res.status,200);
  assert.ok(res.headers.get('content-security-policy')?.includes("default-src 'none'"));
  assert.equal(res.headers.get('x-frame-options'),'DENY');
  const secret=await fetch(base+'/server/catalog.mjs');assert.equal(secret.status,404);
  const content=await secret.text();assert.ok(!content.includes('dauphins'));
});
test('saisie très longue tronquée et affichage serveur neutre',async()=>{
  const started=await start('moyenne');
  const answer=await request('/api/session/attempt',{method:'POST',session:started.cookie,data:{answer:'x'.repeat(2400)}});
  assert.equal(answer.status,200);assert.equal(answer.body.attempt.length,2000);
});
test('session différente ne donne pas les réponses de l’autre',async()=>{
  const a=await start();const b=await start('deduction');
  await request('/api/session/explanation',{method:'POST',session:a.cookie,data:{}});
  const unrelated=await request('/api/session',{session:b.cookie});
  assert.equal(unrelated.body.stage,'training');assert.equal(unrelated.body.exercise.id,'deduction');
  assert.ok(!('explanation' in unrelated.body));
});

test('catalogue bilingue : contenu EN distinct, secrets jamais exposés',async()=>{
  const r=await request('/api/catalog?lang=en');
  assert.equal(r.status,200);assert.equal(r.body.locale,'en');
  assert.equal(r.body.exercises[0].title,'Cause or coincidence?');
  assert.ok(!JSON.stringify(r.body).includes('After a library opens'));
  const fallback=await request('/api/catalog?lang=de');assert.equal(fallback.body.locale,'fr');
});
test('parcours en anglais : traduction constante, indices gradués, transfert secret',async()=>{
  const opened=await request('/api/session/start',{method:'POST',data:{exerciseId:'causalite',locale:'en',adult:true}});
  assert.equal(opened.status,200);const session=opened.cookie;
  assert.equal(opened.body.locale,'en');
  assert.ok(opened.body.training.prompt.includes('study spaces'));
  assert.ok(!JSON.stringify(opened.body).includes('Imagine that something else changed'));
  const start=await request('/api/session/attempt',{method:'POST',session,data:{answer:'Maybe other factors changed.'}});
  assert.equal(start.status,200);
  let h=await request('/api/session/hint',{method:'POST',session,data:{}});
  assert.equal(h.status,200);assert.equal(h.body.revealedHints.length,1);
  assert.ok(h.body.revealedHints[0].includes('correlation'));
  assert.ok(!JSON.stringify(h.body).includes('Which comparison group'));
  h=await request('/api/session/hint',{method:'POST',session,data:{}});
  assert.equal(h.body.revealedHints.length,2);
  const resume=await request('/api/session',{session});
  assert.equal(resume.body.locale,'en');assert.equal(resume.body.revealedHints.length,2);
  await request('/api/session/explanation',{method:'POST',session,data:{}});
  const transfer=await request('/api/session/transfer',{method:'POST',session,data:{}});
  assert.ok(transfer.body.transfer.startsWith('After a library opens'));
  assert.ok(!JSON.stringify(transfer.body).includes('similar towns'));
  const final=await request('/api/session/answer',{method:'POST',session,data:{answer:'No proof of causation.'}});
  assert.ok(final.body.reflection.example.includes('cannot conclude'));
});
test('mode anglais : aucune fuite par la route front-end non publique',async()=>{
  const r=await fetch(base+'/i18n.js');assert.equal(r.status,200);
  const txt=await r.text();assert.ok(txt.includes('Your turn to think'));
  const unserved=await fetch(base+'/server/catalog.en.mjs');assert.equal(unserved.status,404);
});

test('cookie chiffré : pas de réponse utilisateur, intégrité et session expirée',async()=>{
  const opened=await start();const session=opened.cookie;
  const secret='REFLEXION_PRIVEE_NE_DOIT_PAS_ETRE_DANS_LE_COOKIE';
  const attempt=await request('/api/session/attempt',{method:'POST',session,data:{answer:secret}});
  assert.equal(attempt.body.attempt,secret);
  const cookie=cookieJar.get(session);
  assert.ok(cookie?.startsWith('v1.'));
  assert.ok(!cookie.includes(secret));
  assert.ok(!Buffer.from(cookie.slice(3),'base64url').toString('utf8').includes(secret));
  const bad=cookie.slice(0,-5)+'XXXXX';
  const tampered=await request('/api/session',{session:bad});
  assert.equal(tampered.body.stage,'idle');
  const refresh=await request('/api/session',{session});
  assert.equal(refresh.body.stage,'training');assert.equal(refresh.body.attempted,true);
  assert.equal(refresh.body.attempt,''); // The browser tab, not the cookie, keeps optional display text.
});

test('reprise entre deux processus Node distincts partageant HF_SESSION_SECRET',async()=>{
  const started=await start('deduction');const session=started.cookie;
  await request('/api/session/attempt',{method:'POST',session,data:{answer:'Première tentative.'}});
  await request('/api/session/hint',{method:'POST',session,data:{}});
  const port=await freePort();
  const second=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',HF_SESSION_SECRET:testKey},stdio:'ignore'});
  const host=`http://127.0.0.1:${port}`;
  try {
    let ok=false;
    for(let i=0;i<100;i++) {
      try{const r=await fetch(host+'/api/health');if(r.ok){ok=true;break;}}catch{}
      await new Promise(resolve=>setTimeout(resolve,30));
    }
    assert.equal(ok,true);
    const resumed=await request('/api/session',{session,host});
    assert.equal(resumed.body.stage,'training');assert.equal(resumed.body.hintsUsed,1);
    const explanation=await request('/api/session/explanation',{method:'POST',session,host,data:{}});
    assert.equal(explanation.status,200);
    const back=await request('/api/session',{session});
    assert.equal(back.body.stage,'explanation');
  }finally{second.kill();}
});

test('accueil bilingue avec paramètres d’URL et fichiers statiques disponibles',async()=>{
  for(const uri of ['/?lang=fr','/?lang=en','/index.html?lang=en','/styles.css?v=21','/app.js?v=21']) {
    const r=await fetch(base+uri);
    assert.equal(r.status,200,uri);
    assert.ok((await r.text()).length>100);
  }
});

test('aucune session chiffrée n’est activée sur Vercel sans secret',async()=>{
  const port=await freePort();const host=`http://127.0.0.1:${port}`;
  const environment={...process.env,HOST:'127.0.0.1',PORT:String(port),VERCEL:'1',NODE_ENV:'production'};
  delete environment.HF_SESSION_SECRET;
  const isolated=spawn(process.execPath,['server/index.mjs'],{env:environment,stdio:'ignore'});
  try {
    let health;
    for(let i=0;i<100;i++) {
      try{health=await fetch(host+'/api/health');break;}catch{}
      await new Promise(resolve=>setTimeout(resolve,30));
    }
    assert.ok(health);assert.equal(health.status,503);
    const detail=await health.json();assert.equal(detail.sessionsReady,false);
    const attempt=await request('/api/session/start',{host,method:'POST',data:{adult:true,exerciseId:'causalite'}});
    assert.equal(attempt.status,503);
  }finally{isolated.kill();}
});