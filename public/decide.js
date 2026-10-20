import {decisionStages,decideScenarios,decideScenario,reflectionPrompts} from './decide-data.mjs';

// Purely client-side: no fetch, analytics, timer, account, WebSocket, localStorage or sessionStorage.
// User notes live only in DOM inputs. No auto-ranking, automated decision or external AI.
const $ = id => document.getElementById(id);
let locale = new URLSearchParams(location.search).get('lang')==='en'?'en':'fr';
let activeId = null;
let step = 0;
const dict = {
  fr: {
    'hero-eyebrow':'PILIER 04 · DECIDE · DÉMONSTRATION', 'hero-title':'Une décision ', 'hero-tail':'à la fois.',
    'hero-description':'Définis tes critères, examine les alternatives et vérifie les recommandations avant de choisir. Aucun score, aucun choix imposé.',
    principles:'✓ Sans compte   ✓ Sans IA active   ✓ Sans suivi',
    'adult-label':'Je confirme avoir 18 ans ou plus.',
    'adult-detail':'Démonstration pédagogique. Évite les informations sensibles et les décisions à forts enjeux.',
    'scenario-eyebrow':'UN DILEMME À EXAMINER', 'scenario-title':'Sept situations pour s’entraîner.',
    'scenario-subtitle':'Les situations sont fictives. Tu peux créer la tienne et quitter à tout moment.',
    'exit-work':'← Quitter et effacer mes notes',
    'situation-label':'La situation',
    'frame-title':'Formuler mon objectif', 'goal-label':'Quel résultat souhaites-tu obtenir ?',
    'criterion-one-label':'Critère important n° 1', 'criterion-two-label':'Critère important n° 2',
    'criterion-three-label':'Critère important n° 3 (facultatif)',
    'compare-title':'Comparer sans couronner de gagnant',
    'compare-help':'Deux options de départ sont proposées, mais tu peux les modifier.',
    'option-one-label':'Option A','option-two-label':'Option B',
    'option-one-tradeoff-label':'Son avantage et son compromis','option-two-tradeoff-label':'Son avantage et son compromis',
    'third-option-label':'Une troisième possibilité ? (facultatif)',
    'verify-title':'Distinguer faits et incertitudes', 'evidence-label':'Quel fait pourrais-tu vérifier ?',
    'uncertainty-label':'Qu’est-ce qui reste une hypothèse ?', 'others-label':'Qui pourrait être affecté ou oublié ?',
    'challenge-title':'Examiner un conseil d’IA',
    'challenge-intro':'Le texte ci-dessous est un exemple fictif, rédigé à l’avance. Aucune IA n’est appelée.',
    'challenge-response-label':'Quelles hypothèses ou preuves manquerait-il ?',
    'counterargument-label':'Quel argument opposé mériterait d’être entendu ?',
    'conclude-title':'Décider... ou différer volontairement',
    'choice-label':'Ton choix provisoire (tu peux aussi différer)',
    'revision-trigger-label':'Qu’est-ce qui te ferait reconsidérer ce choix ?',
    'paper-title':'À faire loin de l’écran', 'reflection-title':'Quelques questions pour toi',
    'last-note':'Tu n’as pas à justifier tes choix à cette application. Rien n’est enregistré.',
    'print-worksheet':'Imprimer une fiche vierge, sans mes notes',
    'previous-step':'← Étape précédente','next-step':'Continuer sans obligation de répondre →',
    'finish-work':'Terminer et effacer toutes mes notes ↗',
    'aside-label':'LE CHOIX T’APPARTIENT', 'aside-title':'Un conseil peut informer. Il ne décide pas.',
    'aside-text':'Aucune option ne reçoit de note ou de classement automatique. Tu peux revoir tes critères ou quitter à tout moment.',
    'privacy-note':'Tes notes restent dans cette page ouverte. Elles ne sont pas envoyées au serveur ni conservées dans un stockage navigateur. Fermer ou recharger efface les champs.',
    'print-disclaimer':'Fiche vierge : aucun texte saisi n’est imprimé automatiquement.',
    'print-goal':'1. Mon objectif et mes critères','print-options':'2. Mes options et leurs compromis',
    'print-proof':'3. Mes preuves et incertitudes','print-review':'4. Comment remettre en question un conseil ?',
    'print-choice':'5. Ma décision provisoire et sa révision',
    'footer-note':'Think first. AI second. · 18+ · Prototype pédagogique, pas un outil de conseil professionnel.',
    choose:'Examiner cette situation', ageError:'Confirme d’abord que tu as 18 ans ou plus.',
    stageNames:['Poser le problème','Comparer les options','Vérifier les informations','Questionner un conseil','Rester maître du choix'],
    stageLeads:[
      'Avant d’écouter un avis extérieur, explicite ce qui compte pour toi.',
      'Deux possibilités peuvent avoir des avantages et des coûts différents.',
      'Distingue les faits vérifiés, les hypothèses et les points de vue absents.',
      'Un conseil convaincant mérite des questions, même lorsqu’il vient d’une IA.',
      'Ton choix peut être provisoire. Différer reste possible.'
    ], step:'ÉTAPE', of:'SUR', defaultGoal:'Quelle décision aimerais-tu examiner ?'
  },
  en: {
    'hero-eyebrow':'PILLAR 04 · DECIDE · DEMONSTRATION', 'hero-title':'One decision ', 'hero-tail':'at a time.',
    'hero-description':'Define your criteria, examine alternatives, and question recommendations before choosing. No scores, no prescribed answer.',
    principles:'✓ No account   ✓ No active AI   ✓ No tracking',
    'adult-label':'I confirm that I am 18 or older.',
    'adult-detail':'Educational demonstration. Avoid sensitive details and high-stakes decisions.',
    'scenario-eyebrow':'A DILEMMA TO EXAMINE', 'scenario-title':'Seven situations to explore.',
    'scenario-subtitle':'The scenarios are fictional. You can make one your own and leave at any time.',
    'exit-work':'← Leave and erase my notes',
    'situation-label':'The situation',
    'frame-title':'Define my aim', 'goal-label':'What would you like to achieve?',
    'criterion-one-label':'Important criterion #1', 'criterion-two-label':'Important criterion #2',
    'criterion-three-label':'Important criterion #3 (optional)',
    'compare-title':'Compare without crowning a winner',
    'compare-help':'Two starting options are suggested. You can edit them.',
    'option-one-label':'Option A','option-two-label':'Option B',
    'option-one-tradeoff-label':'Its benefit and its trade-off','option-two-tradeoff-label':'Its benefit and its trade-off',
    'third-option-label':'A third possibility? (optional)',
    'verify-title':'Separate evidence from uncertainty', 'evidence-label':'What fact could you verify?',
    'uncertainty-label':'What remains an assumption?', 'others-label':'Who could be affected or overlooked?',
    'challenge-title':'Examine an AI-style recommendation',
    'challenge-intro':'The statement below is a fictional, prewritten example. No AI is called.',
    'challenge-response-label':'Which assumptions or evidence are missing?',
    'counterargument-label':'Which opposing argument deserves attention?',
    'conclude-title':'Decide... or deliberately wait',
    'choice-label':'Your provisional choice (you may defer)',
    'revision-trigger-label':'What would make you reconsider your choice?',
    'paper-title':'Try this away from the screen', 'reflection-title':'Questions to consider',
    'last-note':'You do not have to justify your choices to this app. Nothing is recorded.',
    'print-worksheet':'Print a blank worksheet, without my notes',
    'previous-step':'← Previous step','next-step':'Continue without having to answer →',
    'finish-work':'Finish and erase all my notes ↗',
    'aside-label':'THE CHOICE IS YOURS', 'aside-title':'Advice can inform. It does not decide.',
    'aside-text':'No option is automatically scored or ranked. You can revisit your criteria or leave at any time.',
    'privacy-note':'Your notes stay in this open page. They are not sent to a server or saved in browser storage. Closing or reloading clears the fields.',
    'print-disclaimer':'Blank worksheet: no text you enter is printed automatically.',
    'print-goal':'1. My aim and criteria','print-options':'2. Options and trade-offs',
    'print-proof':'3. Evidence and uncertainties','print-review':'4. How to question a recommendation',
    'print-choice':'5. My provisional decision and review',
    'footer-note':'Think first. AI second. · 18+ · Educational prototype, not professional advice.',
    choose:'Explore this situation', ageError:'First confirm that you are 18 or older.',
    stageNames:['Frame the problem','Compare alternatives','Verify information','Question a recommendation','Keep ownership of the choice'],
    stageLeads:[
      'Before taking outside advice, make your own priorities explicit.',
      'Each alternative may bring benefits and trade-offs.',
      'Separate checked facts, assumptions and missing perspectives.',
      'A convincing recommendation still deserves scrutiny, including from AI.',
      'Your choice can be provisional. Waiting is an option.'
    ], step:'STEP', of:'OF', defaultGoal:'Which decision would you like to examine?'
  }
};
const copy=()=>dict[locale];
function set(id,value){const node=$(id);if(node)node.textContent=value;}
function focusHeading(id){const node=$(id);node.focus();}
function updateLinks(){
  for(const id of ['nav-think','nav-focus','nav-learn','nav-journey']){
    const base={"nav-think":"/","nav-focus":"/focus","nav-learn":"/learn","nav-journey":"/journey"}[id];
    $(id).href=base+'?lang='+locale;
    if(id==='nav-journey')$(id).textContent=locale==='en'?'JOURNEY':'PARCOURS';
  }
}
function applyCopy(){
  document.documentElement.lang=locale;
  updateLinks();
  const c=copy();
  for(const [id,value] of Object.entries(c)){
    if(value instanceof Array || ['choose','ageError','step','of','defaultGoal','hero-title','hero-tail'].includes(id))continue;
    if($(id))set(id,value);
  }
  set('hero-title',c['hero-title']);
  const emph=document.createElement('em');emph.textContent=c['hero-tail'];$('hero-title').append(emph);
  $('switch-lang').textContent=locale==='en'?'FR':'EN';
  $('switch-lang').setAttribute('aria-label',locale==='en'?'Passer en français':'Switch to English');
  $('option-one').placeholder=locale==='en'?'Option A':'Option A';
  $('option-two').placeholder=locale==='en'?'Option B':'Option B';
  renderCards();
  if(activeId)renderStage();
}
function renderCards(){
  const root=$('scenarios');root.replaceChildren();
  decideScenarios(locale).forEach((scenario,index)=>{
    const button=document.createElement('button');button.type='button';button.className='card';
    const n=document.createElement('span');n.className='card-index';n.textContent='DECIDE '+String(index+1).padStart(2,'0');
    const heading=document.createElement('strong');heading.textContent=scenario.title;
    const description=document.createElement('span');description.textContent=scenario.short;
    const action=document.createElement('span');action.className='card-action';action.textContent=copy().choose+' ↗';
    button.append(n,heading,description,action);
    button.setAttribute('aria-label',`${copy().choose}: ${scenario.title}`);
    button.addEventListener('click',()=>start(scenario.id));root.append(button);
  });
}
function wipeFields(){
  $('work-view').querySelectorAll('textarea,input').forEach(field=>{field.value='';});
}
function start(id){
  if(!$('adult-check').checked){set('age-error',copy().ageError);$('age-error').hidden=false;$('adult-check').focus();return;}
  const scenario=decideScenario(id,locale);if(!scenario)return;
  $('age-error').hidden=true;
  wipeFields();activeId=id;step=0;
  $('option-one').value=scenario.options[0];$('option-two').value=scenario.options[1];
  $('choose-view').hidden=true;$('work-view').hidden=false;
  renderStage();focusHeading('work-title');
}
function renderStage(){
  const scenario=decideScenario(activeId,locale);if(!scenario)return;
  const c=copy();
  set('step-marker',`${c.step} ${step+1} ${c.of} ${decisionStages.length}`);
  set('work-title',c.stageNames[step]);set('work-intro',c.stageLeads[step]);
  set('situation-text',scenario.situation);
  set('verify-prompt',scenario.question);
  set('ai-claim',scenario.claim);set('ai-question',scenario.challenge);
  set('paper-text',scenario.transfer);
  const reflections=$('reflection-prompts');reflections.replaceChildren();
  for(const prompt of reflectionPrompts(locale)){const li=document.createElement('li');li.textContent=prompt;reflections.append(li);}
  for(const stage of decisionStages) $('stage-'+stage).hidden=decisionStages[step]!==stage;
  $('previous-step').hidden=step===0;
  $('next-step').hidden=step===decisionStages.length-1;
  $('finish-work').hidden=step!==decisionStages.length-1;
  $('progress-fill').style.width=String((step+1)*100/decisionStages.length)+'%';
  $('work-view').querySelector('[role="progressbar"]').setAttribute('aria-valuenow',String(step+1));
}
function navigate(delta){
  step=Math.max(0,Math.min(decisionStages.length-1,step+delta));
  renderStage();focusHeading('work-title');
}
function exit(){
  wipeFields();activeId=null;step=0;
  $('work-view').hidden=true;$('choose-view').hidden=false;
  focusHeading('scenario-title');
}
$('switch-lang').addEventListener('click',()=>{
  const previous=locale;locale=locale==='fr'?'en':'fr';
  if(activeId){
    const old=decideScenario(activeId,previous),next=decideScenario(activeId,locale);
    for(const [field,index] of [['option-one',0],['option-two',1]]){
      if($(field).value===old.options[index])$(field).value=next.options[index];
    }
  }
  const url=new URL(location.href);url.searchParams.set('lang',locale);history.replaceState(null,'',url);
  applyCopy();
});
$('adult-check').addEventListener('change',()=>{$('age-error').hidden=true;});
$('exit-work').addEventListener('click',exit);
$('previous-step').addEventListener('click',()=>navigate(-1));
$('next-step').addEventListener('click',()=>navigate(1));
$('finish-work').addEventListener('click',exit);
$('print-worksheet').addEventListener('click',()=>window.print());
applyCopy();