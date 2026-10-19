import {installedPacks} from './packs.mjs';
import {createRegistry,buildJourney,normalizeProfile,exportPortfolio,importPortfolio,registryPublicStats,PILLARS,PROGRESS_EVENTS} from './engine.mjs';

// Entire learner profile, self-report and progress remain in this document's memory.
// No fetch(), analytics, AI call, cookie, localStorage or sessionStorage for these fields.
const registry=createRegistry(installedPacks);
const $=id=>document.getElementById(id);
let locale=new URLSearchParams(location.search).get('lang')==='en'?'en':'fr';
let program=null;
let events=[];
let familiarity={};
const words={
fr:{
 skip:'Aller au contenu',journeyNav:'PARCOURS',eyebrow:'LE NOYAU PÉDAGOGIQUE · V0.8',heroOne:'Un parcours à ton image.',heroTwo:'Et toujours libre d’évoluer.',heroLead:'Tes objectifs changent avec les années. Nos compétences et les quatre piliers évoluent avec toi, sans réduire ton potentiel à un âge ou à un diplôme.',
 noScore:'✓ Sans notation automatisée',noAccount:'✓ Sans compte',portable:'✓ Exportable et modifiable',foundationTitle:'L’IDÉE CENTRALE',foundationHeading:'Des compétences, pas des cases.',foundationCopy:'Aucun métier, diplôme, pays ou domaine n’est intégré en dur au moteur. De nouveaux référentiels s’ajoutent comme modules de contenu versionnés, avec des prérequis explicites et des activités sur les quatre piliers.',
 builderEyebrow:'ATELIER DE PARCOURS',builderTitle:'Construire mon programme',adultTitle:'Accès au prototype',adultNotice:'Je confirme avoir 18 ans ou plus. Les parcours pour mineurs exigent des garanties complémentaires.',stageTitle:'Ma situation actuelle',stagePersonal:'Apprendre par intérêt personnel',stageSchool:'Reprise d’études à l’âge adulte',stageHigher:'Études supérieures',stageWork:'Vie professionnelle',stageTransition:'Reconversion / transition',stageTeaching:'Enseignement / formation',ageTitle:'Tranche d’âge (facultatif)',ageUnspecified:'Je préfère ne pas préciser',ageHelp:'Jamais utilisée pour déduire tes capacités.',qualificationTitle:'Études / diplôme (facultatif)',qualificationHelp:'Description libre, non utilisée comme classement.',occupationTitle:'Métier / domaine (facultatif)',occupationHelp:'Pour préciser ton contexte, sans limiter les choix.',paceTitle:'Temps souhaité par semaine',pace30:'30 minutes environ',pace60:'1 heure environ',pace120:'2 heures environ',pace180:'3 heures environ',paceHelp:'Simple repère facultatif, pas un chronomètre.',pathTitle:'Mon objectif d’apprentissage',familiarityTitle:'Ce que je connais déjà (facultatif)',familiarityHelp:'Une auto-description, jamais un diagnostic ni un certificat. Toutes les compétences restent accessibles.',create:'Créer mon parcours ↗',clear:'Effacer cette séance',privacyNotice:'Tes réponses restent uniquement dans cet onglet. Aucun profil n’est envoyé au serveur. Tu peux exporter volontairement un fichier JSON pour reprendre plus tard.',
 resultEyebrow:'PROGRAMME INDIVIDUEL · DÉMONSTRATION',export:'Exporter mon portfolio JSON',import:'Importer un portfolio JSON',resetProgress:'Effacer les étapes déclarées',exitTitle:'La suite t’appartient.',exitDescription:'Tu peux explorer ces compétences dans THINK, FOCUS, LEARN et DECIDE, arrêter sans justification, ou modifier ton programme à tout moment.',portabilityEyebrow:'TU RESTES PROPRIÉTAIRE DU PARCOURS',portabilityTitle:'Tu peux repartir avec tes données.',portabilityText:'Aucun compte n’est requis. Le portfolio exporté contient ton contexte déclaré, tes choix et les étapes auto-déclarées, jamais des réponses libres ou un classement d’aptitudes. Garde ce fichier privé.',importHome:'Reprendre un portfolio exporté',footer:'18+ · Prototype de démonstration · Pas de mesure de l’intelligence · Think first. AI second.',
 stats:(p,c,g)=>`${p} modules · ${c} compétences · ${g} parcours`,
 levels:['Je débute','J’explore','Je pratique','Je me sens à l’aise'],
 count:x=>`${x} compétences avec prérequis explicites`,estimate:(t,p)=>`Environ ${t} minutes d’activités indicatives · rythme choisi ${p} min/semaine`,
 reasonGoal:'Objectif choisi',reasonPrereq:'Fondation utile',focusTransfer:'Tester mon autonomie',focusDiscover:'Découvrir et essayer',focusPractice:'Pratiquer et transférer',
 activity:'Essayer dans',context:'Exemple adapté au contexte déclaré :',progress:'Étape déclarée',progressNames:['Exploré','Exercé','À revoir'],emptyProgress:'Aucune étape déclarée',
 noAge:'Confirme que tu as 18 ans ou plus pour construire ton parcours.',success:'Parcours construit. Tu peux le modifier ou l’exporter librement.',cleared:'Cette séance et ses étapes ont été effacées.',saved:'Portfolio téléchargé. Conserve-le dans un endroit privé.',imported:'Portfolio importé et programme reconstruit.',migrated:'Contenu actualisé depuis ton export. Vérifie les étapes proposées.',importError:'Import impossible : ',invalid:'Impossible de construire le parcours : ',noProfile:'Crée d’abord un parcours pour pouvoir l’exporter.',
 titles:{think:'THINK',focus:'FOCUS',learn:'LEARN',decide:'DECIDE'},
 suggestion:'Suggestion pédagogique : pas une obligation.',selfReport:'Auto-déclaration uniquement, aucune certification.'
},
en:{
 skip:'Skip to content',journeyNav:'JOURNEY',eyebrow:'THE LEARNING KERNEL · V0.8',heroOne:'A pathway shaped by you.',heroTwo:'Free to change as you grow.',heroLead:'Your goals change throughout life. Skills and four pillars can evolve with you, without reducing your potential to an age or a degree.',
 noScore:'✓ No automatic grading',noAccount:'✓ No account',portable:'✓ Portable and editable',foundationTitle:'THE CORE IDEA',foundationHeading:'Competencies, not labels.',foundationCopy:'No occupation, degree, country or field is hard-coded into the engine. New versioned content packs can add explicit prerequisites and activities across the four pillars.',
 builderEyebrow:'JOURNEY WORKSHOP',builderTitle:'Build my learning program',adultTitle:'Demo access',adultNotice:'I confirm that I am 18 or older. Learning paths for minors need additional safeguards.',stageTitle:'My current situation',stagePersonal:'Personal learning',stageSchool:'Returning to education as an adult',stageHigher:'Higher education',stageWork:'Professional life',stageTransition:'Career change / transition',stageTeaching:'Teaching / training',ageTitle:'Age band (optional)',ageUnspecified:'Prefer not to say',ageHelp:'Never used to infer your ability.',qualificationTitle:'Education / qualification (optional)',qualificationHelp:'Free description, not used as a ranking.',occupationTitle:'Occupation / field (optional)',occupationHelp:'Adds context without limiting your choices.',paceTitle:'Preferred time per week',pace30:'About 30 minutes',pace60:'About 1 hour',pace120:'About 2 hours',pace180:'About 3 hours',paceHelp:'Only a guide; never an enforced timer.',pathTitle:'My learning goal',familiarityTitle:'What I already know (optional)',familiarityHelp:'Self-description only, not a diagnostic or certificate. Every competency remains open.',create:'Create my pathway ↗',clear:'Erase this session',privacyNotice:'Your entries remain in this tab only. No profile is sent to a server. You can explicitly export a JSON file to return later.',
 resultEyebrow:'PERSONAL PROGRAM · DEMONSTRATION',export:'Export my JSON portfolio',import:'Import a JSON portfolio',resetProgress:'Erase self-reported steps',exitTitle:'The next step is yours.',exitDescription:'Explore the skills through THINK, FOCUS, LEARN and DECIDE. Stop whenever you want or change your pathway freely.',portabilityEyebrow:'YOU CONTROL YOUR PATHWAY',portabilityTitle:'Your data can travel with you.',portabilityText:'No account needed. Your exported portfolio contains your chosen context and self-reported steps, never free-text answers or rankings of ability. Keep your file private.',importHome:'Continue from an exported portfolio',footer:'18+ · Demonstration · No intelligence measurement · Think first. AI second.',
 stats:(p,c,g)=>`${p} packs · ${c} competencies · ${g} pathways`,
 levels:['New to this','Exploring','Practicing','Feel confident'],
 count:x=>`${x} competencies with explicit prerequisites`,estimate:(t,p)=>`About ${t} minutes of suggested activities · selected pace ${p} min/week`,
 reasonGoal:'Chosen goal',reasonPrereq:'Useful foundation',focusTransfer:'Check my autonomy',focusDiscover:'Discover and try',focusPractice:'Practice and transfer',
 activity:'Try in',context:'Contextual example:',progress:'Self-reported step',progressNames:['Explored','Practiced','Review later'],emptyProgress:'No self-reported step yet',
 noAge:'Confirm that you are at least 18 before building a pathway.',success:'Pathway created. Edit or export it whenever you wish.',cleared:'Your session and its steps have been erased.',saved:'Portfolio downloaded. Keep it private.',imported:'Portfolio imported and your pathway rebuilt.',migrated:'The catalog changed since the export. Please review your pathway.',importError:'Cannot import: ',invalid:'Cannot create pathway: ',noProfile:'Create a pathway before exporting it.',
 titles:{think:'THINK',focus:'FOCUS',learn:'LEARN',decide:'DECIDE'},
 suggestion:'Educational suggestion, never required.',selfReport:'Self-reported only; not a certificate.'
}};
const w=key=>words[locale][key];
const local=v=>v?.[locale]??v?.fr??'';
function message(value){$('form-status').textContent=value;}
const tags={think:'/',focus:'/focus',learn:'/learn',decide:'/decide'};
function renderLocale(){
 document.documentElement.lang=locale;
 document.title=(locale==='en'?'My journey':'Mon parcours')+' | HUMAN FIRST';
 for(const element of document.querySelectorAll('[data-text]')){
   const key=element.dataset.text;
   if(typeof w(key)==='string')element.textContent=w(key);
 }
 $('lang').textContent=locale==='en'?'FR':'EN';$('lang').setAttribute('aria-label',locale==='en'?'Passer en français':'Switch to English');
 for(const pillar of PILLARS)$('link-'+pillar).href=tags[pillar]+'?lang='+locale;
 const qual=$('qualification'),occupation=$('occupation');
 qual.placeholder=locale==='en'?'Bachelor, vocational training, self-directed learning…':'Licence, BTS, formation libre…';
 occupation.placeholder=locale==='en'?'Laboratory, design, computing…':'Laboratoire, artisanat, informatique…';
 const stats=registryPublicStats(registry);
 $('stats').textContent=w('stats')(stats.packs,stats.competencies,stats.pathways);
 renderPathways();
 if(program)renderProgram();
}
function renderPathways(){
 const selector=$('path');const selected=selector.value;
 selector.replaceChildren();
 // Audience tags suggest possible context but do not hide or restrict anything.
 const stage=$('stage').value;
 const paths=[...registry.paths.values()].sort((a,b)=>Number(b.audiences.includes(stage))-Number(a.audiences.includes(stage)));
 for(const path of paths){const opt=document.createElement('option');opt.value=path.id;opt.textContent=local(path.title);selector.append(opt);}
 if([...registry.paths.keys()].includes(selected))selector.value=selected;
 if(!selector.value&&paths.length)selector.value=paths[0].id;
 const active=registry.paths.get(selector.value);
 $('path-help').textContent=active?local(active.summary):'';
 renderFamiliarity();
}
function goals(pathId){
 const path=registry.paths.get(pathId);if(!path)return [];
 const seen=new Set(),ordered=[];
 function add(id){if(seen.has(id))return;seen.add(id);for(const dep of registry.skills.get(id).requires)add(dep);ordered.push(id);}
 path.competencyIds.forEach(add);return ordered;
}
function renderFamiliarity(){
 const container=$('familiarity-list');container.replaceChildren();
 const ordered=goals($('path').value);
 for(const id of ordered){
  const s=registry.skills.get(id);const wrap=document.createElement('div');wrap.className='familiarity-item';
  const label=document.createElement('label');const select=document.createElement('select');
  select.id='familiarity-'+id;label.htmlFor=select.id;label.textContent=local(s.title);
  ['new','exploring','practicing','confident'].forEach((value,i)=>{
    const option=document.createElement('option');option.value=value;option.textContent=w('levels')[i];select.append(option);
  });
  select.value=familiarity[id]??'new';
  select.addEventListener('change',()=>{familiarity[id]=select.value;});
  wrap.append(label,select);container.append(wrap);
 }
}
function readProfile(){
 return normalizeProfile({adult:$('adult').checked,locale,stage:$('stage').value,
   ageBand:$('age-band').value,qualification:$('qualification').value,
   occupation:$('occupation').value,minutesPerWeek:$('pace').value,
   pathId:$('path').value,familiarity},registry);
}
function generate(){
 if(!$('adult').checked){message(w('noAge'));$('adult').focus();return;}
 try{
  const profile=readProfile();program=buildJourney(registry,profile);message(w('success'));
  renderProgram();$('result').hidden=false;
  $('result-title').focus({preventScroll:true});$('result').scrollIntoView({behavior:'auto',block:'start'});
 }catch(error){message(w('invalid')+error.message);}
}
function element(name,cls,text){const n=document.createElement(name);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function latestStatus(skillId){
 const matching=events.filter(x=>x.skillId===skillId);
 if(!matching.length)return w('emptyProgress');
 const last=matching.at(-1);
 return w('progressNames')[PROGRESS_EVENTS.indexOf(last.type)];
}
function record(skillId,type){
 events.push({skillId,type,at:new Date().toISOString(),source:'self-declared'});
 renderProgram();
}
function renderProgram(){
 if(!program)return;
 // Recompute on locale toggle, keeping the learner-selected profile and events intact.
 const raw={...program.generatedFor,locale,familiarity:{...program.generatedFor.familiarity}};
 program=buildJourney(registry,raw);
 $('result-title').textContent=program.pathway.title;
 $('program-summary').textContent=program.pathway.summary;
 $('disclaimer').textContent=program.disclaimer+' '+w('selfReport');
 $('program-count').textContent=w('count')(program.plan.length);
 $('program-estimate').textContent=w('estimate')(program.workload.totalMinutesIndicative,program.workload.minutesPerWeek);
 const list=$('program-list');list.replaceChildren();
 program.plan.forEach(item=>{
  const li=element('li','program-card');
  const top=element('div','card-top');const n=element('span','card-index',String(item.order).padStart(2,'0'));
  const title=element('div');title.append(element('h3',null,item.title),element('p',null,item.outcome));top.append(n,title);li.append(top);
  const badges=element('div','badges');
  const reason=item.reason==='pathway-goal'?w('reasonGoal'):w('reasonPrereq');
  badges.append(element('span','badge',reason),element('span','badge',item.suggestedFocus==='transfer-and-verify'?w('focusTransfer'):item.suggestedFocus==='discover-and-practice'?w('focusDiscover'):w('focusPractice')));
  li.append(badges,element('p','why',item.explanation));
  if(item.context)li.append(element('p','context',w('context')+' '+item.context));
  const grid=element('div','pillars');
  for(const pillar of PILLARS){
    const card=element('div','pillar');card.append(element('b',null,w('titles')[pillar]),element('p',null,item.pillars[pillar]));
    const link=element('a',null,w('activity')+' '+w('titles')[pillar]+' ↗');link.href=tags[pillar]+'?lang='+locale;
    card.append(link);grid.append(card);
  }
  li.append(grid);
  const progress=element('div','progress-row');progress.append(element('span','progress-status',w('progress')+': '+latestStatus(item.skillId)));
  for(let i=0;i<PROGRESS_EVENTS.length;i++){
    const button=element('button',null,w('progressNames')[i]);button.type='button';
    button.addEventListener('click',()=>record(item.skillId,PROGRESS_EVENTS[i]));progress.append(button);
  }
  li.append(progress);list.append(li);
 });
}
function resetAll(){program=null;events=[];familiarity={};$('profile-form').reset();$('result').hidden=true;renderPathways();message(w('cleared'));}
function savePortfolio(){
 if(!program){message(w('noProfile'));return;}
 try{
   const json=exportPortfolio(registry,program.generatedFor,events);
   const blob=new Blob([json],{type:'application/json'});const url=URL.createObjectURL(blob);
   const anchor=document.createElement('a');anchor.href=url;anchor.download='human-first-mon-parcours-v08.json';
   document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   message(w('saved'));
 }catch(e){message(w('invalid')+e.message);}
}
async function loadFile(input){
 const file=input.files?.[0];input.value='';if(!file)return;
 try{
   if(file.size>80_000)throw new TypeError('File exceeds 80 kB');
   const portfolio=importPortfolio(await file.text(),registry);
   const p=portfolio.profile;
   $('adult').checked=true;$('stage').value=p.stage;$('age-band').value=p.ageBand;
   $('qualification').value=p.qualification;$('occupation').value=p.occupation;$('pace').value=String(p.minutesPerWeek);
   familiarity={...p.familiarity};renderPathways();$('path').value=p.pathId;renderPathways();
   events=portfolio.evidence;locale=p.locale;renderLocale();
   program=buildJourney(registry,p);$('result').hidden=false;renderProgram();
   message(portfolio.migrated?w('migrated'):w('imported'));
   $('result').scrollIntoView({behavior:'auto',block:'start'});
 }catch(e){message(w('importError')+e.message);$('form-status').scrollIntoView({block:'nearest'});}
}
$('profile-form').addEventListener('submit',e=>{e.preventDefault();generate();});
$('path').addEventListener('change',()=>{$('path-help').textContent=local(registry.paths.get($('path').value).summary);renderFamiliarity();});
$('stage').addEventListener('change',renderPathways);
$('clear').addEventListener('click',resetAll);
$('export').addEventListener('click',savePortfolio);
$('reset-progress').addEventListener('click',()=>{events=[];renderProgram();});
$('import').addEventListener('change',e=>loadFile(e.target));
$('import-home').addEventListener('change',e=>loadFile(e.target));
$('lang').addEventListener('click',()=>{
  // Do not drop what the learner typed when translating the UI.
  familiarity=Object.fromEntries([...document.querySelectorAll('.familiarity-item select')].map(el=>[el.id.slice('familiarity-'.length),el.value]));
  locale=locale==='en'?'fr':'en';const url=new URL(location.href);url.searchParams.set('lang',locale);history.replaceState(null,'',url);
  renderLocale();
});
renderLocale();