import {applyLocale,word} from './i18n.js';
// Interface sans librairie, télémétrie, trackers, IA externe ou stockage persistant.
const $ = id => document.getElementById(id);
let locale = (new URLSearchParams(location.search).get('lang') || navigator.language.slice(0,2)) === 'en' ? 'en' : 'fr';
const w = (key) => word(locale,key);
let state = {stage:'idle'};
let catalog = [];
let locked = false;
let currentDomain = 'all';
let currentDifficulty = 'all';
let maskedPrompt = false;
const domains = ['all','logic','critical','problem','learn'];
const domainText = {
  fr: {
    all:['Tous les domaines','Choisis un domaine ou explore librement les 20 défis. Aucun parcours obligatoire.'],
    logic:['Logique','Examiner les déductions, les quantificateurs et les contre-exemples.'],
    critical:['Esprit critique','Interroger les preuves, les causes et les représentations des données.'],
    problem:['Résolution de problèmes','Comparer, planifier et tester des stratégies selon les contraintes.'],
    learn:['Comprendre et retenir','Reformuler, rappeler, transférer et vérifier ce que l’on comprend.']
  },
  en: {
    all:['All areas','Choose a topic or explore all 20 challenges at your own pace. There is no required learning path.'],
    logic:['Logic','Examine implications, quantifiers and counterexamples.'],
    critical:['Critical thinking','Question evidence, causal claims and the way data is presented.'],
    problem:['Problem solving','Compare, plan and test strategies within constraints.'],
    learn:['Understand and remember','Paraphrase, recall, transfer and check your understanding.']
  }
};
const levels = {
  fr: [['all','Tous les niveaux'],['1','Découverte'],['2','Exploration'],['3','Approfondissement']],
  en: [['all','All levels'],['1','Introduction'],['2','Exploration'],['3','Advanced']]
};
function renderFilters() {
  const parent=$('domain-filters');parent.replaceChildren();
  for(const domain of domains){
    const b=document.createElement('button'); b.type='button';b.className='filter-pill';
    b.textContent=domainText[locale][domain][0];b.dataset.domain=domain;
    b.setAttribute('aria-pressed',String(currentDomain===domain));
    b.addEventListener('click',()=>{currentDomain=domain;renderFilters();renderCards();
      $('domain-filters').querySelector(`[data-domain="${domain}"]`)?.focus();});
    parent.append(b);
  }
  const select=$('level-filter');select.replaceChildren();
  for(const [value,label] of levels[locale]){
    const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);
  }
  select.value=currentDifficulty;
  $('domain-description').textContent=domainText[locale][currentDomain][1];
  setText('level-filter-label',locale==='en'?'Difficulty':'Niveau');
  select.setAttribute('aria-label',locale==='en'?'Filter by difficulty':'Filtrer par niveau');
  $('domain-filters').setAttribute('aria-label',locale==='en'?'Select an area':'Choisir un domaine');
  document.querySelector('.curriculum-controls').setAttribute('aria-label',locale==='en'?'Filter exercises':'Filtrer les exercices');
  setText('no-results',locale==='en'?'No challenges match these filters.':'Aucun défi ne correspond à ces filtres.');
}
function renderCards(){
  const matches=catalog.filter(ex=>(currentDomain==='all'||ex.domain===currentDomain)&&(currentDifficulty==='all'||String(ex.difficulty)===currentDifficulty));
  const grid=$('exercise-grid');grid.replaceChildren();
  matches.forEach((ex,i)=>grid.append(createCard(ex,i)));
  setText('exercise-count', locale==='en'?`${matches.length} of ${catalog.length} challenges`:`${matches.length} défi(s) sur ${catalog.length}`);
  show('no-results',matches.length===0);
}

