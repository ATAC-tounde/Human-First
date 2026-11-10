/**
 * Minimal test-only DOM fixture for the real shared header renderer.
 * It does not pull in jsdom, a browser dependency or any third-party package.
 */
import {mountHeader} from '../../public/ui/header.mjs';

class TestElement{
 constructor(tag){
  this.tag=tag;this.children=[];this.dataset={};this.attributes=new Map();
  this.id='';this.className='';this.textContent='';this.href='';this.focused=false;
  this.extraClasses=new Set();this.handlers=new Map();this.parent=null;
  this.classList={
   add:(...names)=>names.forEach(name=>this.extraClasses.add(name)),
   contains:name=>this.className.split(/\s+/).includes(name)||this.extraClasses.has(name),
   toggle:(name,flag)=>{
    const on=flag===undefined?!this.extraClasses.has(name):Boolean(flag);
    if(on)this.extraClasses.add(name);else this.extraClasses.delete(name);
    return on;
   },
   remove:name=>this.extraClasses.delete(name)
  };
 }
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(key,value){this.attributes.set(key,String(value));}
 getAttribute(key){return this.attributes.get(key)??null;}
 addEventListener(type,fn){this.handlers.set(type,fn);}
 fire(type,event={}){this.handlers.get(type)?.({target:this,key:'',preventDefault(){},...event});}
 focus(){this.focused=true;}
 descendants(){return [this,...this.children.flatMap(node=>node.descendants?.()??[node])];}
 querySelector(selector){
  return this.descendants().slice(1).find(node=>{
   if(selector==='a')return node.tag==='a';
   if(selector.startsWith('#'))return node.id===selector.slice(1);
   if(selector.startsWith('.'))return node.classList?.contains(selector.slice(1));
   const attr=selector.match(/^\[data-hf-nav-key="([^"]+)"\]$/);
   return Boolean(attr&&node.dataset?.hfNavKey===attr[1]);
  })??null;
 }
 closest(selector){
  let node=this;
  while(node){if(selector==='a'&&node.tag==='a')return node;node=node.parent;}
  return null;
 }
}
export function renderHeaderFixture(page,locale='fr'){
 const header=new TestElement('header');
 const root={
  documentElement:{lang:locale,classList:{add(){}}},
  querySelector:selector=>selector==='[data-hf-header]'?header:null,
  createElement:tag=>new TestElement(tag),
  createTextNode:text=>new TestElement('#text')
 };
 mountHeader(page,locale,root);
 return {
  header,root,all:()=>header.descendants(),
  id:value=>header.descendants().find(node=>node.id===value),
  link:key=>header.descendants().find(node=>node.dataset?.hfNavKey===key),
  menu:()=>header.descendants().find(node=>node.id==='hf-header-menu')
 };
}
