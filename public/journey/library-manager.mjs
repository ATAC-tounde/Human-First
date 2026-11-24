import {createRegistry} from './engine.mjs';
import {starterLibraries} from './libraries.mjs';

export function packReference(pack){
 return pack.id+'@'+pack.version;
}

function sameJsonContent(value,original){
 if(value===original)return true;
 if(!value||!original||typeof value!=='object'||typeof original!=='object')return false;
 if(Array.isArray(value)!==Array.isArray(original))return false;
 if(Array.isArray(value)&&value.length!==original.length)return false;
 const keys=Object.keys(original);
 return keys.length===Object.keys(value).length&&keys.every(key=>
  Object.hasOwn(value,key)&&sameJsonContent(value[key],original[key]));
}

// Object member order is immaterial in JSON. The order of activities and criteria is meaningful.
export function isBundledCopy(pack,original){
 return Boolean(pack&&original)&&pack.id===original.id&&sameJsonContent(pack,original);
}

export function bundledReferences(packs){
 return packs.filter(pack=>isBundledCopy(pack,starterLibraries.find(library=>library.id===pack.id)?.pack)).map(packReference);
}

/** Validate a bundled pack through the same strict registry as uploaded JSON. */
export function addStarterLibrary(installedPacks,optionalPacks,libraryId){
 const candidate=starterLibraries.find(x=>x.id===libraryId);
 if(!candidate)throw new TypeError('Unknown starter library');
 if(!Array.isArray(installedPacks)||!Array.isArray(optionalPacks))throw new TypeError('Pack arrays required');
 if([...installedPacks,...optionalPacks].some(p=>p.id===candidate.id))throw new TypeError('Library already loaded');
 const nextPacks=[...optionalPacks,JSON.parse(JSON.stringify(candidate.pack))];
 const registry=createRegistry([...installedPacks,...nextPacks]);
 return {registry,optionalPacks:nextPacks,library:candidate};
}
