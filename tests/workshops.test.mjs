import {test} from 'node:test';
import assert from 'node:assert/strict';
import {everydayPack} from '../public/journey/everyday.mjs';
import {installedPacks} from '../public/journey/packs.mjs';
import {starterLibraries} from '../public/journey/libraries.mjs';
import {bundledReferences,packReference} from '../public/journey/library-manager.mjs';
import {createRegistry,buildJourney,exportPortfolio,PILLARS} from '../public/journey/engine.mjs';
import {preparePortfolioRestore} from '../public/journey/restore.mjs';
import {availableFormative,makeFormativeObservation} from '../public/journey/assessment.mjs';
import {encryptPortfolio,decryptPortfolio} from '../public/journey/vault.mjs';

const base=createRegistry(installedPacks);
const digital=starterLibraries.find(library=>library.id==='digital').pack;
const profile={adult:true,pathId:'everyday.together',locale:'fr'};
const registryFor=packs=>createRegistry([...installedPacks,...packs]);
const custom=structuredClone(everydayPack);
custom.competencies[0].title.en='My own handover exercise';

function save(packs,legacy=false){
 const registry=registryFor(packs);
 const formative=[makeFormativeObservation(registry,'everyday.handover',['visible-check'])];
 const evidence=[{skillId:'everyday.message',type:'review-later',at:'2026-11-24T12:00:00Z'}];
 const extras=legacy?{formative}:{formative,bundledLibraries:bundledReferences(packs)};
 return exportPortfolio(registry,profile,evidence,extras);
}

test('Every workshop has an independent starting point, four prompts and an off-screen transfer in both languages',()=>{
 const registry=registryFor([everydayPack]);
 assert.throws(()=>buildJourney(registry,{...profile,adult:false}),/adults/);
 for(const locale of ['fr','en']){
  const program=buildJourney(registry,{...profile,locale});
  assert.deepEqual(program.plan.map(skill=>skill.skillId),everydayPack.competencies.map(skill=>skill.id));
  for(const item of program.plan){
   assert.deepEqual(item.requires,[]);
   for(const pillar of PILLARS)assert.ok(item.pillars[pillar].length>35);
   const task=availableFormative(registry,item.skillId,locale);
   assert.ok(task.scenario.length>80&&task.transfer.length>40);
   assert.equal(task.criteria.length,2);
  }
 }
});

test('JSON restores the saved library order, self-declarations and formative criteria in a fresh tab',()=>{
 const packs=[everydayPack,digital];
 const raw=save(packs);
 for(const previouslyLoaded of [[],[digital,everydayPack]]){
  const restored=preparePortfolioRestore(raw,registryFor(previouslyLoaded),previouslyLoaded);
  assert.equal(restored.registry.version,registryFor(packs).version);
  assert.deepEqual(restored.optionalPacks.map(packReference),packs.map(packReference));
  assert.deepEqual(restored.legacyLibraries,[]);
  assert.equal(restored.portfolio.profile.pathId,profile.pathId);
  assert.equal(restored.portfolio.evidence[0].type,'review-later');
  assert.deepEqual(restored.portfolio.formative,JSON.parse(raw).formative);
 }
 assert.equal(raw.includes(everydayPack.competencies[0].activities.think.fr),false);
});

test('Legacy portfolios ask about missing library origins and accept explicitly loaded custom content',()=>{
 const raw=save([digital,custom],true);
 const fresh=preparePortfolioRestore(raw,base,[],null,'en');
 assert.deepEqual(fresh.legacyLibraries,[digital.title.en,everydayPack.title.en]);
 const loaded=[custom];
 const restored=preparePortfolioRestore(raw,registryFor(loaded),loaded,null,'fr');
 assert.deepEqual(restored.legacyLibraries,[digital.title.fr]);
 assert.equal(restored.registry.skills.get(custom.competencies[0].id).title.en,custom.competencies[0].title.en);
 assert.equal(loaded.length,1);
});

test('A custom pack with the same ID and version is never silently replaced by bundled content',()=>{
 const raw=save([custom,digital]);
 assert.deepEqual(JSON.parse(raw).bundledLibraries,['digital@1.0.0']);
 assert.throws(()=>preparePortfolioRestore(raw,base,[]),/everyday@1.0.0/);
 assert.throws(()=>preparePortfolioRestore(raw,registryFor([everydayPack]),[everydayPack]),/everyday@1.0.0/);
 const restored=preparePortfolioRestore(raw,registryFor([custom]),[custom]);
 assert.equal(restored.optionalPacks[0],custom);
 const official=preparePortfolioRestore(save([everydayPack]),registryFor([custom]),[custom]);
 assert.equal(official.optionalPacks[0],everydayPack);
});

test('Unrecognized versions, malformed metadata and unknown evidence leave the open catalog untouched',()=>{
 const original=JSON.parse(save([everydayPack]));
 for(const changes of [
  {catalogVersion:original.catalogVersion.replace('everyday@1.0.0','everyday@9.0.0'),bundledLibraries:['everyday@9.0.0']},
  {catalogVersion:original.catalogVersion+'|everyday@1.0.0'}, {bundledLibraries:['outside@1.0.0']},
  {bundledLibraries:'everyday@1.0.0'}, {evidence:[{...original.evidence[0],skillId:'unknown.skill'}]},
  {profile:{...original.profile,adult:false}}
 ]){
  const loaded=[];
  assert.throws(()=>preparePortfolioRestore(JSON.stringify({...original,...changes}),base,loaded));
  assert.deepEqual(loaded,[]);
  assert.equal(base.skills.has('everyday.handover'),false);
 }
});

test('Encrypted portfolios round-trip using the same catalog restoration as JSON',async()=>{
 const raw=save([digital,everydayPack]);
 const secret='local workshop test phrase';
 const cipher=await encryptPortfolio(raw,secret);
 assert.equal(cipher.includes('everyday.handover'),false);
 const restored=preparePortfolioRestore(await decryptPortfolio(cipher,secret),base,[]);
 assert.equal(restored.portfolio.evidence[0].skillId,'everyday.message');
 assert.deepEqual(restored.legacyLibraries,[]);
});
