import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installedPacks} from '../public/journey/packs.mjs';
import {createRegistry,buildJourney} from '../public/journey/engine.mjs';
import {suggestPractice} from '../public/journey/compass.mjs';

const registry=createRegistry(installedPacks);
const profile={adult:true,locale:'fr',stage:'work',pathId:'work.quality',minutesPerWeek:60};
const plan=buildJourney(registry,profile);
const event=(skillId,type,at='2026-10-21T12:00:00Z')=>({skillId,type,at,source:'self-declared'});

test('V1.3: the default compass follows stable pedagogical order without tracking anything',()=>{
 const result=suggestPractice(plan,[]);
 assert.equal(result.length,Math.min(3,plan.plan.length));
 assert.deepEqual(result.map(x=>x.skillId),plan.plan.slice(0,3).map(x=>x.skillId));
 assert.ok(result.every(x=>x.pillar==='think'&&x.reason==='discover'));
 assert.ok(result.every(x=>x.activity&&x.title&&x.outcome));
 assert.deepEqual(result,suggestPractice(plan,[]),'Same data must produce exactly the same guidance');
});

test('V1.3: voluntary statuses guide modalities without grades or automatic locks',()=>{
 const ids=plan.plan.map(x=>x.skillId);
 assert.ok(ids.length>=3);
 const history=[event(ids[0],'practiced'),event(ids[1],'explored'),event(ids[2],'review-later')];
 const result=suggestPractice(plan,history,{limit:5});
 assert.equal(result[0].skillId,ids[2]);assert.equal(result[0].pillar,'learn');
 assert.equal(result.find(x=>x.skillId===ids[1]).pillar,'focus');
 assert.equal(result.find(x=>x.skillId===ids[0]).pillar,'decide');
 assert.equal(result.length,Math.min(5,ids.length));
 assert.equal(result.find(x=>x.skillId===ids[0]).reason,'transfer');
 const changed=[...history,event(ids[0],'review-later')];
 assert.equal(suggestPractice(plan,changed)[0].skillId,ids[0],
  'The latest explicitly chosen event wins in a deterministic tie');
 assert.equal(history.length,3,'Do not mutate self-reports');
});

test('V1.3: age, degree and occupation do not influence the guidance; locale does',()=>{
 const a=buildJourney(registry,{...profile,ageBand:'18-24',qualification:'none',occupation:'unknown'});
 const b=buildJourney(registry,{...profile,ageBand:'60+',qualification:'PhD',occupation:'director'});
 assert.deepEqual(suggestPractice(a,[]),suggestPractice(b,[]));
 const english=buildJourney(registry,{...profile,locale:'en'});
 assert.deepEqual(suggestPractice(english,[]).map(x=>[x.skillId,x.pillar]),
  suggestPractice(a,[]).map(x=>[x.skillId,x.pillar]));
 assert.notEqual(suggestPractice(english,[])[0].activity,suggestPractice(a,[])[0].activity);
});

test('V1.3: malformed inputs, caps and old unrelated evidence are handled without mutation',()=>{
 assert.throws(()=>suggestPractice(null),/journey/);
 assert.throws(()=>suggestPractice(plan,{}),/array/);
 const unrelated=[event('not-in-this-plan','review-later'),{type:'random',skillId:plan.plan[0].skillId}];
 const before=JSON.stringify(unrelated);
 assert.deepEqual(suggestPractice(plan,unrelated),suggestPractice(plan,[]));
 assert.equal(JSON.stringify(unrelated),before);
 assert.equal(suggestPractice(plan,[],{limit:999}).length,Math.min(5,plan.plan.length));
 assert.equal(suggestPractice(plan,[],{limit:0}).length,1);
});
