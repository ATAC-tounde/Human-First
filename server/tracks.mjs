// V0.3.1 - advisory paths: never lock exercises behind a score or a streak.
const items = {
  causalite:    {tier:1,skills:['evidence','causality'],next:'source'},
  deduction:    {tier:1,skills:['logic'],next:'contreexemple'},
  moyenne:      {tier:1,skills:['data'],next:'probabilites'},
  source:       {tier:2,skills:['evidence','source-checking'],next:'decision'},
  planification:{tier:2,skills:['planning','self-regulation'],next:'rappel'},
  contreexemple:{tier:2,skills:['logic','counterexample'],next:'decision'},
  probabilites: {tier:3,skills:['data','base-rate'],next:'decision'},
  rappel:       {tier:2,skills:['retrieval','memory'],next:'decision'},
  decision:     {tier:3,skills:['judgement','privacy'],next:null}
};
const paths=[
 {id:'reason',ids:['deduction','contreexemple','causalite','source'],fr:{name:'Penser avec rigueur',description:'Comparer des arguments, construire des preuves et identifier les généralisations.'},en:{name:'Reason with care',description:'Assess arguments, construct evidence and challenge sweeping claims.'}},
 {id:'data',ids:['moyenne','probabilites'],fr:{name:'Lire les données',description:'Comprendre les moyennes, probabilités et informations trompeuses.'},en:{name:'Read the data',description:'Understand averages, probability and misleading statistics.'}},
 {id:'learn',ids:['planification','rappel'],fr:{name:'Apprendre durablement',description:'Choisir une stratégie et rappeler une idée sans consulter la réponse.'},en:{name:'Learn for the long term',description:'Plan your study and recall ideas without looking up the answer.'}},
 {id:'decide',ids:['decision','source'],fr:{name:'Décider librement',description:'Définir ses critères et examiner les affirmations avant de décider.'},en:{name:'Decide independently',description:'Define your criteria and check claims before choosing.'}}
];
export function metadataFor(id){return items[id]??{tier:1,skills:[],next:null};}
export function publicPaths(locale='fr',availableIds=[]){
  const available = new Set(availableIds);
  return paths.map(x=>({id:x.id,...x[locale==='en'?'en':'fr'],exerciseIds:x.ids.filter(id=>available.has(id))}));
}
export function enhanceCatalog(catalog){return catalog.map(x=>({...x,...metadataFor(x.id)}));}