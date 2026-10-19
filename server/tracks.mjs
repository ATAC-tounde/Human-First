// Reconciled with the 20-item V0.3 curriculum already merged into main (#3).
import {catalog} from './catalog.mjs';
const paths = [
  {id:'reason',domain:'logic',fr:{name:'Raisonner avec rigueur',description:'Déductions, contre-exemples et arguments.'},en:{name:'Reason with care',description:'Deduction, counterexamples and arguments.'}},
  {id:'critical',domain:'critical',fr:{name:'Vérifier les affirmations',description:'Sources, causes, chiffres et incertitudes.'},en:{name:'Challenge claims',description:'Sources, causes, numbers and uncertainty.'}},
  {id:'problem',domain:'problem',fr:{name:'Résoudre des problèmes',description:'Clarifier les contraintes et comparer les stratégies.'},en:{name:'Solve problems',description:'Identify constraints and compare strategies.'}},
  {id:'learn',domain:'learn',fr:{name:'Apprendre et retrouver',description:'Compréhension, rappel et transfert.'},en:{name:'Learn and retrieve',description:'Understanding, recall and transfer.'}}
];
export function metadataFor(id){
  const item=catalog.find(x=>x.id===id);
  if(!item)return {tier:1,skills:[],next:null};
  const same=catalog.filter(x=>x.domain===item.domain && x.id!==id);
  const next=same.sort((a,b)=>Math.abs((a.difficulty||1)-(item.difficulty||1))-
    Math.abs((b.difficulty||1)-(item.difficulty||1)))[0];
  return {tier:item.difficulty||1,skills:[item.domain||'general'],next:next?.id||null};
}
export function publicPaths(locale='fr',availableIds=[]){
 const available=new Set(availableIds);
 return paths.map(p=>({id:p.id,...p[locale==='en'?'en':'fr'],
   exerciseIds:catalog.filter(x=>x.domain===p.domain && available.has(x.id)).map(x=>x.id)}));
}
export function enhanceCatalog(entries){return entries.map(x=>({...x,...metadataFor(x.id)}));}
