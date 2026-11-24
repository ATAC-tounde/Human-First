/**
 * All user-facing JSON or encrypted portfolio restores follow one conservative
 * policy: exact catalog versions restore directly; older versions require an
 * explicit reviewed alias manifest, never heuristic or silent data loss.
 */
import {createRegistry,importPortfolio,normalizeBundledReferences} from './engine.mjs';
import {migratePortfolio} from './continuity.mjs';
import {installedPacks} from './packs.mjs';
import {starterLibraries} from './libraries.mjs';
import {packReference,isBundledCopy} from './library-manager.mjs';
function object(x){return x!==null&&typeof x==='object'&&!Array.isArray(x);}
function readPortfolio(content){
 if(typeof content!=='string'||content.length>80_000)throw new TypeError('Portfolio exceeds 80 kB');
 let data;
 try{data=JSON.parse(content);}catch{throw new TypeError('Invalid portfolio JSON');}
 if(!object(data)||data.schema!=='hf.portfolio.v1'||!object(data.profile))
   throw new TypeError('Unsupported portfolio schema');
 if(typeof data.catalogVersion!=='string'||!data.catalogVersion)
   throw new TypeError('Missing catalog version. Keep the original file and contact the content author for a compatible manifest.');
 return data;
}
function restoreValidated(data,content,registry,manifest){
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
export function restorePortablePortfolio(content,registry,manifest=null){
 return restoreValidated(readPortfolio(content),content,registry,manifest);
}

/** Assemble the exact saved catalog in memory. The caller commits it only after validation and consent. */
export function preparePortfolioRestore(content,currentRegistry,loadedPacks,manifest=null,locale='fr'){
 const data=readPortfolio(content);
 const base=installedPacks.map(packReference).join('|');
 const version=data.catalogVersion;
 if(version!==base&&!version.startsWith(base+'|')){
  return {portfolio:restoreValidated(data,content,currentRegistry,manifest),registry:currentRegistry,
   optionalPacks:loadedPacks,legacyLibraries:[]};
 }
 const refs=version===base?[]:version.slice(base.length+1).split('|');
 const expected=new Set(refs);
 const invalidList=locale==='en'?'Invalid library list in this portfolio.':'La liste des bibliothèques du portfolio est invalide.';
 if(expected.size!==refs.length||refs.some(ref=>!ref))throw new TypeError(invalidList);
 let verifiedRefs=null;
 if(data.bundledLibraries!==undefined){
  try{verifiedRefs=new Set(normalizeBundledReferences(data.bundledLibraries,version));}
  catch{throw new TypeError(invalidList);}
 }
 const loaded=new Map(loadedPacks.map(pack=>[packReference(pack),pack]));
 const available=new Map(starterLibraries.map(lib=>[packReference(lib.pack),lib]));
 const optionalPacks=[];
 const legacyLibraries=[];
 const missing=[];
 for(const ref of refs){
  const pack=loaded.get(ref);
  const library=available.get(ref);
  const bundled=verifiedRefs?.has(ref);
  if(pack&&(verifiedRefs===null||bundled===isBundledCopy(pack,library?.pack))){
   optionalPacks.push(pack);
  }else if(library&&(bundled||verifiedRefs===null)){
   optionalPacks.push(library.pack);
   if(verifiedRefs===null)legacyLibraries.push(library.pack.title[locale]);
  }else if(pack&&bundled&&!library){
   // An older official version can still be supplied explicitly by its owner.
   optionalPacks.push(pack);
   legacyLibraries.push(pack.title[locale]+' ('+ref+')');
  }else{
   missing.push(ref);
  }
 }
 if(missing.length){
  if(version!==currentRegistry.version&&manifest?.fromCatalogVersion===version&&manifest.toCatalogVersion===currentRegistry.version){
   return {portfolio:restoreValidated(data,content,currentRegistry,manifest),registry:currentRegistry,
    optionalPacks:loadedPacks,legacyLibraries:[]};
  }
  const prefix=locale==='en'?'Import these original JSON libraries, then reopen your portfolio. Use a new tab if a name is already taken. ':'Importe ces bibliothèques JSON d’origine, puis rouvre ton portfolio. Utilise un nouvel onglet si un nom est déjà pris. ';
  throw new TypeError(prefix+missing.join(', '));
 }
 const registry=createRegistry([...installedPacks,...optionalPacks]);
 const portfolio=restoreValidated(data,content,registry,null);
 return {portfolio,registry,optionalPacks,legacyLibraries};
}
