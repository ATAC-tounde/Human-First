import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {createServer as netServer} from 'node:net';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {installedPacks} from '../public/journey/packs.mjs';
import {createRegistry,buildJourney,normalizeProfile,exportPortfolio,importPortfolio,
  registryPublicStats,PROGRESS_EVENTS,normalizeEvidence} from '../public/journey/engine.mjs';

const registry=createRegistry(installedPacks);
const user={adult:true,locale:'fr',pathId:'work.quality',stage:'work',ageBand:'25-39',qualification:'Master',occupation:'QA'};
const source=new URL('../public/journey/app.mjs',import.meta.url);
let child,origin;
async function freePort(){const s=netServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;s.close();await once(s,'close');return p;}
before(async()=>{
 const port=await freePort();origin=`http://127.0.0.1:${port}`;
 child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',HF_SESSION_SECRET:randomBytes(32).toString('hex'),HF_AI_ENABLED:'0'},stdio:'ignore'});
 for(let i=0;i<120;i++){
   try{if((await fetch(origin+'/api/health')).ok)return;}catch{}
   if(child.exitCode!==null)throw Error('Test server exited');
   await new Promise(r=>setTimeout(r,40));
 }
 throw Error('Test server did not start');
});
after(()=>child?.kill());

test('V0.8: versioned modular registry covers four pillars, five pathways and bilingual content',()=>{
 const stats=registryPublicStats(registry);
 assert.deepEqual([stats.packs,stats.competencies,stats.pathways],[4,12,5]);
 for(const skill of registry.skills.values()){
   for(const lang of ['fr','en']){
     assert.ok(skill.title[lang].length>7);
     assert.ok(skill.outcome[lang].length>7);
     for(const pillar of ['think','focus','learn','decide'])assert.ok(skill.activities[pillar][lang].length>18);
   }
 }
 for(const p of registry.paths.values()){
   assert.ok(p.title.fr && p.title.en && p.competencyIds.length);
 }
});

test('V0.8: extend registry with an entirely new profession pack without changing engine',()=>{
 const extension={id:'aerospace',version:'2.1.0',title:{fr:'Qualité aérospatiale',en:'Aerospace quality'},competencies:[{
   id:'aerospace.trace',title:{fr:'Analyser la traçabilité',en:'Review traceability'},outcome:{fr:'Relier preuves et exigences critiques',en:'Connect evidence to critical requirements'},
   tags:['industry'],requires:['core.evidence'],
   activities:Object.fromEntries(['think','focus','learn','decide'].map(p=>[p,{fr:`Construis une activité propre au secteur ${p}`,en:`Construct an activity for the ${p} sector`}])),
   contexts:{work:{fr:'Cas de production industrielle',en:'Industrial manufacturing example'}}
 }],pathways:[{id:'aerospace.industry',title:{fr:'Qualité industrielle',en:'Industrial quality'},summary:{fr:'Approfondir un métier technique',en:'Deepen a technical occupation'},competencyIds:['aerospace.trace'],audiences:['work']}]};
 const r=createRegistry([...installedPacks,extension]);
 assert.equal(r.skills.size,13);
 const j=buildJourney(r,{...user,pathId:'aerospace.industry'});
 assert.deepEqual(j.plan.map(x=>x.skillId),['core.evidence','aerospace.trace']);
 assert.equal(j.plan[1].context,'Cas de production industrielle');
});

test('V0.8: reject duplicate IDs, missing references and prerequisite cycles',()=>{
 assert.throws(()=>createRegistry([...installedPacks,installedPacks[0]]),/Duplicate pack/);
 const bad={id:'broken',version:'1.0.0',title:{fr:'Domaine supplémentaire',en:'Additional learning'},competencies:[{id:'broken.skill',title:{fr:'Compétence externe',en:'External competency'},outcome:{fr:'Construire un référentiel',en:'Build an extensible catalog'},tags:[],requires:['unknown.skill'],activities:Object.fromEntries(['think','focus','learn','decide'].map(p=>[p,{fr:`Description personnalisée ${p}`,en:`Individualized example ${p}`}]))}],pathways:[]};
 assert.throws(()=>createRegistry([...installedPacks,bad]),/missing prerequisite/);
 bad.competencies[0].requires=['broken.skill'];
 assert.throws(()=>createRegistry([...installedPacks,bad]),/self-dependency/);
});

test('V0.8: adult-only, age and diploma never determine intelligence, ranking or certification',()=>{
 assert.throws(()=>normalizeProfile({...user,adult:false},registry),/adults/);
 assert.throws(()=>normalizeProfile({...user,adult:'true'},registry),/adults/);
 const younger=buildJourney(registry,{...user,ageBand:'18-24',qualification:'Sans diplôme'});
 const older=buildJourney(registry,{...user,ageBand:'60+',qualification:'Doctorat'});
 assert.deepEqual(younger.plan.map(x=>x.skillId),older.plan.map(x=>x.skillId));
 assert.deepEqual(younger.plan.map(x=>x.pillars),older.plan.map(x=>x.pillars));
 assert.equal(younger.principles.graded,false);
 assert.equal(younger.disclaimer.includes('non certificatives'),true);
 assert.equal(younger.generatedFor.qualification,'Sans diplôme');
});

