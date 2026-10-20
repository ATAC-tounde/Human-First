/**
 * HUMAN FIRST common UI language preference for THINK, FOCUS, LEARN,
 * DECIDE, JOURNEY and STUDIO. Stores only 'fr' or 'en', never user profiles.
 * Explicit ?lang= takes precedence; direct cross-pillar links propagate it.
 * No telemetry, cookie, network call or third-party dependency.
 */
export const UI_LANGUAGE_KEY='hf.ui.language.v1';
const supported=new Set(['fr','en']);
export const UI_PATHS=new Set(['/','/index.html','/focus','/focus.html','/learn','/learn.html',
 '/decide','/decide.html','/journey','/journey.html','/studio','/studio.html']);
const valid=value=>supported.has(value)?value:null;
export function chooseLanguage({search='',stored=null,browser='fr'}={}){
 const input=new URLSearchParams(search.startsWith('?')?search.slice(1):search).get('lang');
 return valid(input)??valid(stored)??(String(browser).toLowerCase().startsWith('en')?'en':'fr');
}
export function savedLanguage(storage){
 try{
  const target=storage===undefined?globalThis.localStorage:storage;
  return valid(target?.getItem(UI_LANGUAGE_KEY));
 }catch{return null;}
}
export function initialLanguage({location=globalThis.location,storage,language=globalThis.navigator?.language}={}){
 return chooseLanguage({search:location?.search??'',stored:savedLanguage(storage),browser:language??'fr'});
}
export function rememberLanguage(locale,storage){
 if(!valid(locale))throw new TypeError('Unsupported UI language');
 try{
  const target=storage===undefined?globalThis.localStorage:storage;
  if(!target)return false;
  target.setItem(UI_LANGUAGE_KEY,locale);
  return true;
 }catch{return false;}
}
export function localizeHref(href,lang,{origin='https://human-first.local'}={}){
 if(!valid(lang))throw new TypeError('Unsupported UI language');
 if(typeof href!=='string'||!href||href.startsWith('#'))return href;
 let url;
 try{url=new URL(href,origin);}catch{return href;}
 if(url.origin!==origin||!UI_PATHS.has(url.pathname))return href;
 url.searchParams.set('lang',lang);
 return url.pathname+url.search+url.hash;
}
export function localizeLinks(lang,root=globalThis.document,{origin=globalThis.location?.origin??'https://human-first.local'}={}){
 if(!root?.querySelectorAll)return;
 for(const link of root.querySelectorAll('a[href]')){
  const original=link.getAttribute('href');
  const translated=localizeHref(original,lang,{origin});
  if(original!==translated)link.setAttribute('href',translated);
 }
}
export function syncLanguage(lang,{storage,root,origin}={}){
 rememberLanguage(lang,storage);
 localizeLinks(lang,root,{origin:origin??globalThis.location?.origin??'https://human-first.local'});
 return lang;
}
