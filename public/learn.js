// HUMAN FIRST LEARN. Intentionally no analytics, AI, timers, scores or third-party requests.
import {initialLanguage,syncLanguage} from './language.mjs';
const $=id=>document.getElementById(id);
const text=(id,value)=>{const node=$(id);if(node)node.textContent=String(value??'');};
const show=(id,on)=>{$(id).hidden=!on;};
let locale=initialLanguage();
let state={stage:'idle'};let catalog=[];let filter='all';let busy=false;
const dateStore='hf-learn:dates:v1';
const dictionary={
 fr:{
  heroHeading:'Savoir, c’est aussi retrouver.',heroText:'Lire n’est qu’un début. Comprendre, essayer de se souvenir, appliquer à une situation nouvelle : voilà ce que nous te proposons d’explorer.',
  features:['Sans notes imposées','Sans score','À ton rythme'],listHeading:'Six petites leçons. Ton propre raisonnement.',listLead:'Commence par le sujet qui t’intéresse. Les prérequis sont des conseils, jamais des obstacles.',
  all:'Toutes les leçons',critical:'Esprit critique',data:'Données',learning:'Apprentissage',agency:'Autonomie',
  start:'Explorer la leçon',recommended:'Conseil : après',lessonLabel:'LEÇON',minutes:'min',tier:'Niveau',
  adult:'Je confirme avoir au moins 18 ans.',age:'Démonstration éducative, sans compte, destinée aux adultes. Aucun résultat d’étude scientifique n’est revendiqué.',
  reviewsHeading:'Mes restitutions choisies',reviewsIntro:'Si tu le souhaites, ton navigateur peut conserver une date de révision. Pas de notification, pas de suivi.',clear:'Effacer les dates enregistrées',nothing:'Aucune date de révision choisie.',due:'À partir du',ready:'Révision disponible',review:'Faire une restitution',
  needAdult:'Confirme d’abord que tu as 18 ans ou plus pour entrer dans la démonstration.',
  step:'ÉTAPE',of:'SUR',studyButton:'Fermer le cours, essayer de me souvenir ↗',recallCaption:'RESTITUTION SANS AIDE',recallLabel:'Ce dont je me souviens',recallGuide:'Sans rouvrir les explications, reformule les idées importantes. Tu peux aussi choisir de passer.',
  recallSubmit:'Comparer avec une explication ↗',skip:'Passer sans répondre',feedbackHeading:'Trois questions, sans note',feedbackCaption:'POUR MIEUX COMPRENDRE',ownRecall:'MA PREMIÈRE RESTITUTION',feedbackNext:'Appliquer à un autre problème ↗',
  applyGuide:'Voici une situation différente. Aucun indice ni explication ne sera affiché avant ta réponse ou ton choix de passer.',applyCaption:'UNE SITUATION NOUVELLE',applyLabel:'Ma réponse autonome',applySubmit:'Terminer et comparer ↗',applySkip:'Passer',
  closing:'Ce qui compte, c’est ce qui te reste.',closingLead:'Tu peux maintenant quitter cette page. Tu n’as pas à prouver ta progression.',myApply:'MA RÉPONSE AU PROBLÈME NOUVEAU',reference:'UNE APPROCHE POSSIBLE',paper:'À essayer loin de l’écran',
  offerHeading:'Revenir plus tard, seulement si tu le souhaites',offerText:'Programmer une restitution locale dans 2 jours ? Aucune notification ne sera envoyée.',optin:'J’accepte de mémoriser localement l’identifiant de la leçon et une date.',offerButton:'Programmer la révision',print:'Imprimer une fiche',finish:'Terminer et quitter ↗',
  noText:'Aucune réponse fournie.',lost:'Ton texte n’est plus disponible dans cet onglet.',write:'Écris quelques mots ou choisis Passer.',consent:'Coche d’abord ton accord facultatif.',scheduled:'Date enregistrée dans ce navigateur. Aucune notification ne sera envoyée.',cleared:'Les dates locales ont été effacées.',saveError:'Enregistrement local impossible. Vérifie les réglages de ton navigateur.',
  exit:'Quitter librement',asideTitle:'Comprendre. Pas collectionner des réponses.',asideText:'Tout le monde peut oublier, hésiter ou changer d’avis. Rien ici ne mesure ton intelligence ou ta valeur.',asideFooter:'Tu peux arrêter à tout moment. Les textes de tes réponses ne quittent pas cet onglet.',foot:'Penser d’abord. L’IA ensuite.',privacy:'18+ · Démonstration · Sans publicité, compte ou analytique',
  privacyText:'Ce texte reste dans cet onglet. Il n’est pas envoyé au serveur.',recallPrivate:'Ce texte reste dans cet onglet. Il n’est pas envoyé au serveur.',applyPrivate:'Aucun indice pendant cette étape. Aucune réponse envoyée au serveur.',error:'Une erreur est survenue. Réessaie.',loadError:'Impossible de charger les leçons.'
 },
 en:{
  heroHeading:'Learning also means remembering.',heroText:'Reading is a beginning. Understanding, retrieving ideas, and applying them to a new problem: that is what we invite you to explore.',features:['No mandatory notes','No scores','Your own pace'],
  listHeading:'Six short lessons. Your own reasoning.',listLead:'Start with a topic that interests you. Prerequisites are suggestions, never obstacles.',all:'All lessons',critical:'Critical thinking',data:'Data interpretation',learning:'Learning',agency:'Independent judgment',
  start:'Explore lesson',recommended:'Suggested after',lessonLabel:'LESSON',minutes:'min',tier:'Level',adult:'I confirm that I am at least 18 years old.',age:'Educational demo for adults without an account. No scientific effectiveness claim is made.',
  reviewsHeading:'My chosen recall activities',reviewsIntro:'If you choose, this browser can keep a review date. No notifications or monitoring.',clear:'Erase my local review dates',nothing:'No review dates selected.',due:'Available from',ready:'Review available',review:'Recall without notes',needAdult:'Confirm you are at least 18 before entering this demo.',
  step:'STEP',of:'OF',studyButton:'Close the lesson and try to remember ↗',recallCaption:'INDEPENDENT RECALL',recallLabel:'What I remember',recallGuide:'Without reopening the explanation, put the key ideas in your own words. You may also skip.',recallSubmit:'Compare with an explanation ↗',skip:'Skip without answering',feedbackHeading:'Three questions, no score',feedbackCaption:'UNDERSTAND MORE DEEPLY',ownRecall:'MY FIRST RECALL',feedbackNext:'Apply to a new problem ↗',
  applyGuide:'Here is a different situation. No clue or explanation appears before you answer or choose to skip.',applyCaption:'A NEW SITUATION',applyLabel:'My independent answer',applySubmit:'Finish and compare ↗',applySkip:'Skip',closing:'What matters is what you take away.',closingLead:'You can close this page now. You do not need to prove your progress.',myApply:'MY ANSWER TO THE NEW PROBLEM',reference:'ONE POSSIBLE APPROACH',paper:'Try this away from a screen',
  offerHeading:'Return later, but only if you wish',offerText:'Schedule optional recall in 2 days in this browser? No notifications will be sent.',optin:'I agree to store the lesson ID and a date locally.',offerButton:'Schedule review',print:'Print a study card',finish:'Finish and leave ↗',
  noText:'No answer provided.',lost:'Your text is no longer available in this tab.',write:'Write a few words or choose Skip.',consent:'Select your optional agreement first.',scheduled:'Date stored in this browser. No notification will be sent.',cleared:'Local review dates have been erased.',saveError:'Unable to store the date locally. Check your browser settings.',
  exit:'Leave freely',asideTitle:'Understand. Do not collect answers.',asideText:'Everyone can forget, hesitate or change their mind. Nothing here measures your intelligence or worth.',asideFooter:'You may stop at any moment. Your written responses stay in this tab.',foot:'Think first. AI second.',privacy:'18+ · Demo · No ads, accounts or analytics',
  privacyText:'This text stays in this tab. It is not sent to the server.',recallPrivate:'This text stays in this tab. It is not sent to the server.',applyPrivate:'No hints during this step. No written answer is sent to the server.',error:'An error occurred. Try again.',loadError:'Unable to load lessons.'
 }
};
const w=key=>dictionary[locale][key]||key;
function report(id,message=''){text(id,message);show(id,Boolean(message));}
async function api(path,payload){
 const opt=payload===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json','X-Think-First':'1'},body:JSON.stringify(payload)};
 const r=await fetch(path,{...opt,credentials:'same-origin',cache:'no-store'});
 let b;try{b=await r.json();}catch{throw Error(w('error'));}
 if(!r.ok)throw Error(b.error||w('error'));return b;
}
function draftKey(sessionId){return `hf-learn:tab:${sessionId}`;}
function draft(){try{return JSON.parse(sessionStorage.getItem(draftKey(state.sessionId))||'{}');}catch{return {};}}
function remember(field,value){if(!state.sessionId)return;const x=draft();x[field]=value;try{sessionStorage.setItem(draftKey(state.sessionId),JSON.stringify(x));}catch{}}
function forget(){if(!state.sessionId)return;try{sessionStorage.removeItem(draftKey(state.sessionId));}catch{}}
function dates(){
 try{const raw=JSON.parse(localStorage.getItem(dateStore)||'{}');if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
  return Object.fromEntries(Object.entries(raw).filter(([id,v])=>catalog.some(x=>x.id===id)&&v&&Number.isFinite(v.due)&&v.due>0&&v.due<Date.now()+365*86400000));
 }catch{return {};}
}
function saveDates(value){try{localStorage.setItem(dateStore,JSON.stringify(value));return true;}catch{return false;}}
function schedule(){
 if(!$('review-optin').checked){report('offer-status',w('consent'));return;}
 const data=dates();data[state.id]={due:Date.now()+2*86400000,lang:locale};
 report('offer-status',saveDates(data)?w('scheduled'):w('saveError'));
}
function localeCopy(){
 document.documentElement.lang=locale;
 syncLanguage(locale);
 $('lesson-filters').setAttribute('aria-label',locale==='en'?'Filter lessons':'Filtrer les leçons');
 document.querySelector('.site-header nav').setAttribute('aria-label',locale==='en'?'HUMAN FIRST spaces':'Espaces HUMAN FIRST');
 $('nav-decide').href='/decide?lang='+locale;
 $('nav-journey').href='/journey?lang='+locale;
 $('nav-journey').textContent=locale==='en'?'JOURNEY':'PARCOURS';
 const langButton=$('switch-lang');langButton.textContent=locale==='fr'?'EN':'FR';langButton.setAttribute('aria-label',locale==='fr'?'Switch to English':'Passer en français');
 const replace={
 'hero-text':w('heroText'),'list-lead':w('listLead'),'adult-text':w('adult'),'age-description':w('age'),
 'reviews-title':w('reviewsHeading'),'reviews-intro':w('reviewsIntro'),'erase-reviews':w('clear'),
 'exit-text':w('exit'),'study-next':w('studyButton'),'recall-guide':w('recallGuide'),'recall-caption':w('recallCaption'),
 'recall-label':w('recallLabel'),'privacy-reminder':w('privacyText'),'recall-submit':w('recallSubmit'),'recall-skip':w('skip'),
 'own-recall-caption':w('ownRecall'),'feedback-caption':w('feedbackCaption'),'rubric-title':w('feedbackHeading'),'feedback-next':w('feedbackNext'),
 'apply-guide':w('applyGuide'),'apply-caption':w('applyCaption'),'apply-label':w('applyLabel'),'apply-private':w('applyPrivate'),
 'apply-submit':w('applySubmit'),'apply-skip':w('applySkip'),'closing-heading':w('closing'),'closing-lead':w('closingLead'),
 'my-application-label':w('myApply'),'reference-caption':w('reference'),'paper-caption':w('paper'),
 'offer-title':w('offerHeading'),'offer-text':w('offerText'),'review-optin-label':w('optin'),
 'offer-button':w('offerButton'),'print-button':w('print'),'finish-exit':w('finish'),
 'aside-text':w('asideText'),'aside-footer':w('asideFooter'),'foot-tagline':w('foot'),'foot-privacy':w('privacy')
 };
 for(const [id,v] of Object.entries(replace))text(id,v);
 const hero=$('hero-heading'),section=$('list-heading');
 const emph=(node,start,highlight)=>{const italic=document.createElement('em');italic.textContent=highlight;node.replaceChildren(document.createTextNode(start),italic);};
 if(locale==='fr'){
  emph(hero,'Savoir, c’est aussi ','retrouver.');
  emph(section,'Six petites leçons. Ton propre ','raisonnement.');
 }else{
  emph(hero,'Learning also means ','remembering.');
  emph(section,'Six short lessons. Your own ','reasoning.');
 }
 text('aside-title',w('asideTitle'));
 const feature=$('hero-features')?.querySelectorAll('span');feature?.forEach((e,i)=>e.textContent=w('features')[i]);
}
function filters(){const target=$('lesson-filters');target.replaceChildren();const selections=['all','critical','data','learning','agency'];
 for(const key of selections){const btn=document.createElement('button');btn.type='button';btn.className='filter-btn';btn.textContent=w(key);btn.setAttribute('aria-pressed',String(filter===key));btn.addEventListener('click',()=>{filter=key;filters();cards();});target.append(btn);}
}
function el(tag,cls,content){const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;}
function cards(){const grid=$('lesson-grid');grid.replaceChildren();const subset=catalog.filter(x=>filter==='all'||x.domain===filter);
 for(const lesson of subset){const card=el('article','lesson-card');const header=el('div','card-header');header.append(el('span','card-index',`${w('lessonLabel')} · ${lesson.id.toUpperCase()}`),el('span','card-badge',`${w('tier')} ${lesson.tier}/3`));
 const middle=el('div','card-main');middle.append(el('h3',null,lesson.title),el('p',null,lesson.summary));
 const footer=el('div','card-footer');footer.append(el('span',null,`${lesson.duration} ${w('minutes')}`));const btn=el('button','card-button',`${w('start')} ↗`);btn.type='button';btn.addEventListener('click',()=>run(()=>startLesson(lesson.id,'study'),'catalog-error'));footer.append(btn);
 card.append(header,middle,footer);grid.append(card);
 }
}
function reviewCards(){const target=$('review-list');target.replaceChildren();const items=Object.entries(dates()).sort((a,b)=>a[1].due-b[1].due);
 if(!items.length){target.append(el('p','review-empty',w('nothing')));return;}
 for(const [id,item] of items){const lesson=catalog.find(x=>x.id===id);const card=el('div','review-row');card.append(el('strong',null,lesson.title));
  const isDue=item.due<=Date.now();const date=new Date(item.due).toLocaleDateString(locale==='en'?'en-GB':'fr-FR');card.append(el('span','review-date',isDue?w('ready'):`${w('due')} ${date}`));
  const btn=el('button','outline-btn',w('review'));btn.disabled=!isDue;btn.addEventListener('click',()=>run(()=>startLesson(id,'review'),'catalog-error'));card.append(btn);target.append(card);
 }
}
async function startLesson(id,mode){
 if(!$('adult-check').checked){report('catalog-error',w('needAdult'));$('adult-check').focus();return;}
 forget();const response=await api('/api/learn/start',{lessonId:id,adult:true,locale,mode});state=response;
 $('recall-answer').value='';$('apply-answer').value='';$('review-optin').checked=false;report('offer-status','');render(true);
}
function render(focus=false){
 const active=state.stage&&state.stage!=='idle';show('catalog-screen',!active);show('lesson-screen',active);$('switch-lang').disabled=active;
 if(!active){cards();reviewCards();return;}
 const steps={'learn-study':1,'learn-recall':2,'learn-feedback':3,'learn-apply':4,'learn-finished':5};
 const step=steps[state.stage]||1;const stage=state.stage;
 text('lesson-progress-label',`${w('step')} ${step} ${w('of')} 5`);text('lesson-domain',w(state.domain));
 text('lesson-title',state.title);text('lesson-objective',state.objective);$('progress-track').style.width=`${step*20}%`;
 document.querySelector('.progress-bar').setAttribute('aria-valuenow',String(step));
 for(const s of ['study','recall','feedback','apply','finished'])show('stage-'+s,stage==='learn-'+s);
 report('lesson-error','');
 if(stage==='learn-study'){
  const target=$('study-sections');target.replaceChildren();for(let i=0;i<state.sections.length;i++){
   const section=el('article','study-block');section.append(el('span','overline',`0${i+1} / 03`),el('h2',null,state.sections[i].heading),el('p',null,state.sections[i].text));target.append(section);
  }
 }
 if(stage==='learn-recall'){text('recall-question',state.recall);$('recall-answer').value=draft().recall||'';}
 if(stage==='learn-feedback'){
  text('own-recall',draft().recall|| (state.recalled?w('lost'):w('noText')));text('feedback-explanation',state.feedback);
  const list=$('rubric-list');list.replaceChildren();for(const point of state.rubric)list.append(el('li',null,point));
 }
 if(stage==='learn-apply'){text('apply-question',state.transfer);$('apply-answer').value=draft().apply||'';}
 if(stage==='learn-finished'){
  text('own-application',draft().apply||(state.completed?w('lost'):w('noText')));
  text('reference-text',state.transferReference);text('paper-task',state.offline);
 }
 if(focus){window.scrollTo({top:0,behavior:'auto'});$('lesson-title').setAttribute('tabindex','-1');$('lesson-title').focus({preventScroll:true});}
}
async function run(fn,errorId='lesson-error'){
 if(busy)return;busy=true;report(errorId,'');
 try{await fn();}catch(e){report(errorId,e.message||w('error'));}finally{busy=false;}
}
async function postStage(endpoint,payload){state=await api(endpoint,payload);render(true);}
function proceed(field,endpoint,skip=false){return run(async()=>{
 const value=$(field).value.trim();if(!skip&&!value){report('lesson-error',w('write'));return;}
 if(value&&!skip)remember(field==='recall-answer'?'recall':'apply',value);
 await postStage(endpoint,skip?{skip:true}:{hasAnswer:true});
});}
async function exitLesson(){await api('/api/learn/reset',{});forget();state={stage:'idle'};render(true);window.scrollTo({top:0,behavior:'auto'});}
function bind(){
 $('exit-lesson').addEventListener('click',()=>run(exitLesson));$('finish-exit').addEventListener('click',()=>run(exitLesson));
 $('study-next').addEventListener('click',()=>run(()=>postStage('/api/learn/study-done',{})));
 $('recall-submit').addEventListener('click',()=>proceed('recall-answer','/api/learn/recall-done'));
 $('recall-skip').addEventListener('click',()=>proceed('recall-answer','/api/learn/recall-done',true));
 $('feedback-next').addEventListener('click',()=>run(()=>postStage('/api/learn/apply',{})));
 $('apply-submit').addEventListener('click',()=>proceed('apply-answer','/api/learn/finish'));
 $('apply-skip').addEventListener('click',()=>proceed('apply-answer','/api/learn/finish',true));
 $('offer-button').addEventListener('click',schedule);
 $('print-button').addEventListener('click',()=>window.print());
 $('erase-reviews').addEventListener('click',()=>{try{localStorage.removeItem(dateStore);}catch{}reviewCards();report('catalog-error',w('cleared'));});
 $('switch-lang').addEventListener('click',()=>run(async()=>{
  if(state.stage!=='idle')return;locale=locale==='fr'?'en':'fr';catalog=(await api(`/api/learn/catalog?lang=${locale}`)).lessons;
  localeCopy();filter='all';filters();cards();reviewCards();history.replaceState(null,'',`${location.pathname}?lang=${locale}`);
 },'catalog-error'));
}
async function bootstrap(){bind();localeCopy();try{
 const [loaded,session]=await Promise.all([api(`/api/learn/catalog?lang=${locale}`),api('/api/learn/session')]);
 if(session.stage!=='idle'&&session.locale!==locale){locale=session.locale;localeCopy();loaded.lessons=(await api(`/api/learn/catalog?lang=${locale}`)).lessons;}
 catalog=loaded.lessons;state=session;filters();render();
 }catch(e){report('catalog-error',`${w('loadError')} ${e.message}`);}}
bootstrap();