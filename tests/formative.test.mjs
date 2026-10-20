import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createRegistry,exportPortfolio,importPortfolio,buildJourney} from '../public/journey/engine.mjs';
import {installedPacks} from '../public/journey/packs.mjs';
import {makeDocument,requestReview,approveDocument,publishDocument,exportPack,nextDraft,versionFormativeTask,REVIEW_CHECKS} from '../public/studio/model.mjs';
import {FORMATIVE_SCHEMA,FORMATIVE_OBSERVATION,defaultFormativeTasks,
 validateFormativeTask,availableFormative,makeFormativeObservation,normalizeFormativeObservations} from '../public/journey/assessment.mjs';

const registry=()=>createRegistry(installedPacks);
const profile={adult:true,locale:'fr',stage:'work',ageBand:'unspecified',pathId:'core.foundations',occupation:'',qualification:'',minutesPerWeek:60,familiarity:{}};
test('Formative V1.0: four bilingual, authored, ungraded samples are tied to known competencies',()=>{
 const reg=registry();
 assert.equal(Object.keys(defaultFormativeTasks).length,4);
 for(const id of Object.keys(defaultFormativeTasks)){
  assert.ok(reg.skills.has(id),id);
  const local=availableFormative(reg,id,'fr'),en=availableFormative(reg,id,'en');
  assert.equal(local.criteria.length,en.criteria.length);
  assert.ok(local.question.length>=14);
  assert.notEqual(local.question,en.question);
  assert.equal(local.version,'1.0.0');
  assert.ok(local.criteria.every(x=>x.guidance.length>=14));
 }
 assert.equal(availableFormative(reg,'missing.skill'),null);
 assert.equal(availableFormative(reg,'study.transfer'),null);
});

test('Formative V1.0: malformed, incomplete and duplicate qualitative rubrics fail closed',()=>{
 const bad=structuredClone(defaultFormativeTasks['core.evidence']);
 bad.criteria[1].id=bad.criteria[0].id;
 assert.throws(()=>validateFormativeTask(bad),/Duplicate/);
 bad.criteria=bad.criteria.slice(0,1);
 assert.throws(()=>validateFormativeTask(bad),/Two to six/);
 bad.criteria=structuredClone(defaultFormativeTasks['core.evidence'].criteria);
 bad.question.en='';
 assert.throws(()=>validateFormativeTask(bad),/en/);
 bad.question.en='This is a well-defined question in English.';
 bad.schema='hf.formative.untrusted.v9';
 assert.throws(()=>validateFormativeTask(bad),/Unsupported/);
});

test('Formative V1.0: new profession-specific packs can author assessments with unchanged core',()=>{
 const source=makeDocument({id:'qualitycare',author:'Auteur Formatif'});
 source.meta.sourceNote='Original teaching exercises prepared for formative practice.';
 source.pack.competencies[0].assessment=structuredClone(defaultFormativeTasks['work.requirements']);
 const reg=createRegistry([...installedPacks,source.pack]);
 const task=availableFormative(reg,'qualitycare.analyser-besoin','en');
 assert.equal(task.criteria.length,2);
 assert.match(task.question,/criterion|criteria/);
 assert.equal(buildJourney(reg,{...profile,pathId:'qualitycare.premier-parcours'}).plan.at(-1).skillId,'qualitycare.analyser-besoin');
 const inReview=requestReview(source,installedPacks,'Auteur Formatif');
 const approved=approveDocument(inReview,{reviewer:'Relecteur Indépendant',checks:[...REVIEW_CHECKS]},'Auteur Formatif');
 const published=publishDocument(approved,installedPacks,'Auteur Formatif');
 const parsed=JSON.parse(exportPack(published,installedPacks));
 assert.ok(parsed.competencies[0].assessment);
 assert.equal(parsed.hfStudio.certification,'none');
 // The shared kernel must reject a malformed studio assessment even if a document is structurally valid otherwise.
 parsed.competencies[0].assessment.criteria[0].label.en='';
 assert.throws(()=>createRegistry([...installedPacks,parsed]),/en/);
});

test('Formative V1.0: private reflection exports only criteria identifiers and metadata, never answer text',()=>{
 const reg=registry();
 const event=makeFormativeObservation(reg,'core.evidence',['source','limits'],'2026-10-20T07:00:00.000Z');
 assert.equal(event.schema,FORMATIVE_OBSERVATION);
 assert.equal(event.certification,'none');
 assert.equal(event.conclusion,'not-assessed');
 const note='MY PRIVATE LONG ANSWER SHOULD NEVER BE IN EXPORTED DATA';
 const exported=exportPortfolio(reg,profile,[],{formative:[{...event,answer:note,score:100,certificate:true}]});
 assert.ok(!exported.includes(note));
 assert.ok(!exported.includes('"score"'));
 assert.ok(!exported.includes('"certificate"'));
 const recovered=importPortfolio(exported,reg);
 assert.deepEqual(recovered.formative,[event]);
 assert.equal(recovered.evidence.length,0);
 assert.equal(recovered.profile.pathId,'core.foundations');
});

