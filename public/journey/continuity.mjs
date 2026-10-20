/**
 * HUMAN FIRST V1.0: portable portfolio continuity.
 * Never guess that old competency IDs mean the same as newer ones.
 * Only author-supplied, declarative, explicitly selected mappings are accepted.
 * An unresolved record aborts the import: no silent progress loss.
 */
import {importPortfolio} from './engine.mjs';
export const ALIAS_SCHEMA='hf.portfolio.aliases.v1';
const idPattern=/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x) &&
  (Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
function assert(c,message){if(!c)throw new TypeError(message);}
function list(input,key,current){
 const raw=input[key]??[];
 assert(Array.isArray(raw)&&raw.length<=400,'Invalid '+key+' aliases');
 const ids=new Set(),targets=new Set(),out=new Map();
 for(const [i,item] of raw.entries()){
  assert(plain(item),key+' alias '+i+' must be an object');
  const {from,to}=item;
  assert(typeof from==='string'&&idPattern.test(from)&&from.length<=96,key+' invalid source');
  assert(typeof to==='string'&&idPattern.test(to)&&to.length<=96,key+' invalid target');
  assert(from!==to,key+' alias must change an ID');
  assert(!ids.has(from)&&!targets.has(to),key+' duplicate source or collision');
  assert(current.has(to),key+' unknown destination '+to);
  ids.add(from);targets.add(to);out.set(from,to);
 }
 // Avoid ambiguous alias chains (A→B, B→C) that could alter past meaning.
 for(const dest of targets)assert(!ids.has(dest),key+' chained aliases are not supported');
 return out;
}
export function normalizeAliasManifest(raw,registry){
 assert(plain(raw)&&raw.schema===ALIAS_SCHEMA,'Unsupported alias manifest');
 assert(typeof raw.fromCatalogVersion==='string'&&raw.fromCatalogVersion.length<=1500&&raw.fromCatalogVersion.length>0,'Missing source catalog version');
 assert(raw.toCatalogVersion===registry.version,'Manifest target must match the installed catalog');
 const competencies=list(raw,'competencies',registry.skills);
 const pathways=list(raw,'pathways',registry.paths);
 return {schema:ALIAS_SCHEMA,fromCatalogVersion:raw.fromCatalogVersion,toCatalogVersion:raw.toCatalogVersion,competencies,pathways};
}
function parsePortfolio(content){
 assert(typeof content==='string'&&content.length<=80_000,'Portfolio must be JSON under 80 kB');
 let value;
 try{value=JSON.parse(content)}catch{throw new TypeError('Invalid portfolio JSON')}
 assert(plain(value)&&value.schema==='hf.portfolio.v1','Unknown portfolio format');
 assert(plain(value.profile)&&value.profile.adult===true,'Only consenting adult profiles are supported');
 assert(Array.isArray(value.evidence??[])&&Array.isArray(value.formative??[]),'Invalid evidence arrays');
 assert((value.evidence??[]).length<=2000&&(value.formative??[]).length<=500,'Too many records');
 return value;
}
/** Preview migration without mutating user data; no inferred or fuzzy matching. */
export function planPortfolioTransition(content,registry,manifest){
 const alias=normalizeAliasManifest(manifest,registry);
 const original=parsePortfolio(content);
 assert(original.catalogVersion===alias.fromCatalogVersion,'Portfolio version does not match this alias manifest');
 const issues=[],changes=[];
 const updated=structuredClone(original);
 const resolve=(value,map,available,kind)=>{
  if(typeof value!=='string'||!idPattern.test(value)){issues.push(kind+': invalid identifier');return value;}
  if(available.has(value))return value;
  const to=map.get(value);
  if(!to){issues.push(kind+': unmapped '+value);return value;}
  changes.push({kind,from:value,to});
  return to;
 };
 updated.profile.pathId=resolve(original.profile.pathId,alias.pathways,registry.paths,'pathway');
 if(plain(original.profile.familiarity)){
  const kept=Object.create(null);
  for(const [key,value] of Object.entries(original.profile.familiarity)){
   const target=resolve(key,alias.competencies,registry.skills,'familiarity');
   if(Object.hasOwn(kept,target)){issues.push('familiarity: ID collision '+target);continue;}
   Object.defineProperty(kept,target,{value,enumerable:true,writable:true,configurable:true});
  }
  updated.profile.familiarity={...kept};
 }
 for(const key of ['evidence','formative']){
  const collection=updated[key]??[];
  for(const item of collection){
   if(!plain(item)){issues.push(key+': invalid record');continue;}
   item.skillId=resolve(item.skillId,alias.competencies,registry.skills,key);
  }
 }
 // All observations and their original task version must still be valid.
 if(!issues.length){
  try{importPortfolio(JSON.stringify(updated),registry);}
  catch(error){issues.push('validation: '+error.message);}
 }
 const unique=[...new Set(issues)];
 return {ready:!unique.length,issues:unique,changes,
  fromCatalogVersion:alias.fromCatalogVersion,toCatalogVersion:alias.toCatalogVersion,
  transformed:!unique.length?JSON.stringify(updated):null};
}
/** Explicit import action; refusal preserves original raw file intact for the learner. */
export function migratePortfolio(content,registry,manifest){
 const plan=planPortfolioTransition(content,registry,manifest);
 assert(plan.ready,'Migration refused; original file remains unchanged: '+plan.issues.join(' | '));
 const result=importPortfolio(plan.transformed,registry);
 return {...result,migrationReport:{
  from:plan.fromCatalogVersion,to:plan.toCatalogVersion,
  changes:plan.changes,mode:'explicit-id-map',inferred:false
 }};
}
