import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installedPacks} from '../public/journey/packs.mjs';
import {starterLibraries,libraryActions} from '../public/journey/libraries.mjs';
import {addStarterLibrary} from '../public/journey/library-manager.mjs';
import {createRegistry,buildJourney,exportPortfolio,importPortfolio} from '../public/journey/engine.mjs';
import {importForEditing,validateDocument} from '../public/studio/model.mjs';

test('V1.4: four original bilingual one-click libraries are valid and extend the existing curriculum',()=>{
 assert.equal(starterLibraries.length,4);
 assert.equal(new Set(starterLibraries.map(item=>item.id)).size,4);
 const registry=createRegistry([...installedPacks,...starterLibraries.map(item=>item.pack)]);
 assert.equal(registry.manifests.length,installedPacks.length+4);
 assert.equal(registry.paths.size,9);
 for(const lib of starterLibraries){
  assert.equal(lib.origin,'human-first-demonstration');
  assert.equal(lib.audience,'18+');
  assert.ok(lib.pack.competencies.length>=3);
  assert.ok(lib.pack.pathways.length>=1);
  assert.ok(lib.summary.fr.length>10&&lib.summary.en.length>10);
  assert.ok(JSON.stringify(lib.pack).length<150_000);
  for(const lng of ['fr','en']){
   const p=buildJourney(registry,{adult:true,pathId:lib.pack.pathways[0].id,locale:lng,stage:'personal',minutesPerWeek:60});
   assert.ok(p.plan.length>=3);
   assert.equal(p.generatedFor.locale,lng);
   for(const item of p.plan){
    assert.ok(item.title&&item.outcome);
    assert.ok(['think','focus','learn','decide'].every(x=>item.pillars[x]?.length>12));
   }
  }
 }
});

test('V1.4: loading is deterministic, additive, cannot duplicate, and does not mutate existing packs',()=>{
 const baseline=JSON.stringify(installedPacks),selected=starterLibraries[0].id;
 const empty=[];
 const first=addStarterLibrary(installedPacks,empty,selected);
 assert.equal(empty.length,0);
 assert.equal(first.optionalPacks.length,1);
 assert.notEqual(first.optionalPacks[0],starterLibraries[0].pack,'Copy the curated pack instead of sharing mutable objects');
 assert.equal(first.registry.manifests.length,installedPacks.length+1);
 const second=addStarterLibrary(installedPacks,first.optionalPacks,starterLibraries[1].id);
 assert.equal(first.optionalPacks.length,1,'Do not mutate earlier result');
 assert.equal(second.registry.manifests.length,installedPacks.length+2);
 assert.throws(()=>addStarterLibrary(installedPacks,second.optionalPacks,selected),/already loaded/);
 assert.throws(()=>addStarterLibrary(installedPacks,second.optionalPacks,'unknown'),/Unknown/);
 assert.equal(JSON.stringify(installedPacks),baseline);
});

test('V1.4: added library pathways remain compatible with the portable learner portfolio',()=>{
 const added=addStarterLibrary(installedPacks,[],'digital');
 const profile={adult:true,locale:'fr',stage:'work',pathId:'digital.autonomy',minutesPerWeek:60};
 const created=buildJourney(added.registry,profile);
 assert.ok(created.plan.some(item=>item.skillId==='digital.ai'));
 const portable=exportPortfolio(added.registry,profile,[]);
 const restored=importPortfolio(portable,added.registry);
 assert.equal(restored.profile.pathId,profile.pathId);
});

test('V1.4: each template enters Studio as an untrusted editable draft, not a pre-approved publication',()=>{
 for(const lib of starterLibraries){
  const document=importForEditing(JSON.stringify(lib.pack),{author:'Équipe pédagogique'});
  assert.equal(document.status,'draft');
  assert.equal(document.review.reviewer,'');
  assert.equal(document.published,null);
  const validation=validateDocument(document,installedPacks);
  assert.equal(validation.ok,true,validation.errors.join(' | '));
 }
});

