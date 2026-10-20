/** HUMAN FIRST Content Studio v0.9: deterministic, offline-only editorial state machine.
 * Not an authenticated workflow, signature service, or regulated qualification register.
 */
import {createRegistry,buildJourney} from '../journey/engine.mjs';

export const STUDIO_SCHEMA='hf.studio.document.v1';
export const LICENSES=Object.freeze(['CC-BY-4.0','CC-BY-SA-4.0','CC0-1.0','PROPRIETARY','PERMISSION-REQUIRED']);
export const PILLARS=Object.freeze(['think','focus','learn','decide']);
const packIdPattern=/^[a-z][a-z0-9-]{1,39}$/;
const semver=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const copy=x=>JSON.parse(JSON.stringify(x));
const finiteText=x=>typeof x==='string'&&x.length<=6000;
const makeId=()=>globalThis.crypto?.randomUUID?.()??'draft-'+Date.now()+'-'+Math.random().toString(36).slice(2);
function guard(v,why){if(!v)throw new TypeError(why);}
function actorName(x){guard(typeof x==='string'&&x.trim().length>=2&&x.trim().length<=80,'Indique un nom de contributeur (2 à 80 caractères).');return x.trim();}
function changed(doc,event,actor){const next=copy(doc);next.updatedAt=new Date().toISOString();next.audit.push({at:next.updatedAt,event,actor:actorName(actor)});if(next.audit.length>200)next.audit.shift();return next;}
function bilingual(fr,en){return {fr,en};}
function sampleSkill(packId){return {
 id:`${packId}.analyser-besoin`,
 title:bilingual('Analyser un besoin concret','Analyse a real-world need'),
 outcome:bilingual('Clarifier un objectif et identifier des critères observables.','Clarify an objective and identify observable criteria.'),
 tags:['analyse','transversal'],requires:['core.evidence'],
 activities:{
  think:bilingual('Identifier les hypothèses contenues dans une demande ambiguë.','Identify assumptions within an ambiguous request.'),
  focus:bilingual('Observer attentivement la situation avant de proposer une solution.','Observe the situation carefully before proposing a solution.'),
  learn:bilingual('Restituer les critères essentiels sans consulter les notes.','Recall the essential criteria without looking at notes.'),
  decide:bilingual('Comparer deux réponses possibles selon les critères retenus.','Compare two possible responses against the chosen criteria.')
 },contexts:{work:bilingual('Étudier une situation professionnelle réelle anonymisée.','Study a realistic anonymized workplace situation.')}
};}
export function makeDocument({id='practice',author='Équipe pédagogique',pack=null}={}){
 guard(packIdPattern.test(id),'Identifiant du référentiel invalide.');
 const now=new Date().toISOString();
 const content=pack?copy(pack):{
  id,version:'1.0.0',title:bilingual('Compétences pour apprendre toute la vie','Skills for lifelong learning'),
  competencies:[sampleSkill(id)],pathways:[{
   id:`${id}.premier-parcours`,title:bilingual('Développer une compétence','Develop a practical skill'),
   summary:bilingual('Développer un savoir-faire transférable et explicable.','Develop a transferable and explainable practical skill.'),
   competencyIds:[`${id}.analyser-besoin`],audiences:['work','higher-education']
  }]
 };
 return {
  schema:STUDIO_SCHEMA,id:makeId(),createdAt:now,updatedAt:now,status:'draft',
  meta:{author:actorName(author),description:bilingual('Référentiel conçu pour accompagner les apprentissages autonomes.','A curriculum designed to support self-directed learning.'),
   license:'CC-BY-4.0',sourceUrl:'',sourceNote:'',territory:'international',occupationTags:[],qualificationTags:[],agePolicy:'18+',editorialNotes:''},
  pack:content,review:{reviewer:'',checks:[],requestedAt:null,approvedAt:null},
  audit:[{at:now,event:'created',actor:author.trim()}],published:null
 };
}
export function renamePack(doc,newId,actor){
 guard(doc.status==='draft','Un contenu non-brouillon ne peut pas être modifié.');
 guard(packIdPattern.test(newId),'L’identifiant doit être une chaîne simple en minuscules.');
 const d=changed(doc,'rename-pack',actor),old=d.pack.id;
 if(newId===old)return d;
 const map=id=>id.startsWith(old+'.')?newId+id.slice(old.length):id;
 d.pack.id=newId;
 d.pack.competencies.forEach(s=>{s.id=map(s.id);s.requires=s.requires.map(map);});
 d.pack.pathways.forEach(p=>{p.id=map(p.id);p.competencyIds=p.competencyIds.map(map);});
 return d;
}
export function editDraft(doc,{meta,pack},actor){
 guard(doc.status==='draft','Le référentiel doit être au statut brouillon.');
 const next=changed(doc,'edited',actor);
 if(pack!==undefined){guard(isObj(pack),'Pack attendu.');next.pack=copy(pack);}
 if(meta!==undefined){guard(isObj(meta),'Métadonnées attendues.');next.meta={...next.meta,...copy(meta)};}
 return next;
}
export function validateDocument(doc,referencePacks=[]){
 const errors=[],warnings=[];
 if(!isObj(doc)||doc.schema!==STUDIO_SCHEMA)return {ok:false,errors:['Format de document non reconnu.'],warnings,stats:null};
 if(!isObj(doc.meta)||!isObj(doc.pack))return {ok:false,errors:['Métadonnées et pack requis.'],warnings,stats:null};
 if(!actorValid(doc.meta.author))errors.push('Auteur obligatoire (2 à 80 caractères).');
 if(!LICENSES.includes(doc.meta.license))errors.push('Licence ou régime de permission non reconnu.');
 if(doc.meta.sourceUrl&&(!/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i.test(doc.meta.sourceUrl)||doc.meta.sourceUrl.length>300))errors.push('URL de provenance HTTPS invalide.');
 if(typeof doc.meta.sourceNote!=='string'||doc.meta.sourceNote.length>600)errors.push('Note de provenance trop longue.');
 if(typeof doc.meta.territory!=='string'||doc.meta.territory.length>80)errors.push('Territoire incorrect.');
 if(doc.meta.agePolicy!=='18+')errors.push('Le prototype Studio ne publie que des ressources destinées aux adultes (18+).');
 for(const k of ['occupationTags','qualificationTags'])if(!Array.isArray(doc.meta[k])||doc.meta[k].length>40||!doc.meta[k].every(x=>typeof x==='string'&&x.length<=70))errors.push(`Métadonnée ${k} incorrecte.`);
 if(!isObj(doc.meta.description)||!['fr','en'].every(k=>finiteText(doc.meta.description[k])&&doc.meta.description[k].trim().length>=8))errors.push('Description du pack FR/EN incomplète.');
 let stats=null;
 try{
  guard(Array.isArray(doc.pack.competencies)&&doc.pack.competencies.length<=200,'Maximum 200 compétences par pack de démonstration.');
  guard(Array.isArray(doc.pack.pathways)&&doc.pack.pathways.length<=60,'Maximum 60 parcours par pack de démonstration.');
  guard(semver.test(doc.pack.version),'Numéro de version sémantique invalide.');
  guard(packIdPattern.test(doc.pack.id),'Identifiant du pack invalide.');
  const reg=createRegistry([...referencePacks,doc.pack]);
  stats={packs:reg.manifests.length,competencies:doc.pack.competencies.length,pathways:doc.pack.pathways.length};
 }catch(e){errors.push(String(e.message??e));}
 if(!doc.meta.sourceUrl&&!doc.meta.sourceNote)warnings.push('Renseigner la provenance des ressources avant toute diffusion institutionnelle.');
 if(doc.meta.license==='PROPRIETARY'||doc.meta.license==='PERMISSION-REQUIRED')warnings.push('Vérifier les autorisations de réutilisation et de redistribution.');
 if(!doc.pack.pathways?.length)warnings.push('Aucun parcours défini : le pack ne permet pas de créer un programme.');
 return {ok:errors.length===0,errors,warnings,stats};
}
function actorValid(value){return typeof value==='string'&&value.trim().length>=2&&value.trim().length<=80;}
export function requestReview(doc,referencePacks=[],actor){
 guard(doc.status==='draft','Seul un brouillon peut demander une revue.');
 const report=validateDocument(doc,referencePacks);
 guard(report.ok,'Référentiel invalide : '+report.errors.join(' | '));
 guard(Boolean(doc.meta.sourceUrl)||Boolean(doc.meta.sourceNote.trim()),'Documente la provenance avant la revue éditoriale.');
 const out=changed(doc,'review-requested',actor);out.status='in-review';out.review.requestedAt=out.updatedAt;out.review.checks=[];out.review.reviewer='';return out;
}
export const REVIEW_CHECKS=Object.freeze(['accuracy','pedagogy','accessibility','licensing','privacy','translation']);
export function approveDocument(doc,{reviewer,checks},actor){
 guard(doc.status==='in-review','Le contenu doit avoir été soumis à revue.');
 const name=actorName(reviewer);
 guard(name.toLocaleLowerCase()!==doc.meta.author.trim().toLocaleLowerCase(),'Le relecteur doit être différent de l’auteur déclaré.');
 guard(Array.isArray(checks)&&REVIEW_CHECKS.every(key=>checks.includes(key)),'Les six contrôles éditoriaux sont requis.');
 const out=changed(doc,'review-approved',actor);
 out.status='approved';out.review.reviewer=name;out.review.checks=[...REVIEW_CHECKS];out.review.approvedAt=out.updatedAt;return out;
}
export function reopenDraft(doc,actor){
 guard(['in-review','approved'].includes(doc.status),'Seule une revue en cours ou approuvée peut être rouverte.');
 const out=changed(doc,'reopened',actor);out.status='draft';out.review={reviewer:'',checks:[],requestedAt:null,approvedAt:null};return out;
}
export function publishDocument(doc,referencePacks=[],actor){
 guard(doc.status==='approved','Une validation éditoriale est requise avant publication locale.');
 const valid=validateDocument(doc,referencePacks);
 guard(valid.ok,'Publication refusée : '+valid.errors.join(' | '));
 guard(doc.review.reviewer&&doc.review.approvedAt&&REVIEW_CHECKS.every(key=>doc.review.checks.includes(key)),'Revue complète requise.');
 const out=changed(doc,'local-release-exported',actor);out.status='published';
 out.published={at:out.updatedAt,reviewer:out.review.reviewer,version:out.pack.version,notice:'Export local non signé : non publié sur un catalogue central et non certifié.'};
 return out;
}
export function nextDraft(doc,newVersion,actor){
 guard(doc.status==='published','Commencer une révision depuis un document publié uniquement.');
 guard(semver.test(newVersion),'Format SemVer requis.');
 const previous=doc.pack.version.split('.').map(Number),next=newVersion.split('.').map(Number);
 guard(next[0]>previous[0]||next[0]===previous[0]&&(next[1]>previous[1]||next[1]===previous[1]&&next[2]>previous[2]),'La nouvelle version doit être supérieure.');
 const d=makeDocument({id:doc.pack.id,author:actor,pack:doc.pack});
 d.meta=copy(doc.meta);d.meta.author=actorName(actor);d.pack.version=newVersion;
 d.audit.push({at:d.createdAt,event:'derived-from-release:'+doc.pack.version,actor:actorName(actor)});
 return d;
}
export function exportPack(doc,referencePacks=[]){
 guard(doc.status==='published','Publie d’abord une version approuvée dans ce Studio.');
 const check=validateDocument(doc,referencePacks);
 guard(check.ok,check.errors.join('; '));
 // Keep this runtime pack importable by JOURNEY v0.8; discard studio metadata.
 return JSON.stringify(copy(doc.pack),null,2);
}
export function exportStudioDocument(doc){guard(isObj(doc)&&doc.schema===STUDIO_SCHEMA,'Document incompatible.');return JSON.stringify(copy(doc),null,2);}
export function importForEditing(input,{author='Équipe pédagogique',limit=500_000}={}){
 guard(typeof input==='string'&&input.length<=limit,'Fichier trop volumineux.');
 let value;try{value=JSON.parse(input);}catch{throw new TypeError('Fichier JSON invalide.');}
 guard(isObj(value),'Un document JSON est attendu.');
 const asDocument=value.schema===STUDIO_SCHEMA;
 const pack=asDocument?value.pack:value;
 guard(isObj(pack)&&packIdPattern.test(pack.id),'Identifiant de pack invalide.');
 const d=makeDocument({id:pack.id,author,pack});
 if((asDocument&&isObj(value.meta))||(!asDocument&&isObj(pack.hfStudio))){
  const meta=asDocument?value.meta:pack.hfStudio;
  for(const key of ['description','license','sourceUrl','sourceNote','territory','occupationTags','qualificationTags','agePolicy','editorialNotes'])
    if(Object.hasOwn(meta,key))d.meta[key]=copy(meta[key]);
 }
 d.audit.push({at:d.createdAt,event:'imported-as-untrusted-draft',actor:actorName(author)});
 return d;
}
export function previewDocument(doc,referencePacks=[],locale='fr'){
 const report=validateDocument(doc,referencePacks);guard(report.ok,report.errors.join(' | '));
 const registry=createRegistry([...referencePacks,doc.pack]);
 const path=doc.pack.pathways[0];guard(path,'Il faut définir au moins un parcours.');
 return buildJourney(registry,{adult:true,locale,pathId:path.id,stage:'work',ageBand:'unspecified',minutesPerWeek:60,occupation:'',qualification:'',familiarity:{}});
}