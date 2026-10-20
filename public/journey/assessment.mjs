/**
 * HUMAN FIRST V1.0 — formative evidence, not intelligence scoring.
 * A task's self-check rubric is accessible in this client-side source and thus
 * deliberately NOT a secure examination answer key. No learner text travels anywhere.
 */
export const FORMATIVE_SCHEMA='hf.formative.task.v1';
export const FORMATIVE_OBSERVATION='hf.formative.observation.v1';
const pair=(fr,en)=>({fr,en});
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const check=(condition,message)=>{if(!condition)throw new TypeError(message);};
const bilingual=(value,label)=>{
 check(isObject(value),label+' must be bilingual');
 for(const language of ['fr','en'])check(
  typeof value[language]==='string'&&value[language].trim().length>=14&&value[language].length<=1800,
  label+': '+language+' must be meaningful (14–1800 chars)');
 return {fr:value.fr.trim(),en:value.en.trim()};
};
const criterionId=/^[a-z][a-z0-9-]{1,31}$/;
export function validateFormativeTask(task){
 check(isObject(task),'Formative task must be an object');
 check(task.schema===FORMATIVE_SCHEMA,'Unsupported formative schema');
 check(/^\d+\.\d+\.\d+$/.test(task.version),'Formative version must be semantic');
 const scenario=bilingual(task.scenario,'scenario');
 const question=bilingual(task.question,'question');
 const transfer=bilingual(task.transfer,'transfer');
 check(Array.isArray(task.criteria)&&task.criteria.length>=2&&task.criteria.length<=6,'Two to six qualitative criteria required');
 const used=new Set();
 const criteria=task.criteria.map((c,i)=>{
  check(isObject(c)&&criterionId.test(c.id),'Invalid criterion ID '+i);
  check(!used.has(c.id),'Duplicate criterion '+c.id);
  used.add(c.id);
  return {id:c.id,label:bilingual(c.label,c.id+' label'),guidance:bilingual(c.guidance,c.id+' guidance')};
 });
 return {schema:FORMATIVE_SCHEMA,version:task.version,scenario,question,transfer,criteria};
}
const task=(scenario,question,transfer,criteria)=>validateFormativeTask({
 schema:FORMATIVE_SCHEMA,version:'1.0.0',
 scenario:pair(...scenario),question:pair(...question),transfer:pair(...transfer),
 criteria:criteria.map(([id,labelFr,labelEn,hintFr,hintEn])=>({id,label:pair(labelFr,labelEn),guidance:pair(hintFr,hintEn)}))
});
/** Editorial samples are not validated qualifications or scored tests. */
export const defaultFormativeTasks=Object.freeze({
 'core.evidence':task(
 ['Une publicité affirme : « Cette méthode améliore la mémoire de tous les étudiants ». Aucune source n’est indiquée.','An advertisement claims: “This method improves the memory of all students.” No source is given.'],
 ['Écris trois questions qui aideraient à examiner cette affirmation sans y adhérer immédiatement.','Write three questions that would help examine this claim without accepting it immediately.'],
 ['Applique la même démarche à une information professionnelle reçue sans référence.','Apply the same approach to an unsourced claim received at work.'],
 [['source','Une source identifiable','An identifiable source','Chercher qui affirme cela et si une étude consultable existe.','Find who makes the claim and whether a verifiable study exists.'],
  ['method','Une méthode vérifiable','A verifiable method','Questionner les observations, la comparaison et la population.','Ask about observations, comparisons and the studied population.'],
  ['limits','Les limites de la généralisation','Limits of generalization','Une affirmation universelle exige des preuves particulièrement solides.','A universal claim requires particularly strong evidence.']]
 ),
 'core.causality':task(
 ['Une équipe remarque que les ventes augmentent les jours où la température monte.','A team notices that sales increase on warmer days.'],
 ['Propose une cause alternative et une observation pour distinguer deux explications possibles.','Propose an alternative cause and an observation to distinguish two explanations.'],
 ['Réexamine une corrélation observée dans une activité quotidienne, sans conclure trop vite.','Revisit an everyday correlation without drawing a hasty conclusion.'],
 [['alternatives','Plusieurs causes plausibles','Several plausible causes','Distinguer au moins deux mécanismes pouvant expliquer les données.','Separate at least two mechanisms that could explain the data.'],
  ['test','Une comparaison éclairante','An informative comparison','Chercher ce qui différerait si une hypothèse plutôt qu’une autre était vraie.','Look for what would differ if one hypothesis rather than another were true.']]
 ),
 'study.retrieval':task(
 ['Tu as lu une courte explication scientifique hier. Tu souhaites vérifier ce que tu peux expliquer aujourd’hui sans relire.','Yesterday you read a short scientific explanation. Today you want to check what you can explain without rereading.'],
 ['Décris un exercice de restitution autonome puis une façon d’identifier les points à revoir.','Describe a retrieval exercise and a way to identify what needs reviewing.'],
 ['Essaie ce processus sur une règle professionnelle ou une notion que tu apprends actuellement.','Try the same process on a work procedure or concept you are currently learning.'],
 [['unaided','Une restitution avant la relecture','Retrieval before rereading','Faire une tentative sans consulter d’abord la réponse.','Attempt to recall the idea before consulting the answer.'],
  ['checking','Une vérification avec la source','Checking against the source','Comparer les idées restituées avec une référence et noter les écarts.','Compare recalled ideas with a reference and identify gaps.']]
 ),
 'work.requirements':task(
 ['Une équipe demande : « Le logiciel doit être rapide et simple à utiliser ».','A team requests: “The software must be fast and easy to use.”'],
 ['Transforme cette demande en deux critères observables et explique une question à poser au demandeur.','Turn this request into two observable criteria and explain a question to ask the requester.'],
 ['Choisis une autre demande vague de ton environnement et précise comment la vérifier.','Choose another vague requirement from your environment and explain how to verify it.'],
 [['observable','Un critère qui peut être observé','A criterion that can be observed','Préciser une action, une condition et une observation vérifiable.','Specify an action, a condition and a verifiable observation.'],
  ['clarification','Une question au demandeur','A question to the requester','Lever une ambiguïté avant de prétendre tester la solution.','Resolve an ambiguity before claiming that the solution can be tested.']]
 )
});
export function availableFormative(registry,skillId,locale='fr'){
 const skill=registry.skills.get(skillId);
 if(!skill)return null;
 const task=skill.assessment??defaultFormativeTasks[skillId];
 if(!task)return null;
 const canonical=validateFormativeTask(task);
 const lang=locale==='en'?'en':'fr';
 return {
  skillId,version:canonical.version,
  title:skill.title[lang],
  scenario:canonical.scenario[lang],
  question:canonical.question[lang],
  transfer:canonical.transfer[lang],
  criteria:canonical.criteria.map(x=>({id:x.id,label:x.label[lang],guidance:x.guidance[lang]}))
 };
}
/** This is a reflective action, never proof of mastery or a medical/cognitive profile. */
export function makeFormativeObservation(registry,skillId,checkedCriteria=[],at=new Date().toISOString()){
 const active=availableFormative(registry,skillId);
 check(active,'No authored formative task for '+skillId);
 check(Array.isArray(checkedCriteria)&&checkedCriteria.length<=active.criteria.length,'Invalid criteria selection');
 const ids=new Set(active.criteria.map(x=>x.id));
 check(checkedCriteria.every(x=>typeof x==='string'&&ids.has(x)),'Unknown self-check criterion');
 check(new Set(checkedCriteria).size===checkedCriteria.length,'Duplicate self-check criterion');
 check(Number.isFinite(Date.parse(at)),'Invalid observation date');
 return {schema:FORMATIVE_OBSERVATION,skillId,taskVersion:active.version,
  at:new Date(at).toISOString(),criterionIds:[...checkedCriteria],source:'self-reflection',
  certification:'none',conclusion:'not-assessed'};
}
export function normalizeFormativeObservations(registry,items){
 check(Array.isArray(items)&&items.length<=500,'Formative observation limit (500)');
 return items.map(x=>{
  check(isObject(x)&&x.schema===FORMATIVE_OBSERVATION,'Unknown formative observation schema');
  const normalized=makeFormativeObservation(registry,x.skillId,x.criterionIds,x.at);
  check(x.taskVersion===normalized.taskVersion,'Assessment task version differs: review and retake');
  return normalized;
 });
}
