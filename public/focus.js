import {focusCards,getFocusCard} from './focus-library.mjs';
import {initialLanguage,syncLanguage} from './language.mjs';

// FOCUS is deliberately client-only: no fetch, cookies, localStorage or analytics.
const $ = id => document.getElementById(id);
let locale=initialLanguage();
let activeId=null;
let phase='choose';
const phrases={
 fr:{
  eyebrow:'PILIER 02 · FOCUS · DÉMONSTRATION ADULTE',title:'Retrouver de la place',titleSecond:'pour son attention.',lead:'Choisis une activité simple, puis quitte l’écran pour l’essayer dans ta vie réelle. Ni minuteur imposé, ni classement, ni injonction à rester ici.',
  principles:['✓ Sans compte','✓ Sans chronomètre','✓ Aucune réponse transmise'],choose:'CHOISIR LIBREMENT',heading:'Six expériences.',headingSecond:'À ton rythme.',
  pickerLead:'Aucune tâche n’est obligatoire. Ces propositions ne constituent pas une intervention thérapeutique et leur efficacité n’a pas été scientifiquement démontrée.',
  chooseCard:'Choisir cette activité',back:'← Retour aux activités',task:'ACTIVITÉ CHOISIE',material:'À préparer',intention:'Mon intention (facultative, reste dans cet onglet)',intentionExample:'Je veux essayer de...',
  leave:'Je quitte l’écran pour essayer ↗',skip:'Arrêter sans justification',away:'C’EST À TOI, HORS ÉCRAN',awayTitle:'L’application peut attendre.',
  awayLead:'Ferme cet onglet si tu le souhaites. Prends le temps qui te convient : nous ne mesurons pas ton attention.',awayNoTimer:'Aucune durée imposée. Aucune notification de retour.',comeBack:'Je suis revenu et souhaite réfléchir ↗',
  reflect:'UN BILAN, SANS SCORE',reflectTitle:'Qu’as-tu remarqué ?',reflectLead:'Une activité interrompue n’est pas un échec. Tu peux réfléchir sans rien écrire.',notes:'Mes observations (facultatives, non enregistrées)',noteExample:'J’ai remarqué que...',finish:'Terminer et effacer mes notes ↗',print:'Imprimer uniquement les consignes',
  privacy:'Confidentialité : les notes restent uniquement dans la mémoire de cet onglet. Elles ne sont ni transmises au serveur, ni stockées dans le navigateur. Quitter ou recharger cette page les efface.',footer:'FOCUS - activité pédagogique libre, non thérapeutique · 18+',home:'THINK FIRST',adult:'Je confirme avoir 18 ans ou plus.',adultError:'Cette démonstration est réservée aux personnes de 18 ans ou plus.'
 },
 en:{
  eyebrow:'PILLAR 02 · FOCUS · ADULT DEMO',title:'Make room for',titleSecond:'your attention.',lead:'Choose a small activity, then leave the screen to try it in real life. No enforced timer, no leaderboard, and no reason to keep you here.',
  principles:['✓ No account','✓ No timer','✓ No answers sent'],choose:'CHOOSE FREELY',heading:'Six experiences.',headingSecond:'At your own pace.',
  pickerLead:'No activity is mandatory. These activities are not therapy and their effectiveness has not been scientifically established.',
  chooseCard:'Choose this activity',back:'← Back to activities',task:'YOUR CHOSEN ACTIVITY',material:'What you need',intention:'My intention (optional, stays in this tab)',intentionExample:'I would like to try...',
  leave:'I am leaving the screen to try ↗',skip:'Stop without explanation',away:'YOUR TURN, AWAY FROM THE SCREEN',awayTitle:'The app can wait.',
  awayLead:'Feel free to close this tab. Take as much time as you want: we do not measure your attention.',awayNoTimer:'No fixed duration. No reminders to return.',comeBack:'I am back and would like to reflect ↗',
  reflect:'A REFLECTION, NOT A SCORE',reflectTitle:'What did you notice?',reflectLead:'Stopping early is not a failure. You may reflect without writing anything.',notes:'My observations (optional, not saved)',noteExample:'I noticed that...',finish:'Finish and erase my notes ↗',print:'Print the instructions only',
  privacy:'Privacy: notes stay only in the memory of this tab. They are neither sent to a server nor stored in the browser. Leaving or reloading the page erases them.',footer:'FOCUS - optional educational activity, not therapy · 18+',home:'THINK FIRST',adult:'I confirm that I am 18 or older.',adultError:'This demonstration is reserved for people aged 18 and over.'
 }
};
function txt(id,value){$(id).textContent=value;}
function changeLanguage(){
 locale=locale==='fr'?'en':'fr';
 const newUrl=new URL(location.href);
 newUrl.searchParams.set('lang',locale);
 history.replaceState(null,'',newUrl);
 render();
}
function wipe(){
 $('focus-intention').value='';
 $('focus-reflection').value='';
 activeId=null;phase='choose';
 render();
}
function move(next){
 phase=next;
 render();
 const region=phase==='activity'?'activity-title':phase==='away'?'away-title':phase==='reflect'?'reflect-title':'picker-title';
 $(region).setAttribute('tabindex','-1');
 $(region).focus();
}
function renderCards(){
 const grid=$('focus-cards');grid.replaceChildren();
 focusCards(locale).forEach((item,index)=>{
  const button=document.createElement('button');
  button.className='focus-card';button.type='button';
  button.setAttribute('aria-label',`${phrases[locale].chooseCard} : ${item.title}`);
  const top=document.createElement('span');top.className='number';top.textContent=`FOCUS 0${index+1}`;
  const content=document.createElement('div');
  const heading=document.createElement('h3');heading.textContent=item.title;
  const desc=document.createElement('p');desc.textContent=item.subtitle;
  content.append(heading,desc);
  const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
  button.append(top,content,arrow);
  button.addEventListener('click',()=>{
   if(!$('focus-adult-check').checked){
    txt('focus-age-error',phrases[locale].adultError);
    $('focus-age-error').hidden=false;
    $('focus-adult-check').focus();return;
   }
   $('focus-age-error').hidden=true;
   activeId=item.id;move('activity');
  });
  grid.append(button);
 });
}
function renderSteps(item){
 const target=$('focus-steps');target.replaceChildren();
 item.steps.forEach((step,index)=>{
  const wrap=document.createElement('div');wrap.className='focus-step';
  const number=document.createElement('span');number.textContent=`0${index+1}`;number.setAttribute('aria-hidden','true');
  const desc=document.createElement('p');desc.textContent=step;
  wrap.append(number,desc);target.append(wrap);
 });
 const reflection=$('focus-reflection-prompts');reflection.replaceChildren();
 item.reflect.forEach(question=>{const li=document.createElement('li');li.textContent=question;reflection.append(li);});
}
function render(){
 const p=phrases[locale];
 document.documentElement.lang=locale;
 syncLanguage(locale);
 document.title=locale==='en'?'FOCUS - HUMAN FIRST':'FOCUS - HUMAN FIRST';
 txt('focus-eyebrow',p.eyebrow);txt('focus-title',p.title);const second=document.createElement('em');second.textContent=p.titleSecond;$('focus-title').append(document.createElement('br'),second);
 txt('focus-lead',p.lead);txt('focus-principles','');p.principles.forEach(value=>{const el=document.createElement('span');el.textContent=value;$('focus-principles').append(el);});
 txt('picker-title',p.heading);const italic=document.createElement('em');italic.textContent=p.headingSecond;$('picker-title').append(document.createElement('br'),italic);
 txt('picker-lead',p.pickerLead);txt('focus-adult-label',p.adult);txt('focus-age-error',p.adultError);txt('focus-back',p.back);txt('activity-category',p.task);txt('focus-material-label',p.material);
 txt('focus-intention-label',p.intention);$('focus-intention').placeholder=p.intentionExample;
 txt('focus-leave',p.leave);txt('focus-skip',p.skip);txt('away-label',p.away);txt('away-title',p.awayTitle);
 txt('away-description',p.awayLead);txt('away-no-timer',p.awayNoTimer);txt('focus-return',p.comeBack);
 txt('reflect-label',p.reflect);txt('reflect-title',p.reflectTitle);txt('reflect-lead',p.reflectLead);
 txt('focus-reflection-label',p.notes);$('focus-reflection').placeholder=p.noteExample;txt('focus-end',p.finish);txt('focus-print',p.print);
 txt('focus-privacy',p.privacy);txt('focus-footer-text',p.footer);txt('nav-back-label',p.home);
 txt('focus-language-switch',locale==='fr'?'EN':'FR');$('focus-language-switch').setAttribute('aria-label',locale==='fr'?'Switch to English':'Passer en français');
 $('back-home').href=`/?lang=${locale}`;
 document.querySelector('.focus-learn-link').href=`/learn?lang=${locale}`;
 document.querySelector('.focus-decide-link').href=`/decide?lang=${locale}`;
 document.querySelector('.focus-journey-link').href=`/journey?lang=${locale}`;
 document.querySelector('.focus-journey-link').textContent=locale==='en'?'JOURNEY ↗':'PARCOURS ↗';
 $('focus-picker').hidden=phase!=='choose';
 $('focus-activity').hidden=phase!=='activity';
 $('focus-away').hidden=phase!=='away';
 $('focus-reflect').hidden=phase!=='reflect';
 renderCards();
 if(activeId){const item=getFocusCard(activeId,locale);if(item){
  txt('activity-title',item.title);txt('activity-subtitle',item.subtitle);
  txt('activity-material',item.material);txt('activity-duration',item.duration);
  renderSteps(item);
 }}
}
$('focus-language-switch').addEventListener('click',changeLanguage);
$('focus-adult-check').addEventListener('change',()=>{$('focus-age-error').hidden=true;});
$('focus-back').addEventListener('click',wipe);
$('focus-skip').addEventListener('click',wipe);
$('focus-leave').addEventListener('click',()=>move('away'));
$('focus-return').addEventListener('click',()=>move('reflect'));
$('focus-end').addEventListener('click',()=>{wipe();$('picker-title').focus();});
$('focus-print').addEventListener('click',()=>window.print());
render();