import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer as tcp} from 'node:net';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {createRegistry} from '../public/journey/engine.mjs';
import {installedPacks} from '../public/journey/packs.mjs';
import {
 STUDIO_SCHEMA,REVIEW_CHECKS,makeDocument,renamePack,editDraft,validateDocument,
 requestReview,approveDocument,reopenDraft,publishDocument,nextDraft,
 exportPack,exportStudioDocument,importForEditing,previewDocument
} from '../public/studio/model.mjs';
const author='Rédacteur Alpha',reviewer='Relectrice Bêta';
const valid=()=>{const d=makeDocument({id:'hospitalite',author});d.meta.sourceNote='Contenu pédagogique original et créé pour la démonstration HUMAN FIRST.';return d;};
function approved(){const first=valid();const review=requestReview(first,installedPacks,author);return approveDocument(review,{reviewer,checks:[...REVIEW_CHECKS]},author);}

test('Studio: pack initial extends existing registry; four complete pillars and mandatory provenance schema',()=>{
 const doc=valid();const check=validateDocument(doc,installedPacks);
 assert.equal(check.ok,true,check.errors.join(' | '));
 assert.equal(check.stats.competencies,1);assert.equal(check.stats.pathways,1);
 assert.equal(doc.schema,STUDIO_SCHEMA);assert.equal(doc.meta.agePolicy,'18+');
 assert.deepEqual(Object.keys(doc.pack.competencies[0].activities).sort(),['decide','focus','learn','think']);
});
test('Studio: changes are immutable value transitions, namespaced IDs rename dependencies and targets',()=>{
 const doc=valid(),old=JSON.stringify(doc);
 const edited=renamePack(doc,'service',author);
 assert.equal(doc.pack.id,'hospitalite');assert.equal(JSON.stringify(doc),old);
 assert.equal(edited.pack.id,'service');assert.equal(edited.pack.competencies[0].id,'service.analyser-besoin');
 assert.equal(edited.pack.pathways[0].competencyIds[0],'service.analyser-besoin');
 assert.equal(validateDocument(edited,installedPacks).ok,true);
 const r=editDraft(edited,{meta:{territory:'Togo',occupationTags:['hospitality','service'] }},author);
 assert.deepEqual(r.meta.occupationTags,['hospitality','service']);assert.equal(r.meta.territory,'Togo');
 assert.equal(doc.meta.territory,'international');
});
test('Studio: malformed curricula, duplicate IDs, and missing links fail before publication',()=>{
 const doc=valid();const corrupted=structuredClone(doc);
 corrupted.pack.competencies[0].requires=['hospitalite.analyser-besoin'];
 assert.equal(validateDocument(corrupted,installedPacks).ok,false);
 corrupted.pack.competencies[0].requires=['unknown.skill'];
 assert.equal(validateDocument(corrupted,installedPacks).ok,false);
 corrupted.pack.competencies[0].requires=[];
 corrupted.pack.pathways[0].competencyIds=['unknown.skill'];
 assert.equal(validateDocument(corrupted,installedPacks).ok,false);
 corrupted.pack.pathways[0].competencyIds=['hospitalite.analyser-besoin'];
 corrupted.pack.competencies[0].activities.think.en='';
 assert.equal(validateDocument(corrupted,installedPacks).ok,false);
});
test('Studio: incomplete editorial metadata or missing pathways blocks publication',()=>{
 const doc=valid();doc.meta.license='invalid';
 assert.equal(validateDocument(doc,installedPacks).ok,false);
 doc.meta.license='CC-BY-4.0';doc.meta.agePolicy='10-18';
 assert.equal(validateDocument(doc,installedPacks).ok,false);
 doc.meta.agePolicy='18+';doc.pack.pathways=[];
 assert.equal(validateDocument(doc,installedPacks).ok,false);
});
test('Studio: only draft can be submitted; review requires six checks and different reviewer',()=>{
 const doc=valid();assert.throws(()=>approveDocument(doc,{reviewer,checks:REVIEW_CHECKS},author));
 const inReview=requestReview(doc,installedPacks,author);
 assert.equal(inReview.status,'in-review');assert.equal(doc.status,'draft');
 assert.throws(()=>requestReview(inReview,installedPacks,author));
 assert.throws(()=>editDraft(inReview,{meta:{sourceNote:'changed'}},author));
 assert.throws(()=>approveDocument(inReview,{reviewer:author,checks:REVIEW_CHECKS},author));
 assert.throws(()=>approveDocument(inReview,{reviewer,checks:['accuracy']},author));
 const a=approveDocument(inReview,{reviewer,checks:[...REVIEW_CHECKS]},author);
 assert.equal(a.status,'approved');assert.ok(a.review.approvedAt);
});
test('Studio: published snapshot is frozen by workflow; immutable versions and explicit new draft',()=>{
 const a=approved();assert.throws(()=>exportPack(a,installedPacks));
 const released=publishDocument(a,installedPacks,author);
 assert.equal(released.status,'published');assert.equal(a.status,'approved');
 assert.throws(()=>editDraft(released,{pack:released.pack},author));
 assert.throws(()=>publishDocument(released,installedPacks,author));
 assert.throws(()=>nextDraft(released,'1.0.0',author));
 const draft=nextDraft(released,'1.0.1',author);
 assert.equal(draft.status,'draft');assert.equal(draft.pack.version,'1.0.1');
 assert.equal(released.pack.version,'1.0.0');
 assert.equal(draft.review.reviewer,'');
});
test('Studio: published curriculum is compatible with existing JOURNEY and carries explicit license/provenance',()=>{
 const a=approved(),released=publishDocument(a,installedPacks,author),exported=JSON.parse(exportPack(released,installedPacks));
 assert.equal(exported.hfStudio.license,'CC-BY-4.0');
 assert.equal(exported.hfStudio.certification,'none');
 assert.equal(exported.hfStudio.reviewerIdentityVerified,false);
 assert.equal(exported.hfStudio.publication,'local-only');
 assert.equal(exported.id,'hospitalite');
 const reg=createRegistry([...installedPacks,exported]);
 assert.equal(reg.paths.has('hospitalite.premier-parcours'),true);
 assert.equal(reg.skills.has('hospitalite.analyser-besoin'),true);
});
test('Studio: import resets reviews, does not trust a self-described released state, rejects arbitrary executable JSON',()=>{
 const pub=publishDocument(approved(),installedPacks,author);
 const imported=importForEditing(exportStudioDocument(pub),{author});
 assert.equal(imported.status,'draft');assert.equal(imported.review.reviewer,'');
 assert.equal(imported.pack.id,pub.pack.id);
 assert.equal(imported.meta.license,pub.meta.license);
 assert.equal(importForEditing(exportPack(pub,installedPacks),{author}).meta.license,'CC-BY-4.0');
 assert.throws(()=>importForEditing('{invalid}',{author}),/JSON/);
 assert.throws(()=>importForEditing(JSON.stringify({schema:'unknown'}),{author}));
 assert.throws(()=>importForEditing('x'.repeat(500_001),{author}));
});
test('Studio: preview is ordered via the validated prerequisite graph',()=>{
 const result=previewDocument(valid(),installedPacks);
 assert.equal(result.pathway.id,'hospitalite.premier-parcours');
 const ids=result.plan.map(x=>x.skillId);
 assert.deepEqual(ids,['core.evidence','hospitalite.analyser-besoin']);
 assert.equal(result.principles.graded,false);assert.equal(result.principles.mandatorySchedule,false);
});
test('Studio: editorial metadata never includes learner answers, identities or assessment score fields',()=>{
 const exported=exportStudioDocument(valid());
 for(const bad of ['password','birthDate','studentEmail','sessionToken','answerText','assessmentScore'])
   assert.ok(!Object.hasOwn(JSON.parse(exported),bad));
});
const root=dirname(fileURLToPath(import.meta.url));
let server,host;
before(async()=>{
 const s=tcp();s.listen(0,'127.0.0.1');await once(s,'listening');const port=s.address().port;s.close();await once(s,'close');host='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/index.mjs'],{cwd:join(root,'..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',HF_SESSION_SECRET:randomBytes(32).toString('hex')},stdio:'ignore'});
 for(let i=0;i<140;i++){
  if(server.exitCode!==null)throw Error('Studio test server exited');
  try{if((await fetch(host+'/api/health')).ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,35));
 }
 throw Error('Studio test server did not start');
});
after(()=>server?.kill());
test('Studio: explicit static assets use security headers, unknown paths remain private',async()=>{
 for(const path of ['/studio','/studio.html','/studio/studio.css','/studio/app.mjs','/studio/model.mjs']){
  const res=await fetch(host+path);assert.equal(res.status,200,path);
  assert.ok((await res.text()).length>200,path);
  assert.equal(res.headers.get('x-content-type-options'),'nosniff');
  assert.ok(res.headers.get('content-security-policy').includes("default-src 'none'"));
 }
 const disallowed=await fetch(host+'/migrations/0001_content_studio.sql');assert.equal(disallowed.status,404);
});
test('Studio: page has accessible editor, source controls, age gate and review status',async()=>{
 const html=await (await fetch(host+'/studio')).text();
 for(const id of ['adult','author','editor-form','skills','paths','request-review','review-checks','approval-panel','publish','import','save-draft','preview-panel'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('déclaratives, non authentifiées'));
});
test('Studio: all 4 pillars and JOURNEY still accessible without modifying endpoints',async()=>{
 for(const path of ['/','/focus','/learn','/decide','/journey']){const r=await fetch(host+path);assert.equal(r.status,200,path);}
 const catalog=await (await fetch(host+'/api/catalog?lang=fr')).json();assert.equal(catalog.exercises.length,20);
 const learn=await (await fetch(host+'/api/learn/catalog?lang=en')).json();assert.equal(learn.lessons.length,6);
});