import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRegistry,exportPortfolio} from '../public/journey/engine.mjs';
import {installedPacks} from '../public/journey/packs.mjs';
import {makeFormativeObservation} from '../public/journey/assessment.mjs';
import {ALIAS_SCHEMA,normalizeAliasManifest,planPortfolioTransition,migratePortfolio} from '../public/journey/continuity.mjs';
const registry=createRegistry(installedPacks);
const profile={adult:true,locale:'fr',stage:'personal',pathId:'core.foundations',qualification:'',occupation:'',ageBand:'unspecified',minutesPerWeek:60,familiarity:{'core.evidence':'exploring'}};
const legacyVersion='core@0.7.0|study@1.0.0|work@1.0.0|life@1.0.0';
const base=JSON.parse(exportPortfolio(registry,profile,[{skillId:'core.evidence',type:'practiced',at:'2026-10-20T04:00:00Z'}],{formative:[makeFormativeObservation(registry,'core.evidence',['source'])]}));
base.catalogVersion=legacyVersion;
base.profile.pathId='core.old-foundations';
base.profile.familiarity={'core.old-evidence':'exploring'};
base.evidence[0].skillId='core.old-evidence';
base.formative[0].skillId='core.old-evidence';
const original=JSON.stringify(base);
const manifest={schema:ALIAS_SCHEMA,fromCatalogVersion:legacyVersion,toCatalogVersion:registry.version,
 competencies:[{from:'core.old-evidence',to:'core.evidence'}],
 pathways:[{from:'core.old-foundations',to:'core.foundations'}]};
test('Continuity V1.0: explicit mappings migrate pathway, familiarity, evidence and formative metadata',()=>{
 const plan=planPortfolioTransition(original,registry,manifest);
 assert.equal(plan.ready,true,plan.issues.join(' | '));
 assert.ok(plan.changes.length>=4);
 const result=migratePortfolio(original,registry,manifest);
 assert.equal(result.profile.pathId,'core.foundations');
 assert.equal(result.profile.familiarity['core.evidence'],'exploring');
 assert.equal(result.evidence[0].skillId,'core.evidence');
 assert.equal(result.formative[0].skillId,'core.evidence');
 assert.equal(result.migrationReport.inferred,false);
 assert.equal(result.migrationReport.mode,'explicit-id-map');
 assert.equal(JSON.stringify(base),original,'Original learner portfolio is immutable');
});
test('Continuity V1.0: missing alias never silently deletes self-declared progress',()=>{
 const incomplete={...manifest,competencies:[]};
 const plan=planPortfolioTransition(original,registry,incomplete);
 assert.equal(plan.ready,false);
 assert.ok(plan.issues.some(x=>x.includes('core.old-evidence')));
 assert.equal(plan.transformed,null);
 assert.throws(()=>migratePortfolio(original,registry,incomplete),/original file remains unchanged/);
});
test('Continuity V1.0: manifest target, source version and aliases must be exact',()=>{
 assert.throws(()=>normalizeAliasManifest({...manifest,toCatalogVersion:'other'},registry),/target/);
 assert.throws(()=>planPortfolioTransition(original,registry,{...manifest,fromCatalogVersion:'other'}),/version/);
 assert.throws(()=>normalizeAliasManifest({...manifest,competencies:[{from:'old.value',to:'none.new-skill'}]},registry),/unknown destination/);
 assert.throws(()=>normalizeAliasManifest({...manifest,competencies:[{from:'a.old',to:'core.evidence'},{from:'b.old',to:'core.evidence'}]},registry),/collision/);
 assert.throws(()=>normalizeAliasManifest({...manifest,competencies:[{from:'core.evidence',to:'core.causality'},{from:'core.old',to:'core.evidence'}]},registry),/chained/);
});
test('Continuity V1.0: in-place legacy version update with unchanged IDs needs no mappings',()=>{
 const stable=JSON.parse(exportPortfolio(registry,profile,[]));
 stable.catalogVersion='v0.9-old-catalog';
 const same={schema:ALIAS_SCHEMA,fromCatalogVersion:stable.catalogVersion,toCatalogVersion:registry.version,competencies:[],pathways:[]};
 const plan=planPortfolioTransition(JSON.stringify(stable),registry,same);
 assert.equal(plan.ready,true);
 assert.equal(plan.changes.length,0);
 assert.equal(migratePortfolio(JSON.stringify(stable),registry,same).profile.pathId,'core.foundations');
});
test('Continuity V1.0: cannot fake recorded mastery when migrating',()=>{
 const forged=structuredClone(base);
 forged.formative[0].taskVersion='999.0.0';
 const plan=planPortfolioTransition(JSON.stringify(forged),registry,manifest);
 assert.equal(plan.ready,false);
 assert.ok(plan.issues.some(x=>/validation/.test(x)));
 assert.throws(()=>migratePortfolio(JSON.stringify(forged),registry,manifest));
});


test('Continuity: explicit remapping overrides a still-present competency key',()=>{
 const retained=JSON.parse(exportPortfolio(registry,profile,[
  {skillId:'core.evidence',type:'practiced',at:'2026-10-20T05:00:00Z'}
 ]));
 retained.catalogVersion='older-catalog-with-reused-key';
 const approved={
  schema:ALIAS_SCHEMA,fromCatalogVersion:retained.catalogVersion,toCatalogVersion:registry.version,
  competencies:[{from:'core.evidence',to:'core.causality'}],pathways:[]
 };
 const originalJson=JSON.stringify(retained);
 const preview=planPortfolioTransition(originalJson,registry,approved);
 assert.equal(preview.ready,true,preview.issues.join(' | '));
 assert.ok(preview.changes.some(c=>c.from==='core.evidence'&&c.to==='core.causality'));
 const migrated=migratePortfolio(originalJson,registry,approved);
 assert.equal(migrated.profile.familiarity['core.causality'],'exploring');
 assert.equal(migrated.profile.familiarity['core.evidence'],undefined);
 assert.equal(migrated.evidence[0].skillId,'core.causality');
 assert.equal(JSON.stringify(retained),originalJson);
});

test('Continuity: a retained destination collision is not silently merged',()=>{
 const ambiguous=JSON.parse(exportPortfolio(registry,profile,[]));
 ambiguous.catalogVersion='ambiguous-catalog';
 ambiguous.profile.familiarity['core.causality']='confident';
 const approved={schema:ALIAS_SCHEMA,fromCatalogVersion:ambiguous.catalogVersion,toCatalogVersion:registry.version,
  competencies:[{from:'core.evidence',to:'core.causality'}],pathways:[]};
 const check=planPortfolioTransition(JSON.stringify(ambiguous),registry,approved);
 assert.equal(check.ready,false);
 assert.ok(check.issues.some(x=>x.includes('collision')));
});

test('Continuity: explicit remapping cannot relabel a different formative task',()=>{
 const previous=JSON.parse(original);
 previous.profile.pathId='core.foundations';
 previous.profile.familiarity={'core.evidence':'exploring'};
 previous.evidence[0].skillId='core.evidence';
 previous.formative[0].skillId='core.evidence';
 previous.catalogVersion='old-assessment';
 const approved={schema:ALIAS_SCHEMA,fromCatalogVersion:previous.catalogVersion,toCatalogVersion:registry.version,
  competencies:[{from:'core.evidence',to:'core.causality'}],pathways:[]};
 const check=planPortfolioTransition(JSON.stringify(previous),registry,approved);
 assert.equal(check.ready,false);
 assert.ok(check.issues.some(x=>x.startsWith('validation:')));
});
