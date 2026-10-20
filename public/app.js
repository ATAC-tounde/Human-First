import {applyLocale,word} from './i18n.js';
import {initialLanguage,syncLanguage} from './language.mjs';
// Interface sans télémétrie ni traceur ; seules les dates de révision opt-in sont persistées localement.
const $ = id => document.getElementById(id);
let locale=initialLanguage();
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

// Text is only retained in the browser tab for a reload, never in the server cookie.
const draftKey='human-first:think-first:draft-v1';
const scheduleKey='human-first:think-first:review-dates-v1';
let paths=[],activePath='all',aiConfig={enabled:false};
function loadDraft(session=state) {
  if(!session?.sessionId)return {};
  try{
    const item=JSON.parse(sessionStorage.getItem(draftKey)||'{}');
    return item?.sessionId===session.sessionId?item:{};
  }catch{return {};}
}
function keepDraft(field,value) {
  if(!state.sessionId)return;
  try{
    const item=loadDraft();item.sessionId=state.sessionId;item[field]=value;
    sessionStorage.setItem(draftKey,JSON.stringify(item));
  }catch{}
}
function clearDraft() {try{sessionStorage.removeItem(draftKey);}catch{}}
function hydrateSession(session) {
  if(session?.stage==='idle'){clearDraft();return session;}
  const draft=loadDraft(session);
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
    clearDraft();maskedPrompt=false;$('ai-consent').checked=false;setText('ai-result','');
    state=await api('/api/session/start',{exerciseId:ex.id,adult:true,locale});
    render();scrollTop();
  },'home-error'));
  return btn;
}

const learningLabels={
 fr:{all:'Tous les défis',tier:'Niveau',noneDue:'Aucune révision programmée dans ce navigateur.',ready:'Disponible pour révision',due:'À partir du',startReview:'Réviser',cleared:'Toutes les dates locales ont été supprimées.',needConsent:'Coche d’abord ton accord pour enregistrer la date localement.',scheduled:'Révision enregistrée localement. Aucune notification ne sera envoyée.',aiConsent:'Confirme ton accord avant tout envoi de texte à Groq.',aiNoText:'Le texte initial n’est plus disponible dans cet onglet. Commence un nouvel exercice si besoin.',aiQuestion:'Question à explorer',aiFallback:'Le fournisseur est indisponible : voici une question préparée automatiquement. Elle ne remplace pas les indices rédigés.',limit:'Nombre maximal de questions atteint pour cette séance.',recallHead:'Rappelle-toi sans aide.',recallLead:'Ni indice ni correction pour cette tentative. Ton texte reste dans cet onglet.',recallFinished:'Compare ton raisonnement.',recallFinishedLead:'Cherche les idées retrouvées sans aide. Aucun score.',recallProgress:'RAPPEL AUTONOME',nextDue:'Un nouveau rappel local est proposé dans 7 jours.',needAdult:'La démonstration reste réservée aux adultes de 18 ans et plus.'},
 en:{all:'All challenges',tier:'Level',noneDue:'No reviews scheduled in this browser.',ready:'Available to review',due:'Available from',startReview:'Review',cleared:'All local review dates have been erased.',needConsent:'Please agree before storing the date in this browser.',scheduled:'Review date stored locally. No notification will be sent.',aiConsent:'Please agree before sending any text to Groq.',aiNoText:'Your first answer is no longer available in this tab. Start another exercise if needed.',aiQuestion:'A question to explore',aiFallback:'The provider is unavailable: this is a template-based question, not a substitute for curated clues.',limit:'Maximum AI questions reached for this session.',recallHead:'Recall without help.',recallLead:'No clues or correction during this task. Your text stays in your browser tab.',recallFinished:'Compare your reasoning.',recallFinishedLead:'Notice what you remembered independently. No score.',recallProgress:'INDEPENDENT RECALL',nextDue:'Another optional local review is planned in 7 days.',needAdult:'This demo is for adults aged 18 and over.'}
};
const l=key=>learningLabels[locale][key];
function renderOfflineCard(card, target) {
  const mapping=target==='recall'
    ? {root:'recall-offscreen-card',title:'recall-offscreen-title',info:'recall-offscreen-info',steps:'recall-offscreen-steps',check:'recall-offscreen-check'}
    : {root:'offscreen-card',title:'offscreen-card-title',info:'offscreen-card-info',steps:'offscreen-card-steps',check:'offscreen-card-check'};
  show(mapping.root, Boolean(card));
  if(!card)return;
  setText(mapping.title,card.title);
  const prefix=locale==='en'?'On paper':'Sur papier';
  setText(mapping.info,`${prefix} · ${card.minutes} min · ${card.materials}`);
  const list=$(mapping.steps);list.replaceChildren();
  for(const step of card.steps){const item=document.createElement('li');item.textContent=step;list.append(item);}
  setText(mapping.check,(locale==='en'?'Reflect: ':'À vérifier : ')+card.check);
}

