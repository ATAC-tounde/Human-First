import {applyLocale,word} from './i18n.js';
// Interface sans librairie, télémétrie, trackers, IA externe ou stockage persistant.
const $ = id => document.getElementById(id);
let locale = (new URLSearchParams(location.search).get('lang') || navigator.language.slice(0,2)) === 'en' ? 'en' : 'fr';
const w = (key) => word(locale,key);
let state = {stage:'idle'};
let catalog = [];
let locked = false;
// Hints are revealed by the server only when requested; never preload unpublished hints.

async function api(path, data) {
  const init = data === undefined ? {} : {method:'POST',headers:{'Content-Type':'application/json','X-Think-First':'1'},body:JSON.stringify(data)};
  const result = await fetch(path,{...init,credentials:'same-origin',cache:'no-store'});
  let body;
  try {body = await result.json();} catch {throw new Error(w('invalidResponse'));}
  if (!result.ok) throw new Error(body.error || w('generalError'));
  return body;
}
function show(id, visible=true) {$(id).hidden=!visible;}
function setText(id, value) {$(id).textContent = value || '';}
function errorIn(id, message='') {setText(id,message);show(id,Boolean(message));}
function scrollTop() {window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
async function guarded(action, errorId='workspace-error') {
  if(locked)return;
  locked=true;
  errorIn(errorId);
  try {await action();}
  catch(e){errorIn(errorId,e.message || w('generalError'));}
  finally{locked=false;}
}
function createCard(ex,index) {
  const btn=document.createElement('button');btn.type='button';btn.className='exercise-card';btn.setAttribute('aria-label',`${w('start')} ${ex.title}`);
  const top=document.createElement('div');top.className='card-top';
  const num=document.createElement('span');num.className='card-index';num.textContent=`${w('challenge')} 0${index+1}`;
  const tag=document.createElement('span');tag.className='card-tag';tag.textContent=ex.category;
  top.append(num,tag);
  const mid=document.createElement('div');const h=document.createElement('h3');h.textContent=ex.title;
  const p=document.createElement('p');p.textContent=ex.introduction;mid.append(h,p);
  const bottom=document.createElement('div');bottom.className='card-bottom';
  const duration=document.createElement('span');duration.textContent=`⏱ ${ex.duration} ${w('minutes')} · ${ex.level}`;
  const arrow=document.createElement('span');arrow.className='card-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');bottom.append(duration,arrow);
  btn.append(top,mid,bottom);
  btn.addEventListener('click',()=>guarded(async()=>{
    if(!$('adult-check').checked) {errorIn('home-error',w('adult'));$('adult-check').focus();return;}
    state=await api('/api/session/start',{exerciseId:ex.id,adult:true,locale});
    render();scrollTop();
  },'home-error'));
  return btn;
}
async function bootstrap() {
  try {
    const [loaded, resumed]=await Promise.all([api(`/api/catalog?lang=${locale}`),api('/api/session')]);
    if(resumed.stage!=='idle' && locale !== (resumed.locale || 'fr')) {
      locale=resumed.locale || 'fr';
      const localized=await api(`/api/catalog?lang=${locale}`);
      loaded.exercises=localized.exercises;
    }
    applyLocale(locale);updateLanguageSwitch();
    catalog=loaded.exercises;
    const grid=$('exercise-grid');grid.replaceChildren();
    catalog.forEach((ex,i)=>grid.append(createCard(ex,i)));
    state=resumed;
    render();
  } catch(e){errorIn('home-error',`${w('loadError')} : ${e.message}`);}
}
function updatePhase() {
  setText('phase-label',w('phases')[state.stage]||'');
  const phase={training:1,explanation:2,transfer:3,finished:4}[state.stage]||0;
  $('progress-fill').style.width=`${phase*25}%`;
  document.querySelector('.workspace-progress').setAttribute('aria-valuenow',String(phase));
}
function showHints() {
  const list=$('hint-list');list.replaceChildren();
  const t=state.training;
  if(!t)return;
  const hints=state.revealedHints || [];
  const count=hints.length;
  for(let i=0;i<count&&i<hints.length;i++){
    const item=document.createElement('div');item.className='hint-item';
    const label=document.createElement('strong');label.textContent=i===0?w('guidance'):`${w('hint')} ${i}`;
    const text=document.createElement('span');text.textContent=hints[i];item.append(label,text);list.append(item);
  }
  $('hint-button').disabled=count>=3;
  $('hint-button').textContent=count>=3?w('allHints'):w('receiveHint');
}
function render() {
  errorIn('workspace-error');errorIn('home-error');
  const working=state.stage&&state.stage!=='idle';
  show('home',!working);show('workspace',working);
  $('language-switch').disabled=working;
  $('language-switch').setAttribute('aria-disabled',String(working));
  if(!working)return;
  updatePhase();
  const mode=state.stage;
  setText('topic',state.exercise?.category?.toUpperCase()||w('reasoning'));
  setText('workspace-title',w('headings')[mode]);setText('workspace-lead',w('leads')[mode]);
  show('training-view',mode==='training'&&!state.attempted&&!state.skipped);
  show('coaching-view',mode==='training'&&(state.attempted||state.skipped));
  show('direct-access',mode==='training'&&!state.attempted&&!state.skipped);
  show('explanation-view',mode==='explanation');
  show('transfer-view',mode==='transfer');
  show('finished-view',mode==='finished');
  show('prompt-card',mode!=='finished');
  if(mode==='training'||mode==='explanation') setText('prompt-text',state.training?.prompt);
  if(mode==='transfer') setText('prompt-text',state.transfer);
  if(mode==='explanation')setText('explanation-text',state.explanation);
  if(mode==='training') {
    setText('attempt-recap',state.attempted?`${w('attemptPrefix')}${state.attempt}`:w('skippedIntro'));
    if(state.attempted||state.skipped) showHints();
  }
  if(mode==='finished') {
    setText('finished-question',state.transfer);
    setText('finished-own-answer',state.transferAnswer || (locale==='en'?'No answer provided.':'Pas de réponse saisie.'));
    const container=$('review-items');container.replaceChildren();
    for(const point of state.reflection.review) {const item=document.createElement('li');item.textContent=point;container.append(item);}
    setText('sample-answer',state.reflection.example);
    setText('session-summary',`${state.transferAnswer?w('summaryDone'):w('summarySkip')} ${w('noGrade')} ${state.summary.hintsUsed} ${w('hintCount')}`);
  }
}
async function sync(){state=await api('/api/session');render();}
function on(id,event,handler){$(id).addEventListener(event,handler);}
on('brand-link','click',e=>{if(state.stage!=='idle'){e.preventDefault();guarded(async()=>{await api('/api/session/reset',{});state={stage:'idle'};render();scrollTop();});}});
on('quit-button','click',()=>guarded(async()=>{await api('/api/session/reset',{});state={stage:'idle'};render();scrollTop();}));
on('attempt-button','click',()=>guarded(async()=>{state=await api('/api/session/attempt',{answer:$('attempt').value});render();}));
on('skip-button','click',()=>guarded(async()=>{state=await api('/api/session/attempt',{skip:true});render();}));
on('hint-button','click',()=>guarded(async()=>{state=await api('/api/session/hint',{});render();}));
on('explanation-button','click',()=>guarded(async()=>{state=await api('/api/session/explanation',{});render();scrollTop();}));
on('direct-button','click',()=>guarded(async()=>{state=await api('/api/session/explanation',{});render();scrollTop();}));
on('transfer-button','click',()=>guarded(async()=>{state=await api('/api/session/transfer',{});render();scrollTop();}));
on('submit-transfer','click',()=>guarded(async()=>{state=await api('/api/session/answer',{answer:$('transfer-answer').value});render();scrollTop();}));
on('skip-transfer','click',()=>guarded(async()=>{state=await api('/api/session/answer',{skip:true});render();scrollTop();}));
on('print-button','click',()=>window.print());
on('done-button','click',()=>guarded(async()=>{await api('/api/session/reset',{});state={stage:'idle'};$('attempt').value='';$('transfer-answer').value='';render();scrollTop();}));
function updateLanguageSwitch() {
  const btn=$('language-switch');btn.textContent=locale==='fr'?'EN':'FR';
  btn.setAttribute('aria-label',locale==='fr'?'Switch to English':'Passer en français');
}
on('language-switch','click',()=>guarded(async()=>{
  if(state.stage!=='idle')return;
  const next=locale==='fr'?'en':'fr';
  const data=await api(`/api/catalog?lang=${next}`);
  locale=next;applyLocale(locale);updateLanguageSwitch();
  const grid=$('exercise-grid');grid.replaceChildren();
  catalog=data.exercises;catalog.forEach((ex,i)=>grid.append(createCard(ex,i)));
  history.replaceState(null,'',`${location.pathname}?lang=${locale}${location.hash}`);
},'home-error'));
bootstrap();
