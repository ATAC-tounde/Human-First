import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {headerModel,mountHeader} from '../public/ui/header.mjs';

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

test('Design: all pages hydrate the same header with identical server-visible navigation fallback',async()=>{
 const contents=await Promise.all(HTML.map(x=>read(x+'.html')));
 const scriptContents=await Promise.all(JS.map(read));
 const rawHeaders=contents.map(html=>html.match(/<header class="hf-header" data-hf-header>[\s\S]*?<\/header>/)?.[0]);
 assert.ok(rawHeaders[0],'Fallback must contain visible navigation without JavaScript');
 for(const markup of rawHeaders){
  assert.equal(markup,rawHeaders[0],'No server-visible header drift between pages');
  assert.ok(markup.includes('href="/studio"'));
  assert.ok(markup.includes('href="/journey"'));
  assert.ok(markup.includes('Notre méthode'));
  assert.ok(markup.includes('Nos engagements'));
 }
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
 assert.ok(css.includes('html:not(.hf-hydrated)'),'Menu remains available without JS');
 assert.ok(css.includes('scroll-padding-top:112px'),'Sticky header must not cover anchor targets');
 assert.ok(css.includes('z-index:1000!important'),'Focused skip link must be above sticky header');
 assert.ok(module.includes("aria-expanded"), 'Accessible menu state');
 assert.ok(module.includes('Escape'), 'Keyboard closes menu');
 assert.ok(module.includes("aria-current"), 'Current page exposed to assistive technology');
 assert.ok(module.includes('refreshHeaderLanguage'), 'Page apps control navigation locale');
 assert.ok(!module.includes('MutationObserver'), 'Lesson language must not override UI preference');
 assert.ok(module.includes("event.preventDefault()"),'Active navigation cannot discard an in-progress task');
});

test('Design: mounting a real DOM-like fixture preserves every page-specific navigation ID',()=>{
 const expect={
  think:{button:'language-switch',focus:'focus-nav-link',journey:'journey-nav-link',studio:'studio-nav-link'},
  focus:{button:'focus-language-switch',think:'back-home',learn:null},
  learn:{button:'switch-lang',think:'nav-think',focus:'nav-focus',decide:'nav-decide',journey:'nav-journey'},
  decide:{button:'switch-lang',think:'nav-think',focus:'nav-focus',learn:'nav-learn',journey:'nav-journey'},
  journey:{button:'lang',think:'link-think',focus:'link-focus',learn:'link-learn',decide:'link-decide',studio:'link-studio'},
  studio:{button:'studio-language-switch'}
 };
 class Element{
  constructor(tag){
   this.tag=tag;this.children=[];this.dataset={};this.attributes=new Map();this.id='';
   const classes=new Set();
   this.classList={add:(...items)=>items.forEach(x=>classes.add(x))};
  }
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  setAttribute(name,value){this.attributes.set(name,String(value));}
  getAttribute(name){return this.attributes.get(name)??null;}
  addEventListener(){}
 }
 const visit=(node)=>[node,...(node.children??[]).flatMap(visit)];
 for(const page of PAGES){
  const header=new Element('header');
  const root={documentElement:{lang:'fr',classList:{add(){}}},
   querySelector:selector=>selector==='[data-hf-header]'?header:null,
   createElement:tag=>new Element(tag),createTextNode:value=>({textContent:value})};
  mountHeader(page,'fr',root);
  const nodes=visit(header);
  const ids=new Set(nodes.map(x=>x.id).filter(Boolean));
  const model=headerModel(page,'fr');
  assert.ok(ids.has(model.languageButtonId),page+' language switch actually mounted');
  for(const [key,value] of Object.entries(expect[page])){
   if(key!=='button'&&value!==null)assert.ok(ids.has(value),page+' missing '+value);
  }
  const links=nodes.filter(x=>x.dataset?.hfNavKey);
  assert.deepEqual(links.map(x=>x.dataset.hfNavKey),NAV);
  assert.equal(links.filter(x=>x.getAttribute('aria-current')==='page').length,1);
  const logo=nodes.find(x=>x.tag==='span'&&x.textContent==='HF');
  assert.ok(logo,'Same HF logo on '+page);
 }
});

test('Design: decorative arrows are gone from all visible FR/EN screen copy and scripts',async()=>{
 for(const file of [...HTML.map(p=>p+'.html'),...JS,
  'i18n.js','studio/translations.mjs','ui/header.mjs',
  'focus-library.mjs','decide-data.mjs','journey/libraries.mjs',
  'journey/packs.mjs','journey/remote-ui.mjs','journey/compass.mjs']){
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
test('Design: declared CSS foreground/background colors meet WCAG AA contrast',async()=>{
 const css=await read('ui/header.css');
 const root=new Map([...css.matchAll(/(--hf-[\w-]+):(#[a-f0-9]{6})/gi)].map(m=>[m[1],m[2]]));
 function cssBody(needle){
  const i=css.indexOf(needle+'{');assert.ok(i>=0,'Missing selector '+needle);
  return css.slice(i+needle.length+1,css.indexOf('}',i));
 }
 function property(block,name){
  const match=block.match(new RegExp('(?:^|[;\\n])\\s*'+name+'\\s*:\\s*(#[a-f0-9]{6}|var\\(--hf-[\\w-]+\\))','i'));
  assert.ok(match,'Missing color '+name+' in '+block.slice(0,100));
  const raw=match[1];
  return raw.startsWith('var(')?root.get(raw.slice(4,-1)):raw;
 }
 const header=cssBody('header.hf-header');
 const primary=cssBody('header.hf-header .hf-header__link');
 const secondary=cssBody('header.hf-header .hf-header__link--secondary');
 const active=cssBody('header.hf-header .hf-header__link[aria-current="page"]');
 const buttons=cssBody('header.hf-header .hf-header__lang,header.hf-header .hf-header__menu');
 const surface=property(header,'background');
 for(const label of ['primary','secondary']){
  const foreground=property(label==='primary'?primary:secondary,'color');
  assert.ok(ratio(foreground,surface)>=4.5,label+' link text should meet AA');
 }
 assert.ok(ratio(property(active,'color'),property(active,'background'))>=4.5,'Selected page must be legible');
 assert.ok(ratio(property(buttons,'color'),property(buttons,'background'))>=4.5,'Language button must be legible');
 assert.ok(ratio(root.get('--hf-muted'),surface)>=4.5,'Logo tagline must be legible');
});

test('Design: server makes shared assets accessible without opening an arbitrary file route',async()=>{
 const server=await readFile(new URL('../server/index.mjs',import.meta.url),'utf8');
 assert.ok(server.includes("'/ui/header.mjs': ['ui/header.mjs'"));
 assert.ok(server.includes("'/ui/header.css': ['ui/header.css'"));
});