test('V1.4: downloadable example is a fully importable pack in Journey and Studio',async()=>{
 const template=await readFile(new URL('../public/examples/knowledge-pack-template.json',import.meta.url),'utf8');
 const pack=JSON.parse(template);
 assert.ok(Buffer.byteLength(template,'utf8')<150_000);
 assert.equal(pack.id,'mon-exemple');
 assert.equal(createRegistry([...installedPacks,pack]).paths.has('mon-exemple.premier-parcours'),true);
 assert.equal(validateDocument(importForEditing(template,{author:'Équipe pédagogique'}),installedPacks).ok,true);
});

test('V1.4: static action-label contract and scoped stylesheet on the two library UIs',async()=>{
 for(const page of ['journey','studio']){
  const markup=await readFile(new URL('../public/'+page+'.html',import.meta.url),'utf8');
  assert.ok(markup.includes('href="/ui/actions.css"'),page);
 }
 for(const page of ['index','focus','learn','decide']){
  const markup=await readFile(new URL('../public/'+page+'.html',import.meta.url),'utf8');
  assert.ok(!markup.includes('href="/ui/actions.css"'),page+' does not use these classes');
 }
 const journey=await readFile(new URL('../public/journey.html',import.meta.url),'utf8');
 const studio=await readFile(new URL('../public/studio.html',import.meta.url),'utf8');
 assert.ok(journey.includes('id="library-list"'));
 assert.ok(studio.includes('id="studio-library-list"'));
 assert.ok(journey.includes('knowledge-pack-template.json'));
 assert.ok(studio.includes('knowledge-pack-template.json'));
 assert.ok(libraryActions.fr.load&&libraryActions.en.load);
 assert.ok(libraryActions.fr.use&&libraryActions.en.use);
 assert.ok(libraryActions.fr.loaded!==libraryActions.fr.load);
 assert.equal(libraryActions.en.path,'pathway');
 assert.equal(libraryActions.en.paths,'pathways');
 const studioApp=await readFile(new URL('../public/studio/app.mjs',import.meta.url),'utf8');
 const journeyApp=await readFile(new URL('../public/journey/app.mjs',import.meta.url),'utf8');
 for(const script of [studioApp,journeyApp]){
  assert.ok(script.includes("button.setAttribute('aria-label'"),'Card buttons have unique accessible labels');
  assert.ok(script.includes('button.dataset.libraryId=library.id'));
 }
 assert.ok(studioApp.includes("button?.focus({preventScroll:true})"),'Restore keyboard focus after loading template');
 assert.ok(studioApp.includes('activeTemplateAuditLength'),'Edited templates must be reloadable');
 const css=await readFile(new URL('../public/ui/actions.css',import.meta.url),'utf8');
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('.hf-action:focus-visible'));
 assert.ok(css.includes(':not([aria-disabled="true"])'));
 const handler=await readFile(new URL('../server/index.mjs',import.meta.url),'utf8');
 for(const asset of ['/journey/libraries.mjs','/journey/library-manager.mjs',
  '/examples/knowledge-pack-template.json','/ui/actions.css'])
  assert.ok(handler.includes("'"+asset+"'"),asset);
});

test('V1.4: static French and English My Journey navigation strings exist on all six spaces',async()=>{
 for(const page of ['index','focus','learn','decide','journey','studio']){
  const markup=await readFile(new URL('../public/'+page+'.html',import.meta.url),'utf8');
  assert.ok(markup.includes('MON PARCOURS'),page+' French navigation label');
 }
 for(const script of ['app.js','focus.js','learn.js','decide.js','journey/app.mjs']){
  const code=await readFile(new URL('../public/'+script,import.meta.url),'utf8');
  assert.ok(code.includes('MY JOURNEY'),script+' English navigation label');
 }
});

test('V1.4: Studio and Journey reject the same malformed semantic version and cross-type IDs',()=>{
 const broken={...starterLibraries[0].pack,version:'01.0.0'};
 assert.throws(()=>createRegistry([...installedPacks,broken]),/semantic version/);
 const document=importForEditing(JSON.stringify(broken),{author:'Équipe pédagogique'});
 assert.equal(validateDocument(document,installedPacks).ok,false);
 const collision=structuredClone(starterLibraries[0].pack);
 collision.pathways[0].id=collision.competencies[0].id;
 assert.throws(()=>createRegistry([...installedPacks,collision]),/conflicts with competency/);
});
