import {createRegistry} from './engine.mjs';
import {starterLibraries} from './libraries.mjs';

export function packReference(pack){
 return pack.id+'@'+pack.version;
}

// A locally edited pack can reuse a bundled ID and version. Only mark exact copies.
export function isBundledCopy(pack,original){
 return Boolean(pack&&original)&&pack.id===original.id&&(pack===original||JSON.stringify(pack)===JSON.stringify(original));
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
