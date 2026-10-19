// Optional independent retrieval tasks. The reference is never public before submit.
import {catalog,localizeExercise} from './catalog.mjs';
const standard = {
 fr: title=>`Sans relire, explique avec tes propres mots l'idée de « ${title} », puis propose un exemple nouveau.`,
 en: title=>`Without rereading, explain the main idea of “${title}” in your own words and invent a new example.`
};
export function reviewTask(id,locale='fr'){
 const ex=catalog.find(x=>x.id===id);
 if(!ex)return null;
 const item=localizeExercise(ex,locale);
 const lang=locale==='en'?'en':'fr';
 return {prompt:standard[lang](item.title),example:item.explanation};
}
export function reviewIds(){return catalog.map(x=>x.id);}