test('Formative V1.0: invalid and duplicate self-checks, forged versions and unknown skills are rejected',()=>{
 const reg=registry();
 assert.throws(()=>makeFormativeObservation(reg,'core.evidence',['source','source']),/Duplicate/);
 assert.throws(()=>makeFormativeObservation(reg,'core.evidence',['nonexistent']),/Unknown/);
 assert.throws(()=>makeFormativeObservation(reg,'study.transfer',[]),/No authored/);
 assert.throws(()=>normalizeFormativeObservations(reg,[{schema:FORMATIVE_OBSERVATION,skillId:'core.evidence',taskVersion:'99.0.0',criterionIds:[],at:'2026-10-20T07:00:00Z'}]),/version/);
 assert.throws(()=>importPortfolio(JSON.stringify({schema:'hf.portfolio.v1',profile,catalogVersion:reg.version,formative:[{schema:'not-valid'}]}),reg),/schema/);
});

test('Formative V1.0: legacy portfolio with no formative data remains compatible',()=>{
 const reg=registry();
 const exported=exportPortfolio(reg,profile,[]);
 const parsed=JSON.parse(exported);
 delete parsed.formative;
 const imported=importPortfolio(JSON.stringify(parsed),reg);
 assert.deepEqual(imported.formative,[]);
 assert.equal(imported.profile.locale,'fr');
});

test('Formative V1.0: browser interface never exports raw answers and keeps the original four-pillar navigation',async()=>{
 const base=join(dirname(fileURLToPath(import.meta.url)),'..');
 const js=await readFile(join(base,'public/journey/app.mjs'),'utf8');
 const html=await readFile(join(base,'public/journey.html'),'utf8');
 const server=await readFile(join(base,'server/index.mjs'),'utf8');
 for(const id of ['formative-panel','formative-answer','formative-reveal','formative-feedback','formative-criteria','formative-save']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.ok(js.includes('makeFormativeObservation('));
 assert.ok(js.includes('exportPortfolio(registry,program.generatedFor,events,{formative})'));
 assert.ok(js.includes("$('formative-answer').value=''"));
 const executable=js.replace(/^\s*\/\/.*$/gm,'');
 assert.ok(!/\bfetch\s*\(/.test(executable),'No network calls from personal learning page');
 assert.ok(!/\blocalStorage\s*[.\[]/.test(executable),'No persistent answer storage');
 for(const route of ['/','/focus','/learn','/decide','/studio','/journey/assessment.mjs'])
  assert.ok(server.includes("'"+route+"'"),route);
});


test('Studio: a changed formative rubric or transfer auto-increments its own task version',()=>{
 const previous=structuredClone(defaultFormativeTasks['core.evidence']);
 const same=versionFormativeTask(previous,structuredClone(previous));
 assert.equal(same.version,'1.0.0','Saving a task unchanged must not change its version');
 const changed=structuredClone(previous);
 changed.criteria[0].guidance.fr+=' Nouvelle formulation pour clarifier la preuve.';
 const updated=versionFormativeTask(previous,changed);
 assert.equal(updated.version,'1.0.1');
 assert.equal(previous.version,'1.0.0');
 const followup=structuredClone(updated);
 followup.transfer.en+=' Apply the idea again.';
 assert.equal(versionFormativeTask(updated,followup).version,'1.0.2');
 const fresh=versionFormativeTask(undefined,{schema:FORMATIVE_SCHEMA,
  scenario:previous.scenario,question:previous.question,transfer:previous.transfer,criteria:previous.criteria});
 assert.equal(fresh.version,'1.0.0');
});

test('Studio: revising a published pack cannot reuse an older formative observation after rubric changes',()=>{
 const doc=makeDocument({id:'rubric-history',author:'Auteur Original'});
 doc.meta.sourceNote='Original exercises developed for this demonstration.';
 doc.pack.competencies[0].assessment=structuredClone(defaultFormativeTasks['work.requirements']);
 const review=requestReview(doc,installedPacks,'Auteur Original');
 const approved=approveDocument(review,{reviewer:'Relecteur Original',checks:[...REVIEW_CHECKS]},'Auteur Original');
 const release=publishDocument(approved,installedPacks,'Auteur Original');
 const initialRegistry=createRegistry([...installedPacks,release.pack]);
 const key='rubric-history.analyser-besoin';
 const recorded=makeFormativeObservation(initialRegistry,key,['observable']);
 const revision=nextDraft(release,'1.0.1','Auteur Révision');
 const current=revision.pack.competencies[0];
 const next=structuredClone(current.assessment);
 next.question.en+=' Could you validate it independently?';
 current.assessment=versionFormativeTask(current.assessment,next);
 assert.equal(current.assessment.version,'1.0.1');
 const revisedRegistry=createRegistry([...installedPacks,revision.pack]);
 assert.throws(()=>normalizeFormativeObservations(revisedRegistry,[recorded]),/version/i);
 assert.equal(normalizeFormativeObservations(initialRegistry,[recorded]).length,1);
});
