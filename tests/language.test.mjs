import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {UI_LANGUAGE_KEY,chooseLanguage,savedLanguage,rememberLanguage,initialLanguage,
 localizeHref,localizeLinks,syncLanguage,UI_PATHS} from '../public/language.mjs';
import {studioText,STUDIO_DICTIONARY_SIZE,renderStudioLanguage} from '../public/studio/translations.mjs';
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
test('i18n: all pillars read the same language preference and preserve navigation',async()=>{
 for(const path of ['public/app.js','public/focus.js','public/learn.js','public/decide.js','public/journey/app.mjs','public/studio/app.mjs']){
  const src=await read(path);
  assert.match(src,/\binitialLanguage\s*\(/,path+' must load language');
  assert.match(src,/\bsyncLanguage\s*\(|renderStudioLanguage\s*\(/,path+' must propagate preference');
 }
 const home=await read('public/index.html');
 const studio=await read('public/studio.html');
 const server=await read('server/index.mjs');
 assert.match(home,/href="\/studio"/);
 assert.match(studio,/id="studio-language-switch"/);
 assert.match(server,/'\/language\.mjs'/);
 assert.match(server,/'\/studio\/translations\.mjs'/);
});
test('i18n: Studio language toggle does not call draw or clear form values',async()=>{
 const studio=await read('public/studio/app.mjs');
 const start=studio.indexOf("$('studio-language-switch').addEventListener");
 const end=studio.indexOf("$('editor-form').addEventListener",start);
 assert.ok(start>0&&end>start);
 const action=studio.slice(start,end);
 assert.match(action,/refreshStudioLanguage\(\)/);
 assert.doesNotMatch(action,/\bdraw\s*\(|reset\s*\(/);
 const translation=await read('public/studio/translations.mjs');
 assert.match(translation,/forbidden=.*textarea,select/);
 assert.match(translation,/originalTexts/);
});