function readSchedule(){try{const x=JSON.parse(localStorage.getItem(scheduleKey)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}catch{return {};}}
function writeSchedule(data){try{localStorage.setItem(scheduleKey,JSON.stringify(data));return true;}catch{return false;}}
function planReview(exerciseId,days){
 if(!catalog.some(x=>x.id===exerciseId))return false;
 const data=readSchedule();data[exerciseId]={due:Date.now()+days*86400000,steps:days===1?1:2};
 return writeSchedule(data);
}
function refreshLearningCopy(){
 const en=locale==='en';
 const values=en?{
  'paths-title':'Choose a learning path, not a score','paths-lead':'Suggested paths and approximate difficulty. All exercises remain freely accessible.',
  'review-panel-title':'My independent reviews','review-panel-description':'No answers are stored. Only dates you explicitly choose may be kept in this browser.',
  'clear-schedule':'Erase local review dates','schedule-title':'Come back once, no obligation',
  'schedule-description':'Optionally plan a recall task in one day in this browser. No personal identifier or answer is stored.',
  'schedule-consent-label':'I agree to store the exercise ID and review date locally in this browser.',
  'schedule-button':'Plan a review','recall-label':'What I remember, without help','recall-hint':'Your text stays in this tab. The server only receives whether you answered.',
  'recall-submit':'See a reference answer','recall-skip':'Skip','recall-yours-label':'My recall','recall-reference-label':'A POSSIBLE EXPLANATION',
  'recall-note':'Compare without scoring yourself: what could you recall unaided?','recall-plan-next':'Plan another review (7 days)',
  'recall-end':'Finish','ai-title':'Question my reasoning with optional AI',
  'ai-warning':'Your draft is sent to Groq only with explicit consent. Do not include private data. Generated questions may be mistaken.',
  'ai-consent-label':'I agree to send my draft to Groq once.','ai-button':'Ask a Socratic question'
 }:{
  'paths-title':'Choisir un parcours, pas un score','paths-lead':'Parcours suggérés et niveaux indicatifs. Tous les exercices restent accessibles librement.',
  'review-panel-title':'Mes révisions sans aide','review-panel-description':'Aucune réponse enregistrée : seules les dates choisies volontairement peuvent rester dans ce navigateur.',
  'clear-schedule':'Effacer mes dates de révision','schedule-title':'Revenir une fois, sans obligation',
  'schedule-description':'Tu peux planifier une révision dans un jour dans ce navigateur. Aucune réponse ni identité n’est conservée.',
  'schedule-consent-label':'J’autorise le stockage local de l’exercice et de sa date de rappel.',
  'schedule-button':'Programmer une révision','recall-label':'Ce dont je me souviens, sans aide','recall-hint':'Ton texte reste dans cet onglet. Le serveur ne reçoit que le fait que tu as répondu.',
  'recall-submit':'Voir une piste de référence','recall-skip':'Passer','recall-yours-label':'Ma restitution','recall-reference-label':'UNE EXPLICATION POSSIBLE',
  'recall-note':'Compare sans te noter : qu’as-tu retrouvé par toi-même ?','recall-plan-next':'Planifier une autre révision (7 jours)',
  'recall-end':'Terminer','ai-title':'Questionner mon raisonnement avec une IA facultative',
  'ai-warning':'Ton texte est envoyé à Groq uniquement avec ton accord. Ne transmets aucune donnée privée. L’IA peut se tromper.',
  'ai-consent-label':'J’accepte cet envoi ponctuel à Groq.','ai-button':'Poser une question socratique'
 };
 for(const [id,value] of Object.entries(values))setText(id,value);
 $('schedule-offer').hidden=true;
}
function rebuildPathFilters(){
 const target=$('path-filters');target.replaceChildren();
 for(const path of [{id:'all',name:l('all')},...paths]){
  const button=document.createElement('button');button.type='button';button.className='path-button';button.textContent=path.name;
  button.setAttribute('aria-pressed',String(activePath===path.id));
  button.addEventListener('click',()=>{activePath=path.id;rebuildPathFilters();renderCards();});target.append(button);
 }
}
function renderCards(){
  const allowed=paths.find(x=>x.id===activePath)?.exerciseIds||null;
  const filtered=catalog.filter(x=>
    (!allowed||allowed.includes(x.id)) &&
    (currentDomain==='all'||x.domain===currentDomain) &&
    (currentDifficulty==='all'||String(x.difficulty)===currentDifficulty));
  const grid=$('exercise-grid');grid.replaceChildren();
  filtered.forEach(ex=>{
    const btn=createCard(ex,catalog.indexOf(ex));
    const tier=document.createElement('span');tier.className='tier';
    tier.textContent=`${l('tier')} ${ex.tier||ex.difficulty||1} / 3`;
    btn.querySelector('.card-bottom')?.prepend(tier);grid.append(btn);
  });
  setText('exercise-count',locale==='en'?`${filtered.length} of ${catalog.length} challenges`:`${filtered.length} défi(s) sur ${catalog.length}`);
  show('no-results',filtered.length===0);
}
function refreshReviews(){
 const target=$('due-list');target.replaceChildren();const data=readSchedule();
 const entries=Object.entries(data).filter(([id,d])=>catalog.some(x=>x.id===id)&&Number.isFinite(d?.due)).sort((a,b)=>a[1].due-b[1].due);
 if(!entries.length){const p=document.createElement('p');p.textContent=l('noneDue');target.append(p);return;}
 for(const [id,value] of entries){const x=catalog.find(y=>y.id===id);const wrap=document.createElement('div');wrap.className='due-item';
  const title=document.createElement('strong');title.textContent=x.title;
  const date=document.createElement('small');const due=value.due<=Date.now();date.textContent=due?l('ready'):`${l('due')} ${new Date(value.due).toLocaleDateString(locale==='en'?'en-GB':'fr-FR')}`;
  const button=document.createElement('button');button.type='button';button.textContent=l('startReview');button.disabled=!due;
  button.addEventListener('click',()=>guarded(()=>startRecall(id),'home-error'));
  wrap.append(title,date,button);target.append(wrap);
 }
}
async function startRecall(id){
 if(!$('adult-check').checked){errorIn('home-error',l('needAdult'));$('adult-check').focus();return;}
 clearDraft();$('recall-answer').value='';
 state=await api('/api/session/recall/start',{exerciseId:id,adult:true,locale});render();scrollTop();
}

async function bootstrap() {
  try {
    const [loaded, resumed, pathData, coaching]=await Promise.all([api(`/api/catalog?lang=${locale}`),api('/api/session'),api(`/api/paths?lang=${locale}`),api('/api/coach/config')]);
    if(resumed.stage!=='idle' && locale !== (resumed.locale || 'fr')) {
      locale=resumed.locale || 'fr';
      const localized=await api(`/api/catalog?lang=${locale}`);
      loaded.exercises=localized.exercises;
    }
    applyLocale(locale);updateLanguageSwitch();refreshLearningCopy();
    catalog=loaded.exercises;paths=pathData.paths;aiConfig=coaching;
    if(resumed.stage!=='idle' && pathData.locale!==locale){paths=(await api(`/api/paths?lang=${locale}`)).paths;}
    renderFilters();rebuildPathFilters();renderCards();refreshReviews();
    state=hydrateSession(resumed);
    render();
  } catch(e){errorIn('home-error',`${w('loadError')} : ${e.message}`);}
}
function updatePhase() {
  setText('phase-label',w('phases')[state.stage]||l('recallProgress'));
  const phase={training:1,explanation:2,transfer:3,finished:4,recall:2,'recall-finished':4}[state.stage]||0;
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
  if(!working){refreshReviews();return;}
  updatePhase();
  const mode=state.stage;
  setText('topic',state.exercise?.category?.toUpperCase()||w('reasoning'));
  setText('workspace-title',mode==='recall'?l('recallHead'):mode==='recall-finished'?l('recallFinished'):w('headings')[mode]);
  setText('workspace-lead',mode==='recall'?l('recallLead'):mode==='recall-finished'?l('recallFinishedLead'):w('leads')[mode]);
  show('training-view',mode==='training'&&!state.attempted&&!state.skipped);
  show('coaching-view',mode==='training'&&(state.attempted||state.skipped));
  show('direct-access',mode==='training'&&!state.attempted&&!state.skipped);
  show('explanation-view',mode==='explanation');
  show('transfer-view',mode==='transfer');
  show('finished-view',mode==='finished');
  show('prompt-card',!['finished','recall-finished'].includes(mode));
  if(mode!=='training')maskedPrompt=false;
  show('mask-prompt-button',mode==='training');
  show('prompt-text',!(mode==='training'&&maskedPrompt));
  $('mask-prompt-button').setAttribute('aria-pressed',String(maskedPrompt));
  setText('mask-prompt-button',locale==='en'?(maskedPrompt?'Show challenge again':'Hide challenge and try recalling it'):(maskedPrompt?'Réafficher l’énoncé':'Masquer l’énoncé pour essayer de le retrouver de mémoire'));
  show('recall-view',mode==='recall');show('recall-finished-view',mode==='recall-finished');
  show('ai-panel',aiConfig.enabled&&mode==='training'&&state.attempted&&Boolean(state.attempt)&&state.coachTurns<2);
  show('schedule-offer',mode==='finished');
  const nextId=state.exercise?.progression?.next;const nextEx=catalog.find(x=>x.id===nextId);
  show('next-lesson',mode==='finished'&&Boolean(nextEx));
  if(mode==='finished'&&nextEx){setText('next-lesson-title',locale==='en'?'A next idea, whenever you like':'Un prolongement, quand tu veux');setText('next-lesson-text',nextEx.title);} 
  if(mode==='training'||mode==='explanation') setText('prompt-text',state.training?.prompt);
  if(mode==='transfer') setText('prompt-text',state.transfer);
  if(mode==='recall')setText('prompt-text',state.recall);
  if(mode==='recall-finished') {setText('recall-own-answer',loadDraft().recallAnswer||(state.recalled?(locale==='en'?'Text unavailable in this tab.':'Texte indisponible dans cet onglet.'):(locale==='en'?'Skipped.':'Passé.')));setText('recall-reference-text',state.reference);renderOfflineCard(state.offlineCard,'recall');}
  if(mode==='explanation')setText('explanation-text',state.explanation);
  if(mode==='training') {
    setText('attempt-recap',state.attempted?`${w('attemptPrefix')}${state.attempt || (locale==='en'?'Reflection submitted; text not saved in this tab.':'Réflexion soumise ; texte indisponible dans cet onglet.')}`:w('skippedIntro'));
    if(state.attempted||state.skipped) showHints();
    if(state.coachTurns>=2) setText('ai-result',l('limit'));
  }
  if(mode==='finished') {
    renderOfflineCard(state.offlineCard,'finished');
    setText('finished-question',state.transfer);
    setText('finished-own-answer',state.transferAnswer || (state.transferAnswered?(locale==='en'?'Answer submitted; text not saved in this tab.':'Réponse soumise ; texte indisponible dans cet onglet.'):(locale==='en'?'No answer provided.':'Pas de réponse saisie.')));
    const container=$('review-items');container.replaceChildren();
    for(const point of state.reflection.review) {const item=document.createElement('li');item.textContent=point;container.append(item);}
    setText('sample-answer',state.reflection.example);
    setText('offline-challenge',state.reflection.offlineChallenge || (locale==='en'?'Try this idea offline on paper.':'Essaie cette idée sur papier, hors écran.'));
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
  syncLanguage(locale);
  const btn=$('language-switch');btn.textContent=locale==='fr'?'EN':'FR';
  btn.setAttribute('aria-label',locale==='fr'?'Switch to English':'Passer en français');
  const url='/focus?lang='+locale;
  $('focus-nav-link').href=url;
  $('focus-hero-link').href=url;
  const learnUrl='/learn?lang='+locale;
  $('learn-nav-link').href=learnUrl;
  $('learn-hero-link').href=learnUrl;
  const decideUrl='/decide?lang='+locale;
  $('decide-nav-link').href=decideUrl;
  $('decide-hero-link').href=decideUrl;
  const journeyUrl='/journey?lang='+locale;
  $('journey-nav-link').href=journeyUrl;
  $('journey-hero-link').href=journeyUrl;
  $('journey-nav-link').textContent=locale==='en'?'MY PATHWAY':'MON PARCOURS';
  $('journey-link-label').textContent=locale==='en'?'LEARNING KERNEL · PERSONAL PATHWAYS':'LE NOYAU · PARCOURS PERSONNALISÉS';
  $('journey-link-heading').textContent=locale==='en'?'Learning at every stage of life.':'Apprendre à chaque étape de la vie.';
  $('journey-link-description').textContent=locale==='en'?'Choose a goal. Competencies and four pillars form a voluntary program without scores or automated profiling.':'Choisis un objectif. Les compétences et les quatre piliers s’organisent autour de toi, sans note ni profilage automatique.';
  $('journey-hero-link').textContent=locale==='en'?'Build my pathway ↗':'Construire mon parcours ↗';
  $('decide-link-label').textContent=locale==='en'?'PILLAR 04 · DECIDE':'PILIER 04 · DECIDE';
  $('decide-link-heading').textContent=locale==='en'?'Your judgment before any recommendation.':'Ton jugement avant toute recommandation.';
  $('decide-link-description').textContent=locale==='en'?'Seven situations to clarify criteria and examine AI rankings critically.':'Sept situations, tes critères, des alternatives et un regard critique sur les classements d’IA.';
  $('decide-hero-link').textContent=locale==='en'?'Explore DECIDE ↗':'Explorer DECIDE ↗';
  $('learn-link-label').textContent=locale==='en'?'PILLAR 03 · LEARN':'PILIER 03 · LEARN';
  $('learn-link-heading').textContent=locale==='en'?'Read, retrieve, explain and apply.':'Lire, retrouver, expliquer puis appliquer.';
  $('learn-link-description').textContent=locale==='en'?'Six bilingual lessons, unaided recall and optional reviews.':'Six leçons bilingues, des restitutions sans aide et des révisions volontaires.';
  $('learn-hero-link').textContent=locale==='en'?'Explore LEARN ↗':'Explorer LEARN ↗';
  $('focus-link-label').textContent=locale==='en'?'PILLAR 02 · FOCUS':'PILIER 02 · FOCUS';
  $('focus-link-heading').textContent=locale==='en'?'Make room for attention, away from the screen.':'Une pratique de l’attention, loin de l’écran.';
  $('focus-link-description').textContent=locale==='en'?'Six optional activities, with no timer or stored answers.':'Six activités libres, sans minuteur ni collecte des réponses.';
  $('focus-hero-link').textContent=locale==='en'?'Explore FOCUS ↗':'Explorer FOCUS ↗';
  syncLanguage(locale);
}
on('language-switch','click',()=>guarded(async()=>{
  if(state.stage!=='idle')return;
  const next=locale==='fr'?'en':'fr';
  const [data,newPaths]=await Promise.all([api(`/api/catalog?lang=${next}`),api(`/api/paths?lang=${next}`)]);
  locale=next;applyLocale(locale);updateLanguageSwitch();refreshLearningCopy();
  paths=newPaths.paths;catalog=data.exercises;activePath='all';renderFilters();rebuildPathFilters();renderCards();refreshReviews();
  history.replaceState(null,'',`${location.pathname}?lang=${locale}${location.hash}`);
},'home-error'));
on('next-lesson-button','click',()=>guarded(async()=>{const ex=catalog.find(x=>x.id===state.exercise?.progression?.next);if(!ex)return;clearDraft();state=await api('/api/session/start',{exerciseId:ex.id,adult:true,locale});render();scrollTop();}));
on('clear-schedule','click',()=>{try{localStorage.removeItem(scheduleKey);}catch{}refreshReviews();errorIn('home-error',l('cleared'));});
on('schedule-button','click',()=>{
  if(!$('schedule-consent').checked){setText('schedule-status',l('needConsent'));return;}
  setText('schedule-status',planReview(state.exercise.id,1)?l('scheduled'):w('generalError'));
});
on('recall-submit','click',()=>guarded(async()=>{
  const answer=$('recall-answer').value.trim();if(!answer){errorIn('workspace-error',locale==='en'?'Write a response or choose Skip.':'Rédige une réponse ou choisis Passer.');return;}
  keepDraft('recallAnswer',answer);state=await api('/api/session/recall/answer',{hasAnswer:true});render();scrollTop();
}));
on('recall-skip','click',()=>guarded(async()=>{state=await api('/api/session/recall/answer',{skip:true});render();scrollTop();}));
on('recall-plan-next','click',()=>{setText('recall-status',planReview(state.exercise.id,7)?l('nextDue'):w('generalError'));});
on('recall-end','click',()=>guarded(async()=>{await api('/api/session/reset',{});clearDraft();state={stage:'idle'};render();scrollTop();}));
on('ai-button','click',()=>guarded(async()=>{
  if(!$('ai-consent').checked){setText('ai-result',l('aiConsent'));return;}
  const answer=state.attempt||loadDraft().attempt||'';
  if(!answer){setText('ai-result',l('aiNoText'));return;}
  const reply=await api('/api/session/coach',{consent:true,answer});
  setText('ai-result',`${reply.generated?l('aiQuestion'):l('aiFallback')} : ${reply.question}`);
  const retained=reply.question;await sync();setText('ai-result',retained);
  $('ai-consent').checked=false;
}));
on('mask-prompt-button','click',()=>{if(state.stage==='training'){maskedPrompt=!maskedPrompt;render();}});
on('level-filter','change',()=>{currentDifficulty=$('level-filter').value;renderCards();});
bootstrap();