// Text is only retained in the browser tab for a reload, never in the server cookie.
const draftKey='human-first:think-first:draft-v1';
function loadDraft() {
  try {return JSON.parse(sessionStorage.getItem(draftKey)||'{}');} catch {return {};}
}
function keepDraft(field,value) {
  try {const draft=loadDraft();draft[field]=value;sessionStorage.setItem(draftKey,JSON.stringify(draft));}catch{}
}
function clearDraft() {try{sessionStorage.removeItem(draftKey);}catch{}}
function hydrateSession(session) {
  if(session?.stage==='idle'){clearDraft();return session;}
  const draft=loadDraft();
  if(session.attempted&&!session.attempt)session.attempt=draft.attempt||'';
  if(session.transferAnswered&&!session.transferAnswer)session.transferAnswer=draft.transferAnswer||'';
  return session;
}
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
  const num=document.createElement('span');num.className='card-index';num.textContent=`${w('challenge')} ${String(index+1).padStart(2,'0')}`;
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
    clearDraft();maskedPrompt=false;
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
    renderFilters();renderCards();
    state=hydrateSession(resumed);
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
  if(mode!=='training')maskedPrompt=false;
  show('mask-prompt-button',mode==='training');
  show('prompt-text',!(mode==='training' && maskedPrompt));
  $('mask-prompt-button').setAttribute('aria-pressed',String(maskedPrompt));
  setText('mask-prompt-button',locale==='en'?(maskedPrompt?'Show challenge again':'Hide challenge and try recalling it'):(maskedPrompt?'Réafficher l’énoncé':'Masquer l’énoncé pour essayer de le retrouver de mémoire'));
  if(mode==='training'||mode==='explanation') setText('prompt-text',state.training?.prompt);
  if(mode==='transfer') setText('prompt-text',state.transfer);
  if(mode==='explanation')setText('explanation-text',state.explanation);
  if(mode==='training') {
    setText('attempt-recap',state.attempted?`${w('attemptPrefix')}${state.attempt || (locale==='en'?'Reflection submitted; text not saved in this tab.':'Réflexion soumise ; texte indisponible dans cet onglet.')}`:w('skippedIntro'));
    if(state.attempted||state.skipped) showHints();
  }
  if(mode==='finished') {
    setText('finished-question',state.transfer);
    setText('finished-own-answer',state.transferAnswer || (state.transferAnswered?(locale==='en'?'Answer submitted; text not saved in this tab.':'Réponse soumise ; texte indisponible dans cet onglet.'):(locale==='en'?'No answer provided.':'Pas de réponse saisie.')));
    const container=$('review-items');container.replaceChildren();
    for(const point of state.reflection.review) {const item=document.createElement('li');item.textContent=point;container.append(item);}
    setText('sample-answer',state.reflection.example);
    setText('offline-challenge',state.reflection.offlineChallenge || (locale==='en'?'Explain the idea away from your screen.':'Explique cette idée loin de ton écran.'));
    setText('session-summary',`${state.transferAnswered?w('summaryDone'):w('summarySkip')} ${w('noGrade')} ${state.summary.hintsUsed} ${w('hintCount')}`);
  }
}
async function sync(){state=hydrateSession(await api('/api/session'));render();}
function on(id,event,handler){$(id).addEventListener(event,handler);}
on('brand-link','click',e=>{if(state.stage!=='idle'){e.preventDefault();guarded(async()=>{await api('/api/session/reset',{});clearDraft();state={stage:'idle'};render();scrollTop();});}});
on('quit-button','click',()=>guarded(async()=>{await api('/api/session/reset',{});clearDraft();state={stage:'idle'};render();scrollTop();}));
on('attempt-button','click',()=>guarded(async()=>{state=await api('/api/session/attempt',{answer:$('attempt').value});keepDraft('attempt',state.attempt);render();}));
on('skip-button','click',()=>guarded(async()=>{state=await api('/api/session/attempt',{skip:true});render();}));
on('hint-button','click',()=>guarded(async()=>{state=await api('/api/session/hint',{});render();}));
on('explanation-button','click',()=>guarded(async()=>{state=await api('/api/session/explanation',{});render();scrollTop();}));
on('direct-button','click',()=>guarded(async()=>{state=await api('/api/session/explanation',{});render();scrollTop();}));
on('transfer-button','click',()=>guarded(async()=>{state=await api('/api/session/transfer',{});render();scrollTop();}));
on('submit-transfer','click',()=>guarded(async()=>{state=await api('/api/session/answer',{answer:$('transfer-answer').value});keepDraft('transferAnswer',state.transferAnswer);render();scrollTop();}));
on('skip-transfer','click',()=>guarded(async()=>{state=await api('/api/session/answer',{skip:true});render();scrollTop();}));
on('print-button','click',()=>window.print());
on('done-button','click',()=>guarded(async()=>{await api('/api/session/reset',{});clearDraft();state={stage:'idle'};$('attempt').value='';$('transfer-answer').value='';render();scrollTop();}));
function updateLanguageSwitch() {
  const btn=$('language-switch');btn.textContent=locale==='fr'?'EN':'FR';
  btn.setAttribute('aria-label',locale==='fr'?'Switch to English':'Passer en français');
}
on('language-switch','click',()=>guarded(async()=>{
  if(state.stage!=='idle')return;
  const next=locale==='fr'?'en':'fr';
  const data=await api(`/api/catalog?lang=${next}`);
  locale=next;applyLocale(locale);updateLanguageSwitch();
  catalog=data.exercises;renderFilters();renderCards();
  history.replaceState(null,'',`${location.pathname}?lang=${locale}${location.hash}`);
},'home-error'));
on('mask-prompt-button','click',()=>{if(state.stage==='training'){maskedPrompt=!maskedPrompt;render();}});
on('level-filter','change',()=>{currentDifficulty=$('level-filter').value;renderCards();});
bootstrap();