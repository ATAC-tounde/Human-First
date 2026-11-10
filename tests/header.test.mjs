import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {headerModel} from '../public/ui/header.mjs';

const PAGES=['think','focus','learn','decide','journey','studio'];
const HTML=['index','focus','learn','decide','journey','studio'];
const JS=['app.js','focus.js','learn.js','decide.js','journey/app.mjs','studio/app.mjs'];
const NAV=['think','focus','learn','decide','journey','studio','method','commitments'];
const read=(path)=>readFile(new URL('../public/'+path,import.meta.url),'utf8');

test('Design: each page has identical navigation order, brand and logo',()=>{
 const french=headerModel('think','fr');
 const english=headerModel('think','en');
 assert.equal(french.logo,'HF');
 assert.equal(english.logo,'HF');
 assert.equal(french.brand,'INITIATIVE INDÉPENDANTE');
 assert.equal(english.brand,'INDEPENDENT INITIATIVE');
 for(const page of PAGES){
  for(const language of ['fr','en']){
   const model=headerModel(page,language);
   assert.deepEqual(model.links.map(x=>x.key),NAV);
   assert.equal(model.logo,'HF');
   assert.equal(model.links.filter(x=>x.active).length,1);
   assert.equal(model.links.find(x=>x.key===page).active,true);
   assert.equal(model.links.find(x=>x.key==='method').href,page==='think'?'#method':'/?lang='+language+'#method');
   assert.equal(model.links.find(x=>x.key==='commitments').href,page==='think'?'#ethics':'/?lang='+language+'#ethics');
   assert.equal(model.links.find(x=>x.key==='journey').text,
    language==='fr'?'MON PARCOURS':'MY JOURNEY');
   assert.equal(model.links.find(x=>x.key==='studio').text,'STUDIO');
   assert.equal(model.languageButtonText,language==='fr'?'EN':'FR');
  }
 }
});

test('Design: all pages mount the same header from one source, no duplicate handcrafted nav',async()=>{
 const contents=await Promise.all(HTML.map(x=>read(x+'.html')));
 const scriptContents=await Promise.all(JS.map(read));
 for(let i=0;i<HTML.length;i++){
  const page=HTML[i],html=contents[i],script=scriptContents[i];
  assert.ok(html.includes('data-hf-header'),page);
  assert.ok(html.includes('href="/ui/header.css"'),page);
  assert.equal((html.match(/data-hf-header/g)||[]).length,1,page);
  assert.ok(script.includes("mountHeader('"+PAGES[i]+"',locale)"),JS[i]);
  assert.ok(script.includes("ui/header.mjs"),JS[i]);
  assert.ok(!html.includes('class="nav-edition"'),page);
 }
 const css=await read('ui/header.css');
 const module=await read('ui/header.mjs');
 assert.ok(css.includes('header.hf-header'), 'Shared namespaced style');
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('prefers-reduced-motion'));
 assert.ok(css.includes('@media(max-width:1030px)'));
 assert.ok(module.includes("aria-expanded"), 'Accessible menu state');
 assert.ok(module.includes('Escape'), 'Keyboard closes menu');
 assert.ok(module.includes("aria-current"), 'Current page exposed to assistive technology');
 assert.ok(module.includes('MutationObserver'), 'Header follows page-controlled language');
 assert.ok(module.includes("event.preventDefault()"),'Active navigation cannot discard an in-progress task');
});

test('Design: existing navigation IDs are kept for each interactive page',()=>{
 const expect={
  think:{button:'language-switch',focus:'focus-nav-link',journey:'journey-nav-link',studio:'studio-nav-link'},
  focus:{button:'focus-language-switch',think:'back-home',learn:null},
  learn:{button:'switch-lang',think:'nav-think',focus:'nav-focus',decide:'nav-decide',journey:'nav-journey'},
  decide:{button:'switch-lang',think:'nav-think',focus:'nav-focus',learn:'nav-learn',journey:'nav-journey'},
  journey:{button:'lang',think:'link-think',focus:'link-focus',learn:'link-learn',decide:'link-decide',studio:'link-studio'},
  studio:{button:'studio-language-switch'}
 };
 for(const page of PAGES){
  const model=headerModel(page,'fr');
  assert.equal(model.languageButtonId,expect[page].button);
  for(const [key,value] of Object.entries(expect[page])){
   if(key!=='button'&&value!==null)assert.equal(model.links.find(x=>x.key===key)?.id,value);
  }
 }
});

test('Design: decorative arrows are gone from all visible FR/EN screen copy and scripts',async()=>{
 for(const file of [...HTML.map(p=>p+'.html'),...JS,
  'i18n.js','studio/translations.mjs']){
  const content=await read(file);
  assert.doesNotMatch(content,/[←→↑↓↗↘↙↖↔⇢⇠➜➤➔⟶⟵↪↩]/u,file);
 }
});

function luminance(hex){
 const channels=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255)
  .map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('Design: header main text, secondary text and action foreground have WCAG AA contrast',()=>{
 assert.ok(ratio('#294639','#fffefa')>=4.5);
 assert.ok(ratio('#425d4e','#fffefa')>=4.5);
 assert.ok(ratio('#52685e','#fffefa')>=4.5);
 assert.ok(ratio('#17412c','#e9f1e7')>=4.5);
 assert.ok(ratio('#163f2b','#e6eee3')>=4.5);
});

test('Design: server makes shared assets accessible without opening an arbitrary file route',async()=>{
 const server=await readFile(new URL('../server/index.mjs',import.meta.url),'utf8');
 assert.ok(server.includes("'/ui/header.mjs': ['ui/header.mjs'"));
 assert.ok(server.includes("'/ui/header.css': ['ui/header.css'"));
});
