// Interface sans librairie, télémétrie, trackers, IA externe ou stockage persistant.
const $ = id => document.getElementById(id);
const labels = {training:'1 SUR 4 · J’ESSAIE', explanation:'2 SUR 4 · JE COMPRENDS', transfer:'3 SUR 4 · JE VÉRIFIE', finished:'4 SUR 4 · JE TERMINE'};
let state = {stage:'idle'};
let catalog = [];
let locked = false;
let offlineHintCount = 0;

async function api(path, data) {
  const init = data === undefined ? {} : {method:'POST',headers:{'Content-Type':'application/json','X-Think-First':'1'},body:JSON.stringify(data)};
  const result = await fetch(path,{...init,credentials:'same-origin',cache:'no-store'});
  let body;
  try {body = await result.json();} catch {throw new Error('Réponse serveur indisponible.');}
  if (!result.ok) throw new Error(body.error || 'Une erreur est survenue.');
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
  catch(e){errorIn(errorId,e.message || 'Une erreur est survenue.');}
  finally{locked=false;}
}
function createCard(ex,index) {
  const btn=document.createElement('button');btn.type='button';btn.className='exercise-card';btn.setAttribute('aria-label',`Commencer ${ex.title}`);
  const top=document.createElement('div');top.className='card-top';
  const num=document.createElement('span');num.className='card-index';num.textContent=`DÉFI 0${index+1}`;
  const tag=document.createElement('span');tag.className='card-tag';tag.textContent=ex.category;
  top.append(num,tag);
  const mid=document.createElement('div');const h=document.createElement('h3');h.textContent=ex.title;
  const p=document.createElement('p');p.textContent=ex.introduction;mid.append(h,p);
  const bottom=document.createElement('div');bottom.className='card-bottom';
  const duration=document.createElement('span');duration.textContent=`⏱ ${ex.duration} min · ${ex.level}`;
  const arrow=document.createElement('span');arrow.className='card-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');bottom.append(duration,arrow);
  btn.append(top,mid,bottom);
  btn.addEventListener('click',()=>guarded(async()=>{
    if(!$('adult-check').checked) {errorIn('home-error','Confirme d’abord que tu as 18 ans ou plus pour accéder à la démonstration.');$('adult-check').focus();return;}
    state=await api('/api/session/start',{exerciseId:ex.id,adult:true});
    offlineHintCount=0;render();scrollTop();
  },'home-error'));
  return btn;
}
async function bootstrap() {
  try {
    const [loaded, resumed]=await Promise.all([api('/api/catalog'),api('/api/session')]);
    catalog=loaded.exercises;
    const grid=$('exercise-grid');grid.replaceChildren();
    catalog.forEach((ex,i)=>grid.append(createCard(ex,i)));
    state=resumed;
    render();
  } catch(e){errorIn('home-error',`Impossible de charger la démonstration : ${e.message}`);}
}
function updatePhase() {
  setText('phase-label',labels[state.stage]||'');
  const phase={training:1,explanation:2,transfer:3,finished:4}[state.stage]||0;
  $('progress-fill').style.width=`${phase*25}%`;
  document.querySelector('.workspace-progress').setAttribute('aria-valuenow',String(phase));
}
function showHints() {
  const list=$('hint-list');list.replaceChildren();
  const t=state.training;
  if(!t)return;
  const hints=[t.guide,...t.hints];
  const count=Math.max(Number(state.hintsUsed||0),offlineHintCount);
  for(let i=0;i<count&&i<hints.length;i++){
    const item=document.createElement('div');item.className='hint-item';
    const label=document.createElement('strong');label.textContent=i===0?'QUESTION DE GUIDAGE':`INDICE ${i}`;
    const text=document.createElement('span');text.textContent=hints[i];item.append(label,text);list.append(item);
  }
  $('hint-button').disabled=count>=hints.length;
  $('hint-button').textContent=count>=hints.length?'Tous les indices ont été révélés':'Recevoir un indice ↗';
}
function render() {
  errorIn('workspace-error');errorIn('home-error');
  const working=state.stage&&state.stage!=='idle';
  show('home',!working);show('workspace',working);
  if(!working)return;
  updatePhase();
  const mode=state.stage;
  setText('topic',state.exercise?.category?.toUpperCase()||'RAISONNEMENT');
  const headings={training:'À toi de réfléchir.',explanation:'Comprendre, pas mémoriser.',transfer:'À toi, sans assistance.',finished:'Ce que tu emportes.'};
  const leads={training:'Observe, questionne et formule une première idée. Il n’y a aucune pression à réussir.',explanation:'Voici une explication rédigée à l’avance. Prends le temps d’en comprendre les raisons.',transfer:'Un problème différent pour vérifier ce que tu as compris. Aucune piste ni aide ne sera affichée.',finished:'L’important est ce que tu retiens, pas le temps que tu as passé ici.'};
  setText('workspace-title',headings[mode]);setText('workspace-lead',leads[mode]);
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
    setText('attempt-recap',state.attempted?`Ta première idée : ${state.attempt}`:'Tu as choisi de passer. Tu peux découvrir des indices à ton rythme.');
    if(state.attempted||state.skipped) showHints();
  }
  if(mode==='finished') {
    const container=$('review-items');container.replaceChildren();
    for(const point of state.reflection.review) {const item=document.createElement('li');item.textContent=point;container.append(item);}
    setText('sample-answer',state.reflection.example);
    setText('session-summary',`${state.transferAnswer?'Ta réponse a été enregistrée uniquement pour cette session éphémère.':'Tu as choisi de passer le transfert.'} Aucune note automatique n’est calculée. ${state.summary.hintsUsed} indice(s) consulté(s).`);
  }
}
async function sync(){state=await api('/api/session');render();}
function on(id,event,handler){$(id).addEventListener(event,handler);}
on('brand-link','click',e=>{if(state.stage!=='idle'){e.preventDefault();guarded(async()=>{await api('/api/session/reset',{});state={stage:'idle'};render();scrollTop();});}});
on('quit-button','click',()=>guarded(async()=>{await api('/api/session/reset',{});state={stage:'idle'};render();scrollTop();}));
on('attempt-button','click',()=>guarded(async()=>{state=await api('/api/session/attempt',{answer:$('attempt').value});render();}));
on('skip-button','click',()=>guarded(async()=>{state=await api('/api/session/attempt',{skip:true});render();}));
on('hint-button','click',()=>guarded(async()=>{
  const allHints=[state.training.guide,...state.training.hints];
  if((state.hintsUsed||0)+offlineHintCount>=allHints.length)return;
  try {await api('/api/session/hint',{});await sync();}
  catch(e){
    // Les indices sont déjà chargés. On maintient leur disponibilité en cas de panne réseau.
    if(e instanceof TypeError){offlineHintCount+=1;showHints();errorIn('workspace-error','Connexion interrompue : les indices déjà chargés restent disponibles. Pour passer à l’étape suivante, reconnecte-toi.');}
    else throw e;
  }
}));
on('explanation-button','click',()=>guarded(async()=>{state=await api('/api/session/explanation',{});render();scrollTop();}));
on('direct-button','click',()=>guarded(async()=>{state=await api('/api/session/explanation',{});render();scrollTop();}));
on('transfer-button','click',()=>guarded(async()=>{state=await api('/api/session/transfer',{});render();scrollTop();}));
on('submit-transfer','click',()=>guarded(async()=>{state=await api('/api/session/answer',{answer:$('transfer-answer').value});render();scrollTop();}));
on('skip-transfer','click',()=>guarded(async()=>{state=await api('/api/session/answer',{skip:true});render();scrollTop();}));
on('done-button','click',()=>guarded(async()=>{await api('/api/session/reset',{});state={stage:'idle'};$('attempt').value='';$('transfer-answer').value='';offlineHintCount=0;render();scrollTop();}));
bootstrap();
