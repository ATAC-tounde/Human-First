import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {UI_LANGUAGE_KEY,chooseLanguage,savedLanguage,rememberLanguage,initialLanguage,
 localizeHref,localizeLinks,syncLanguage,UI_PATHS} from '../public/language.mjs';
import {studioText,STUDIO_DICTIONARY_SIZE,renderStudioLanguage,refreshStudioPanels} from '../public/studio/translations.mjs';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFile(join(root,path),'utf8');
const memoryStore=()=>{
 const data=new Map();
 return {data,getItem(key){return data.get(key)??null;},setItem(key,value){data.set(key,value);}};
};
test('i18n: query wins over existing preference; stored choice wins over browser; invalid choice is ignored',()=>{
 assert.equal(chooseLanguage({search:'?lang=en',stored:'fr',browser:'fr-FR'}),'en');
 assert.equal(chooseLanguage({search:'?lang=fr',stored:'en',browser:'en-US'}),'fr');
 assert.equal(chooseLanguage({search:'',stored:'en',browser:'fr-FR'}),'en');
 assert.equal(chooseLanguage({search:'?lang=de',stored:'en',browser:'fr-FR'}),'en');
 assert.equal(chooseLanguage({search:'?lang=XX',stored:'xx',browser:'en-US'}),'en');
 assert.equal(chooseLanguage({search:'',stored:null,browser:'es-ES'}),'fr');
});
test('i18n: only non-personal FR/EN string is stored; disabled browser storage is safe',()=>{
 const storage=memoryStore();
 assert.equal(savedLanguage(storage),null);
 assert.equal(rememberLanguage('en',storage),true);
 assert.equal(storage.data.size,1);
 assert.equal(storage.data.get(UI_LANGUAGE_KEY),'en');
 assert.equal(initialLanguage({location:{search:''},storage,language:'fr-FR'}),'en');
 assert.equal(initialLanguage({location:{search:'?lang=fr'},storage,language:'en-US'}),'fr');
 assert.throws(()=>rememberLanguage('de',storage),/Unsupported UI language/);
 const blocked={getItem(){throw new Error('storage blocked');},setItem(){throw new Error('storage blocked');}};
 assert.equal(savedLanguage(blocked),null);
 assert.equal(rememberLanguage('en',blocked),false);
});
test('i18n: all six application pages and navigable aliases accept propagated locale',()=>{
 for(const path of ['/', '/index.html','/focus','/focus.html','/learn','/learn.html',
  '/decide','/decide.html','/journey','/journey.html','/studio','/studio.html']){
  assert.ok(UI_PATHS.has(path));
  assert.equal(localizeHref(path,'en'),path+'?lang=en');
  assert.equal(localizeHref(path+'?lang=fr#learning','en'),path+'?lang=en#learning');
 }
 assert.equal(localizeHref('/studio?foo=bar#section','fr'),'/studio?foo=bar&lang=fr#section');
 assert.equal(localizeHref('https://external.example.org/studio','en'),'https://external.example.org/studio');
 assert.equal(localizeHref('/api/catalog?lang=fr','en'),'/api/catalog?lang=fr');
 assert.equal(localizeHref('#method','en'),'#method');
 assert.equal(localizeHref('/styles.css','en'),'/styles.css');
 assert.equal(localizeHref('mailto:help@example.org','en'),'mailto:help@example.org');
});
test('i18n: sync function updates all eligible internal anchors including Studio',()=>{
 const storage=memoryStore();
 const elements=['/','/focus','/learn?lang=fr','/decide','/journey','/studio','https://example.org/'].map(href=>({
  href,getAttribute(name){return name==='href'?this.href:null;},setAttribute(name,value){assert.equal(name,'href');this.href=value;}
 }));
 const root={querySelectorAll:sel=>{assert.equal(sel,'a[href]');return elements;}};
 assert.equal(syncLanguage('en',{storage,root,origin:'https://human-first.local'}),'en');
 assert.deepEqual(elements.map(x=>x.href),['/?lang=en','/focus?lang=en','/learn?lang=en','/decide?lang=en','/journey?lang=en','/studio?lang=en','https://example.org/']);
 assert.equal(storage.data.get(UI_LANGUAGE_KEY),'en');
 syncLanguage('fr',{storage,root,origin:'https://human-first.local'});
 assert.equal(elements[5].href,'/studio?lang=fr');
});
test('i18n: Studio translates its labels and dynamic editor headings, not the actual authored data',()=>{
 assert.ok(STUDIO_DICTIONARY_SIZE>=150);
 assert.equal(studioText('Paramètres du référentiel','en'),'Framework settings');
 assert.equal(studioText('Éditer une compétence','en'),'Edit competency');
 assert.equal(studioText('Nom de la compétence · EN','en'),'Competency name · EN');
 assert.equal(studioText('Soumettre à une revue','en'),'Submit for review');
 assert.equal(studioText('Mon expression scientifique originale','en'),'Mon expression scientifique originale');
 assert.equal(studioText('15 erreur(s) structurelle(s) détectée(s).','en'),'15 structural error(s) found.');
 assert.equal(studioText('Paramètres du référentiel','fr'),'Paramètres du référentiel');
});

