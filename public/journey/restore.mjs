/**
 * All user-facing JSON or encrypted portfolio restores follow one conservative
 * policy: exact catalog versions restore directly; older versions require an
 * explicit reviewed alias manifest, never heuristic or silent data loss.
 */
import {importPortfolio} from './engine.mjs';
import {migratePortfolio} from './continuity.mjs';
function object(x){return x!==null&&typeof x==='object'&&!Array.isArray(x);}
export function restorePortablePortfolio(content,registry,manifest=null){
 if(typeof content!=='string'||content.length>80_000)throw new TypeError('Portfolio exceeds 80 kB');
 let data;
 try{data=JSON.parse(content);}catch{throw new TypeError('Invalid portfolio JSON');}
 if(!object(data)||data.schema!=='hf.portfolio.v1'||!object(data.profile))
   throw new TypeError('Unsupported portfolio schema');
 if(typeof data.catalogVersion!=='string'||!data.catalogVersion)
   throw new TypeError('Missing catalog version. Keep the original file and contact the content author for a compatible manifest.');
 if(data.catalogVersion!==registry.version){
  if(!manifest)throw new TypeError('Different catalog version: import a reviewed equivalence map first. Nothing was changed.');
  return migratePortfolio(content,registry,manifest);
 }
 // Even a file claiming the current version cannot silently drop unfamiliar
 // IDs. Self-declared familiarity must remain intact or import aborts.
 const familiarity=data.profile.familiarity;
 if(familiarity!==undefined){
  if(!object(familiarity))throw new TypeError('Invalid learner familiarity data');
  for(const key of Object.keys(familiarity)){
   if(!registry.skills.has(key))throw new TypeError('Unknown competency '+key+': no data discarded. Supply a compatible catalog.');
  }
 }
 return importPortfolio(content,registry);
}
