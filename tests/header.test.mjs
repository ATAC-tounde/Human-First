import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderSiteHeader} from '../public/ui/header.mjs';

const pages=['index','focus','learn','decide','journey','studio'];
const read=path=>readFile(new URL('../public/'+path,import.meta.url),'utf8');
const markup=html=>html.match(/<header class="hf-site-header"[\s\S]*?<\/header>/)?.[0];

test('Design system: the exact same logo, label order, links and language control across all six pages',async()=>{
 const html=await Promise.all(pages.map(page=>read(page+'.html')));
 const expected=markup(html[0]);
 assert.ok(expected,'Shared header must exist on home');
 for(let i=0;i<pages.length;i++){
  assert.equal(markup(html[i]),expected,pages[i]+' header is not identical');
  assert.ok(html[i].includes('href="/ui/header.css"'),pages[i]+' stylesheet');
  assert.ok(html[i].includes('id="language-switch"'),pages[i]+' language button');
  assert.equal((html[i].match(/id="language-switch"/g)||[]).length,1,pages[i]+' unique language button');
 }
 const order=['nav-method','focus-nav-link','learn-nav-link','decide-nav-link',
  'journey-nav-link','studio-nav-link','nav-ethics'];
 const positions=order.map(id=>expected.indexOf('id="'+id+'"'));
 assert.ok(positions.every(x=>x>=0),'All canonical navigation links present');
 assert.deepEqual([...positions].sort((a,b)=>a-b),positions,'Header order is unchanged');
 assert.ok(expected.includes('hf-brand-mark')&&expected.includes('INITIATIVE INDÉPENDANTE'));
 assert.doesNotMatch(expected,/[↗↘↖↙↑↓→←]/);
});

test('Design system: the shared stylesheet keeps navigation legible, responsive and keyboard accessible',async()=>{
 const style=await read('ui/header.css');
 const script=await read('ui/header.mjs');
 const server=await readFile(new URL('../server/index.mjs',import.meta.url),'utf8');
 for(const route of ['/ui/header.css','/ui/header.mjs'])assert.ok(server.includes("'"+route+"'"),route+' served explicitly');
 assert.ok(style.includes('@media(max-width:1100px)'));
 assert.ok(style.includes('overflow-x:auto'),'All links stay reachable on narrow screens');
 assert.ok(style.includes('white-space:nowrap'));
 assert.ok(style.includes('focus-visible'));
 assert.ok(style.includes('background:#f8f9f5'));
 assert.ok(script.includes('aria-current'));
 assert.ok(!script.includes('innerHTML'),'Shared header does not inject HTML content');
});

test('Design system: visible navigation remains arrow-free across all six products',async()=>{
 for(const page of pages){
  const html=await read(page+'.html');
  assert.doesNotMatch(html,/[↗↘↖↙↑↓→←]/,page+' HTML');
 }
 for(const file of ['app.js','focus.js','learn.js','decide.js','journey/app.mjs',
  'studio/app.mjs','i18n.js','studio/translations.mjs']){
  const source=await read(file);
  assert.doesNotMatch(source,/[↗↘↖↙↑↓→←]/,file+' runtime UI');
 }
});

test('Design system: localized navigation changes text and active marker without changing structure',()=>{
 const attrs=(extra={})=>({
  ...extra,attributes:new Map(),getAttribute(name){return this.attributes.get(name)??null;},
  setAttribute(name,value){this.attributes.set(name,value);},
  removeAttribute(name){this.attributes.delete(name);}
 });
 const tagline=attrs({textContent:''}),method=attrs({textContent:''}),journey=attrs({textContent:''});
 const ethics=attrs({textContent:''}),brand=attrs(),language=attrs({textContent:''});
 const nav=attrs();
 const anchors=[
  attrs({id:'nav-method'}),attrs({id:'focus-nav-link'}),attrs({id:'learn-nav-link'}),
  attrs({id:'decide-nav-link'}),attrs({id:'journey-nav-link'}),attrs({id:'studio-nav-link'}),
  attrs({id:'nav-ethics'})
 ];
 const selectors={
  '[data-hf-label="tagline"]':tagline,'#nav-method':method,'#journey-nav-link':journey,
  '#nav-ethics':ethics,'#brand-link':brand,'.hf-site-nav':nav,'#language-switch':language
 };
 const header={querySelector:key=>selectors[key]??null,
  querySelectorAll:key=>key==='.hf-site-nav a'?anchors:[]};
 const root={querySelector:key=>key==='header.hf-site-header'?header:null,
  querySelectorAll:key=>key==='a[href]'?[]:[]};
 const before=Object.getOwnPropertyDescriptor(globalThis,'location');
 try{
  Object.defineProperty(globalThis,'location',{value:{pathname:'/learn',origin:'https://hf.example'},configurable:true});
  renderSiteHeader('en',root);
  assert.equal(journey.textContent,'MY JOURNEY');
  assert.equal(method.textContent,'Our method');
  assert.equal(ethics.textContent,'Our commitments');
  assert.equal(tagline.textContent,'INDEPENDENT INITIATIVE');
  assert.equal(language.textContent,'FR');
  assert.equal(anchors[2].getAttribute('aria-current'),'page');
  renderSiteHeader('fr',root);
  assert.equal(journey.textContent,'MON PARCOURS');
  assert.equal(method.textContent,'Notre méthode');
  assert.equal(language.textContent,'EN');
  assert.equal(anchors[2].getAttribute('aria-current'),'page');
  assert.equal(anchors.filter(x=>x.getAttribute('aria-current')==='page').length,1);
 }finally{
  if(before)Object.defineProperty(globalThis,'location',before);
  else delete globalThis.location;
 }
});