test('V0.8: deterministic prerequisite ordering and stage context without forced prerequisites',()=>{
 const first=buildJourney(registry,user);
 const second=buildJourney(registry,user);
 assert.deepEqual(first,second);
 assert.equal(first.plan.at(-1).skillId,'work.explain');
 const ids=first.plan.map(x=>x.skillId);
 first.plan.forEach(item=>item.requires.forEach(dep=>assert.ok(ids.indexOf(dep)<ids.indexOf(item))));
 assert.ok(first.plan.find(x=>x.skillId==='work.requirements').context);
 const student=buildJourney(registry,{...user,pathId:'study.learning',stage:'higher-education',locale:'en'});
 assert.equal(student.pathway.id,'study.learning');
 assert.ok(student.plan.some(x=>x.skillId==='study.transfer'));
 assert.ok(student.plan.every(x=>x.pillars.think && x.pillars.decide));
});

test('V0.8: self-reported familiarity changes suggestions, but never blocks learning',()=>{
 const j=buildJourney(registry,{...user,familiarity:{'work.risks':'confident','core.evidence':'practicing','foo.nonexistent':'confident'}});
 assert.equal(j.plan.find(x=>x.skillId==='work.risks').suggestedFocus,'transfer-and-verify');
 assert.equal(j.plan.find(x=>x.skillId==='core.evidence').suggestedFocus,'practice-and-transfer');
 assert.equal(j.plan.length,5);
 assert.equal(j.generatedFor.familiarity['foo.nonexistent'],undefined);
});

test('V0.8: portable, user-owned data validates self-declared events and stays versioned',()=>{
 const history=[{skillId:'core.evidence',type:'explored',at:'2026-10-19T17:25:00.000Z'}];
 const exported=exportPortfolio(registry,user,history);
 assert.ok(exported.includes('hf.portfolio.v1'));
 const restored=importPortfolio(exported,registry);
 assert.equal(restored.evidence.length,1);
 assert.equal(restored.evidence[0].source,'self-declared');
 assert.equal(restored.profile.occupation,'QA');
 assert.equal(restored.migrated,false);
 assert.deepEqual(PROGRESS_EVENTS,['explored','practiced','review-later']);
 assert.throws(()=>normalizeEvidence(registry,[{...history[0],type:'certified'}]),/unknown status/);
 assert.throws(()=>importPortfolio(exported.replace('hf.portfolio.v1','hf.portfolio.v9'),registry),/Unsupported/);
 assert.throws(()=>importPortfolio('{bad-json',registry),/Invalid JSON/);
 const old=JSON.parse(exported);old.catalogVersion='core@0.0.1';
 assert.equal(importPortfolio(JSON.stringify(old),registry).migrated,true);
});

test('V0.8: public static modules only; never expose private server folders',async()=>{
 for(const url of ['/journey','/journey.html','/journey.css','/journey/app.mjs','/journey/engine.mjs','/journey/packs.mjs','/journey?lang=en']){
   const response=await fetch(origin+url);
   assert.equal(response.status,200,url);
   assert.equal(response.headers.get('set-cookie'),null,url);
   assert.equal(response.headers.get('x-frame-options'),'DENY');
   assert.ok(response.headers.get('content-security-policy')?.includes("default-src 'none'"));
   assert.ok((await response.text()).length>100,url);
 }
 assert.equal((await fetch(origin+'/server/session-crypto.mjs')).status,404);
 const health=await fetch(origin+'/api/catalog?lang=fr');
 assert.equal((await health.json()).exercises.length,20);
});

test('V0.8: client has no learner-profile network transmission, analytics, or automatic persistence',async()=>{
 const js=await readFile(source,'utf8');
 const clean=js.replace(/^\s*\/\/.*$/gm,'');
 for(const pattern of [/\bfetch\s*\(/,/\bXMLHttpRequest\b/,/\bWebSocket\b/,/\bsendBeacon\b/,/\blocalStorage\s*[.\[]/,/\bsessionStorage\s*[.\[]/,/\bindexedDB\b/])
   assert.ok(!pattern.test(clean),`Forbidden profile transport/storage: ${pattern}`);
 assert.ok(js.includes("$('adult').checked"));
 assert.ok(js.includes('exportPortfolio('));
 assert.ok(js.includes('importPortfolio('));
});

test('V0.8: all four pillar apps link to the voluntary journey',async()=>{
 for(const path of ['/','/focus','/learn','/decide']){
   const r=await fetch(origin+path);assert.equal(r.status,200,path);
   const page=await r.text();assert.ok(page.includes('/journey?lang='),path);
 }
});