/**
 * HUMAN FIRST - learner-owned navigation and self-declared progress (V1.4).
 * Deliberately pure: no network, storage, grade, age or occupation inference.
 */
const STATES=Object.freeze(['explored','practiced','review-later']);
const FILTERS=Object.freeze(['all','not-started',...STATES]);
const compact=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function validProgram(journey){
 if(!journey||!Array.isArray(journey.plan))throw new TypeError('A generated learning journey is required');
 return journey.plan;
}

/** Latest explicit declaration wins, including "review later" after practice. */
export function latestDeclarations(journey,events=[]){
 const plan=validProgram(journey);
 if(!Array.isArray(events))throw new TypeError('Expected self-declared events');
 const validIds=new Set(plan.map(x=>x.skillId));
 const states=new Map();
 for(const event of events){
  if(event&&validIds.has(event.skillId)&&STATES.includes(event.type))
   states.set(event.skillId,event.type);
 }
 return states;
}

/** Counts describe only the learner's choices, not a scored ability or completion. */
export function selfReportedSummary(journey,events=[]){
 const plan=validProgram(journey),states=latestDeclarations(journey,events);
 const counts={total:plan.length,'not-started':0,explored:0,practiced:0,'review-later':0};
 for(const item of plan)counts[states.get(item.skillId)??'not-started']++;
 return counts;
}

/** Bilingual accent-insensitive search over the visible program only. */
export function visibleSkills(journey,events=[],{query='',status='all'}={}){
 const plan=validProgram(journey);
 if(!FILTERS.includes(status))throw new TypeError('Unrecognized progress filter');
 const states=latestDeclarations(journey,events),q=compact(String(query).slice(0,120));
 return plan.filter(item=>{
  if(status!=='all'&&(states.get(item.skillId)??'not-started')!==status)return false;
  if(!q)return true;
  const haystack=[item.title,item.outcome,item.skillId,...(item.tags??[]),...Object.values(item.pillars??{})]
   .map(compact).join(' ');
  return haystack.includes(q);
 });
}

/** The workspace only shows a pack-authored prompt; no exercise is fabricated. */
export function practicePrompt(journey,skillId,pillar){
 const item=validProgram(journey).find(x=>x.skillId===skillId);
 if(!item)throw new TypeError('Competency not in the active pathway');
 if(!['think','focus','learn','decide'].includes(pillar))throw new TypeError('Unsupported practice pillar');
 if(typeof item.pillars?.[pillar]!=='string')throw new TypeError('Practice instructions unavailable');
 return {skillId:item.skillId,title:item.title,outcome:item.outcome,context:item.context??null,
         pillar,activity:item.pillars[pillar]};
}