test('i18n: storage getter throwing SecurityError cannot break an application at startup',()=>{
 const before=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 try{
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){
   throw new DOMException('Local storage blocked by policy','SecurityError');
  }});
  assert.equal(savedLanguage(),null);
  assert.equal(rememberLanguage('en'),false);
  assert.equal(initialLanguage({location:{search:''},language:'en-US'}),'en');
  assert.equal(initialLanguage({location:{search:'?lang=fr'},language:'en-US'}),'fr');
  assert.equal(syncLanguage('en',{root:{querySelectorAll:()=>[]}}),'en');
 }finally{
  if(before)Object.defineProperty(globalThis,'localStorage',before);
  else delete globalThis.localStorage;
 }
});
test('i18n: all actual page links propagate the preference across the six pillar destinations',async()=>{
 const pages=['index.html','focus.html','learn.html','decide.html','journey.html','studio.html'];
 const storage=memoryStore();
 const seen=new Set();
 for(const page of pages){
  const html=await read('public/'+page);
  const hrefs=[...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1]);
  const links=hrefs.map(href=>({
   href,getAttribute(attr){return attr==='href'?this.href:null;},
   setAttribute(attr,value){assert.equal(attr,'href');this.href=value;}
  }));
  const root={querySelectorAll:()=>links};
  syncLanguage('en',{storage,root,origin:'https://human-first.local'});
  assert.equal(storage.data.get(UI_LANGUAGE_KEY),'en');
  assert.ok(links.some(link=>link.href.includes('lang=en')),page+' must link to an application space');
  for(const link of links){
   const url=new URL(link.href,'https://human-first.local');
   if(UI_PATHS.has(url.pathname)&&url.origin==='https://human-first.local'){
    assert.equal(url.searchParams.get('lang'),'en',page+' → '+url.pathname);
    seen.add(url.pathname);
   }
  }
 }
 for(const dest of ['/','/focus','/learn','/decide','/journey','/studio'])
  assert.ok(seen.has(dest),'Navigation to '+dest+' must exist and retain EN');
});
test('i18n: Studio model-generated validation diagnostics and prefixes are fully localized',()=>{
 assert.equal(studioText('Auteur obligatoire (2 à 80 caractères).','en'),'Author required (2–80 characters).');
 assert.equal(studioText('Licence ou régime de permission non reconnu.','en'),'Unrecognized license or permission regime.');
 assert.equal(studioText('⚠ Renseigner la provenance des ressources avant toute diffusion institutionnelle.','en'),
  '⚠ Document the sources of materials before institutional distribution.');
 assert.equal(studioText('✖ Métadonnée qualificationTags incorrecte.','en'),
  '✖ Invalid metadata field qualificationTags.');
 assert.equal(studioText('Référentiel invalide : Auteur obligatoire (2 à 80 caractères). | URL de provenance HTTPS invalide.','en'),
  'Invalid framework: Author required (2–80 characters). | Invalid HTTPS provenance URL.');
 assert.equal(studioText('Publication refusée : Licence ou régime de permission non reconnu.','en'),
  'Publication refused: Unrecognized license or permission regime.');
 assert.equal(studioText('7 erreur(s) structurelle(s) détectée(s).','en'),'7 structural error(s) found.');
 assert.equal(studioText('Structure valide : 4 compétence(s), 2 parcours. Revue éditoriale toujours nécessaire.','en'),
  'Valid structure: 4 competency(ies), 2 pathway(s). Editorial review is still required.');
});
test('i18n: actual Studio UI translation preserves unsaved form fields and recomputes derived sections',async()=>{
 const saved={fr:'Texte rédigé en français, non enregistré',en:'Unsaved English learning outcome',author:'Custom author'};
 const original={...saved};
 const elements=[
  {value:saved.fr},{value:saved.en},{value:saved.author}
 ];
 const link={href:'/journey',getAttribute(n){return n==='href'?this.href:null;},setAttribute(n,v){this.href=v;}};
 const button={textContent:'EN',attrs:{},
  setAttribute(k,v){this.attrs[k]=v;}};
 const previewPanel={hidden:false};
 const textNode={nodeValue:'Paramètres du référentiel',parentElement:{closest:()=>false}};
 const summaryNode={nodeValue:'7 structural error(s) found.',parentElement:{closest:selector=>selector.includes('#validation-summary')}};
 const root={
  body:{querySelectorAll:()=>[]},
  documentElement:{lang:'fr'},title:'',
  querySelectorAll:selector=>selector==='a[href]'?[link]:[],
  createTreeWalker:()=>{
   let consumed=false;
   return {nextNode(){
    if(consumed)return null;
    consumed=true;
    return textNode;
   }};
  },
  getElementById:id=>id==='studio-language-switch'?button:id==='preview-panel'?previewPanel:null
 };
 const before=globalThis.NodeFilter;
 try{
  globalThis.NodeFilter={SHOW_TEXT:4};
  let drawCount=0,checkCount=0,previewCount=0;
  const refresh=language=>refreshStudioPanels(language,{root,
   drawTree(){
    drawCount++;
    root.treeTitle=language==='en'?'Scientific reasoning':'Raisonnement scientifique';
    root.auditDate=language==='en'?'20/10/2026':'20/10/2026';
   },
   showValidation(){checkCount++;root.summary=language==='en'?'3 structural error(s) found.':'3 erreur(s) structurelle(s) détectée(s).';},
   renderPreview(focus){assert.equal(focus,false,'Do not steal focus on locale change');previewCount++;root.previewTitle=language==='en'?'Independent learning':'Apprentissage autonome';}
  });
  refresh('en');
  assert.equal(textNode.nodeValue,'Framework settings');
  assert.equal(root.treeTitle,'Scientific reasoning');
  assert.equal(root.previewTitle,'Independent learning');
  assert.equal(button.attrs['aria-label'],'Switch to French');
  assert.equal(link.href,'/journey?lang=en');
  // The draft remains in the same editor inputs throughout the toggle.
  assert.deepEqual(elements.map(e=>e.value),Object.values(original));
  // A French toggle should reverse translated UI text and show the original draft.
  refresh('fr');
  assert.equal(textNode.nodeValue,'Paramètres du référentiel');
  assert.equal(root.treeTitle,'Raisonnement scientifique');
  assert.equal(button.attrs['aria-label'],'Passer en anglais');
  assert.equal(link.href,'/journey?lang=fr');
  assert.deepEqual(elements.map(e=>e.value),Object.values(original));
  assert.equal(drawCount,2);
  assert.equal(checkCount,2);
  assert.equal(previewCount,2);
  // A hidden preview must not be regenerated needlessly.
  previewPanel.hidden=true;refresh('en');
  assert.equal(previewCount,2);
 }finally{
  if(before===undefined)delete globalThis.NodeFilter;
  else globalThis.NodeFilter=before;
 }
});
test('i18n: Studio production toggle uses refreshStudioPanels without recreating editing inputs',async()=>{
 const studio=await read('public/studio/app.mjs');
 const start=studio.indexOf("$('studio-language-switch').addEventListener");
 const end=studio.indexOf("$('editor-form').addEventListener",start);
 assert.ok(start>0&&end>start);
 const action=studio.slice(start,end);
 assert.match(action,/refreshStudioPanels\(locale,\{drawTree,showValidation,renderPreview\}\)/);
 assert.doesNotMatch(action,/\bdraw\s*\(|editorFields\s*\(|reset\s*\(/);
 const translation=await read('public/studio/translations.mjs');
 assert.match(translation,/forbidden=.*textarea,select/);
 assert.match(translation,/originalTexts/);
 const server=await read('server/index.mjs');
 assert.match(server,/'\/language\.mjs'/);
 assert.match(server,/'\/studio\/translations\.mjs'/);
});
test('i18n: a pending LEARN bootstrap disables switching and restores preference before remote requests',async()=>{
 const source=await read('public/learn.js');
 const start=source.indexOf('async function bootstrap()');
 const block=source.slice(start);
 assert.match(block,/\$\('switch-lang'\)\.disabled=true/);
 assert.ok(block.indexOf('syncLanguage(preferredLocale)')<block.lastIndexOf('api(\`/api/learn/catalog'), 'sync navigation preference before any fallible extra catalog load');
 assert.match(block,/finally\{\$\('switch-lang'\)\.disabled=state\.stage!==\'idle\'/);
});
