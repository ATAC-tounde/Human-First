/**
 * HUMAN FIRST V1.3 - optional pedagogical compass.
 *
 * Pure and deterministic. The suggestions are based ONLY on the learner's
 * chosen pathway and latest self-declared step, never on ability, age,
 * qualification, occupation or a hidden model. No networking or storage.
 * The four pillars are proposed as *modalities*, not linked exercises.
 */
const validStates=new Set(['explored','practiced','review-later']);
const choices=Object.freeze({
 'review-later':{pillar:'learn',reason:'review',priority:0},
 undefined:{pillar:'think',reason:'discover',priority:1},
 explored:{pillar:'focus',reason:'practice',priority:2},
 practiced:{pillar:'decide',reason:'transfer',priority:3}
});
export function suggestPractice(journey,evidence=[],options={}){
 if(!journey||!Array.isArray(journey.plan))throw new TypeError('A generated journey is required');
 if(!Array.isArray(evidence))throw new TypeError('Evidence must be an array');
 const limit=Number.isInteger(options?.limit)?Math.max(1,Math.min(5,options.limit)):3;
 const recent=new Map();
 for(const event of evidence){
  if(event&&typeof event.skillId==='string'&&validStates.has(event.type))
   recent.set(event.skillId,event.type);
 }
 return journey.plan.map((item,index)=>{
  const state=recent.get(item.skillId);
  const choice=choices[state===undefined?'undefined':state];
  return {
   skillId:item.skillId,title:item.title,outcome:item.outcome,
   context:item.context??null,order:item.order??index+1,
   pillar:choice.pillar,activity:item.pillars[choice.pillar],
   reason:choice.reason,priority:choice.priority
  };
 }).sort((a,b)=>a.priority-b.priority||a.order-b.order)
  .slice(0,limit)
  .map(({priority,...suggestion})=>suggestion);
}
