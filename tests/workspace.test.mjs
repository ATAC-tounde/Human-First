import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installedPacks} from '../public/journey/packs.mjs';
import {starterLibraries} from '../public/journey/libraries.mjs';
import {createRegistry,buildJourney,exportPortfolio,importPortfolio} from '../public/journey/engine.mjs';
import {selfReportedSummary,latestDeclarations,visibleSkills,practicePrompt} from '../public/journey/workspace.mjs';

const registry=createRegistry([...installedPacks,...starterLibraries.map(x=>x.pack)]);
const makePlan=(locale='fr',id='digital.autonomy')=>buildJourney(registry,{
 adult:true,locale,pathId:id,stage:'personal',ageBand:'unspecified',minutesPerWeek:60,familiarity:{}
});
const evidence=(skillId,type)=>({skillId,type,at:'2026-11-10T18:10:00.000Z',source:'self-declared'});

test('V1.4 practice: each competency offers all four authored bilingual practice instructions',()=>{
 for(const lang of ['fr','en']){
  const plan=makePlan(lang);
  const serialized=JSON.stringify(plan);
  for(const item of plan.plan){
   for(const pillar of ['think','focus','learn','decide']){
    const prompt=practicePrompt(plan,item.skillId,pillar);
    assert.equal(prompt.title,item.title);
    assert.equal(prompt.pillar,pillar);
    assert.equal(prompt.activity,item.pillars[pillar]);
    assert.ok(prompt.activity.length>=8);
   }
  }
  assert.equal(JSON.stringify(plan),serialized,'Do not mutate the compiled learning pathway');
 }
});

test('V1.4 progress: latest explicit declaration wins and never becomes an aptitude score',()=>{
 const plan=makePlan();const id=plan.plan[0].skillId;
 const another=plan.plan[1].skillId;
 const events=[evidence(id,'explored'),evidence(id,'practiced'),
  evidence(another,'review-later'),evidence('unused.unknown','explored'),
  evidence(id,'review-later'),evidence(id,'invalid')];
 const before=JSON.stringify(events);
 const states=latestDeclarations(plan,events);
 assert.equal(states.get(id),'review-later');
 assert.equal(states.get(another),'review-later');
 assert.equal(states.has('unused.unknown'),false);
 const stats=selfReportedSummary(plan,events);
 assert.equal(stats.total,plan.plan.length);
 assert.equal(stats['review-later'],2);
 assert.equal(stats['not-started'],stats.total-2);
 assert.equal(stats.practiced,0);
 assert.equal('score' in stats,false);
 assert.equal(JSON.stringify(events),before);
});

test('V1.4 search: find competencies by title, keyword and pillar, accent-insensitive',()=>{
 const plan=makePlan('fr');
 const first=plan.plan[0];
 const query=first.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 assert.ok(visibleSkills(plan,[],{query}).some(x=>x.skillId===first.skillId));
 assert.ok(visibleSkills(plan,[],{query:first.skillId}).some(x=>x.skillId===first.skillId));
 const tag=first.tags[0];
 if(tag)assert.ok(visibleSkills(plan,[],{query:tag}).some(x=>x.skillId===first.skillId));
 assert.equal(visibleSkills(plan,[],{query:'very-unlikely-to-be-present-xyz'}).length,0);
 assert.equal(visibleSkills(plan,[],{query:'  '}).length,plan.plan.length);
 assert.equal(visibleSkills(plan,[],{query:'a'.repeat(200)}).length,0);
 const english=makePlan('en');
 assert.ok(visibleSkills(english,[],{query:english.plan[0].title.toUpperCase()}).length>=1);
});

test('V1.4 filters: every self-declared state and unknown state has a distinct view',()=>{
 const plan=makePlan();const ids=plan.plan.map(x=>x.skillId);
 const events=[evidence(ids[0],'explored'),evidence(ids[1],'practiced'),evidence(ids[2],'review-later')];
 const original=JSON.stringify(plan);
 for(const state of ['explored','practiced','review-later']){
  assert.equal(visibleSkills(plan,events,{status:state}).length,1);
 }
 assert.equal(visibleSkills(plan,events,{status:'not-started'}).length,ids.length-3);
 assert.equal(visibleSkills(plan,events,{status:'all'}).length,ids.length);
 assert.throws(()=>visibleSkills(plan,events,{status:'passed'}),/filter/);
 assert.throws(()=>practicePrompt(plan,'unknown.skill','think'),/active pathway/);
 assert.throws(()=>practicePrompt(plan,ids[0],'other'),/pillar/);
 assert.throws(()=>latestDeclarations(plan,{}),/events/);
 assert.equal(JSON.stringify(plan),original);
});

test('V1.4 progress: existing portable portfolio carries only self-declarations, not practice text',()=>{
 const plan=makePlan('fr');const entry=evidence(plan.plan[0].skillId,'practiced');
 const portable=exportPortfolio(registry,plan.generatedFor,[entry]);
 assert.ok(!portable.includes(plan.plan[0].pillars.think));
 const restored=importPortfolio(portable,registry);
 assert.equal(restored.evidence[0].type,'practiced');
 assert.equal(selfReportedSummary(plan,restored.evidence).practiced,1);
});

test('V1.4 UI: search and guided practice are keyboard-accessible and served from allowlist',async()=>{
 const html=await readFile(new URL('../public/journey.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../public/journey/app.mjs',import.meta.url),'utf8');
 const server=await readFile(new URL('../server/index.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../public/journey/workspace.css',import.meta.url),'utf8');
 for(const id of ['program-search','program-filter','practice-panel','practice-title',
  'dashboard-continue','practice-mark-explored','practice-mark-practiced','practice-mark-review','practice-open-space']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.ok(html.includes('role="group"'));
 assert.ok(html.includes('aria-live="polite"'));
 assert.ok(html.includes('href="/journey/workspace.css"'));
 assert.ok(server.includes("'/journey/workspace.css'"));
 assert.ok(server.includes("'/journey/workspace.mjs'"));
 assert.ok(app.includes('button.setAttribute(\'aria-pressed\''));
 assert.ok(app.includes('openPractice(next.skillId,next.pillar)'));
 assert.ok(app.includes("renderDashboard();"));
 assert.ok(app.includes("renderPractice();"));
 assert.ok(css.includes('practice-declarations'));
 assert.ok(css.includes('practice-pillar-choices button[aria-pressed="true"]'));
 assert.ok(css.includes('@media(max-width:660px)'));
 assert.ok(app.includes("$('practice-title').focus({preventScroll:true})"));
});

test('V1.4 accessible names and pathway help are updated when language or library changes',async()=>{
 const app=await readFile(new URL('../public/journey/app.mjs',import.meta.url),'utf8');
 for(const key of ['dashboardMetricsAria','practicePillarsAria','practiceProgressAria','searchGroupAria'])
  assert.equal(app.split(key+':').length-1,2,key+' has FR and EN copy');
 assert.ok(app.includes("document.querySelector('.program-tools').setAttribute('aria-label'"));
 assert.ok(app.includes("$('path').value=pathId;renderPathways();"));
 assert.ok(app.includes("$('path').value=targetPath;renderPathways();"));
 assert.ok(app.includes("document.querySelectorAll('#program-list button[data-progress-skill]')"));
 const html=await readFile(new URL('../public/journey.html',import.meta.url),'utf8');
 assert.ok(html.includes('id="program-visible-count" class="program-matches" tabindex="-1"'));
});
