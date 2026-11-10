import {installedPacks} from './packs.mjs';
import {starterLibraries,libraryActions} from './libraries.mjs';
import {addStarterLibrary} from './library-manager.mjs';
import {initialLanguage,syncLanguage} from '../language.mjs';
import {availableFormative,makeFormativeObservation} from './assessment.mjs';
import {normalizeAliasManifest} from './continuity.mjs';
import {restorePortablePortfolio} from './restore.mjs';
import {encryptPortfolio,decryptPortfolio,VAULT_MAX_ENVELOPE} from './vault.mjs';
import {saveEncryptedDevice,readEncryptedDevice,clearEncryptedDevice} from './device-vault.mjs';
import {mountEncryptedRemoteSync} from './remote-ui.mjs';
import {suggestPractice} from './compass.mjs';
import {selfReportedSummary,latestDeclarations,visibleSkills,practicePrompt} from './workspace.mjs';
import {createRegistry,buildJourney,normalizeProfile,exportPortfolio,importPortfolio,registryPublicStats,PILLARS,PROGRESS_EVENTS} from './engine.mjs';

// Entire learner profile, self-report and progress remain in this document's memory.
// No fetch(), analytics, AI call, cookie, localStorage or sessionStorage for these fields.
let registry=createRegistry(installedPacks);
const importedPacks=[];
const $=id=>document.getElementById(id);
let locale=initialLanguage();
let program=null;
let events=[];
let formative=[];
let activeFormative=null;
let activePractice=null; // in-tab UI selection only, never exported
let aliasManifest=null;
let familiarity={};
const vaultWords={
 fr:{
 eyebrow:'CONTINUITÉ · SAUVEGARDE PRIVÉE',title:'Un coffre chiffré, sans compte.',
 intro:'Sauvegarde ton parcours dans un fichier chiffré ou sur cet appareil. L’envoi distant est une option distincte, désactivée par défaut.',
 warning:'Choisis une phrase secrète longue et unique (12 caractères minimum). Si tu l’oublies, nous ne pouvons pas récupérer ta sauvegarde. Conserve une copie du fichier ailleurs. Toute personne ayant accès à ce navigateur peut voir qu’une sauvegarde existe.',
 password:'Ma phrase secrète (jamais enregistrée)',placeholder:'Phrase secrète unique · 12 caractères minimum',
 confirm:'Confirmer la phrase secrète (uniquement pour créer une sauvegarde)',confirmPlaceholder:'Répéter la phrase secrète pour enregistrer',mismatch:'Les deux phrases secrètes ne correspondent pas.',overwrite:'Une sauvegarde existe déjà sur cet appareil. Voulez-vous la remplacer ? L’ancienne ne pourra pas être récupérée.',
 download:'Télécharger une sauvegarde chiffrée',import:'Ouvrir une sauvegarde chiffrée',
 save:'Enregistrer chiffré sur cet appareil',resume:'Reprendre depuis cet appareil',
 clear:'Supprimer la sauvegarde de cet appareil',
 note:'Sauvegarde volontaire, non automatique : le navigateur peut effacer ses données. Garde une copie externe.',
 savedFile:'Fichier chiffré téléchargé. Conserve la phrase secrète et le fichier séparément.',
 savedDevice:'Coffre chiffré enregistré sur cet appareil. Enregistre aussi un fichier de secours.',
 restored:'Portfolio déchiffré et restauré. Aucun texte libre n’a été conservé.',
 deleted:'Sauvegarde chiffrée locale supprimée. Les copies téléchargées existent toujours.',
 missing:'Aucune sauvegarde chiffrée trouvée sur cet appareil.',
 failed:'Opération impossible : ',
 mustCreate:'Crée ou importe d’abord un parcours pour l’enregistrer.',
 replace:'Remplacer le parcours actuellement ouvert ? Tout travail non enregistré sera perdu.',
 confirmDelete:'Supprimer le coffre chiffré stocké sur cet appareil ? Cette action est irréversible.',
 busy:'Opération sécurisée en cours…',encrypting:'Chiffrement en cours…',restoring:'Déchiffrement et validation en cours…',clearing:'Suppression de la sauvegarde locale en cours…'
 },
 en:{
 eyebrow:'CONTINUITY · PRIVATE BACKUP',title:'An encrypted vault, no account needed.',
 intro:'Back up your pathway to an encrypted file or on this device. Remote storage is a separate, disabled-by-default option.',
 warning:'Choose a long unique passphrase (at least 12 characters). We cannot recover a forgotten passphrase. Keep another copy of the file elsewhere. Anyone with access to this browser can see that a backup exists.',
 password:'My passphrase (never stored)',placeholder:'Unique passphrase · at least 12 characters',
 confirm:'Confirm passphrase (only when creating a backup)',confirmPlaceholder:'Repeat the passphrase to save',mismatch:'The two passphrases do not match.',overwrite:'An encrypted backup already exists on this device. Replace it? The old backup cannot be recovered.',
 download:'Download encrypted backup',import:'Open encrypted backup',
 save:'Save encrypted on this device',resume:'Restore from this device',
 clear:'Delete this device backup',
 note:'Voluntary, not automatic: the browser can erase its data. Keep an external copy.',
 savedFile:'Encrypted file downloaded. Keep the passphrase and backup separately.',
 savedDevice:'Encrypted backup saved on this device. Keep an external file too.',
 restored:'Portfolio decrypted and restored. No free-text answers were stored.',
 deleted:'Encrypted local backup deleted. Previously downloaded files still exist.',
 missing:'No encrypted backup found on this device.',
 failed:'Could not complete: ',
 mustCreate:'Create or import a learning pathway before saving it.',
 replace:'Replace the currently open pathway? Unsaved work will be lost.',
 confirmDelete:'Delete the encrypted backup stored on this device? This cannot be undone.',
 busy:'Secure operation in progress…',encrypting:'Encrypting backup…',restoring:'Decrypting and validating backup…',clearing:'Removing device backup…'
 }
};
const vaultLabels={
 'vault-eyebrow':'eyebrow','vault-heading':'title','vault-intro':'intro',
 'vault-warning':'warning','vault-passphrase-label':'password','vault-confirm-label':'confirm',
 'vault-download':'download','vault-import-label':'import','vault-save-device':'save',
 'vault-resume-device':'resume','vault-clear-device':'clear','vault-note':'note'
};
function translateVault(){
 const l=vaultWords[locale];
 for(const [id,key] of Object.entries(vaultLabels))$(id).textContent=l[key];
 $('vault-passphrase').placeholder=l.placeholder;
 $('vault-confirm').placeholder=l.confirmPlaceholder;
}
function vaultStatus(message){$('vault-status').textContent=message;}

const words={
fr:{
 compassEyebrow:'V1.3 · BOUSSOLE PÉDAGOGIQUE',compassHeading:'Choisir ma prochaine pratique',
 compassLead:'Jusqu’à trois idées fondées sur ton objectif et tes propres étapes déclarées, sans classement de tes capacités. Tu peux suivre une autre piste à tout moment.',
 compassReminder:'Un lien de pilier ouvre son espace général, pas un exercice automatiquement attribué. Les propositions sont facultatives et restent dans cet onglet.',
 compassReview:'Tu as indiqué vouloir revoir cette compétence : essaie de la restituer sans aide.',
 compassDiscover:'Aucune étape déclarée ici : commence par questionner la situation.',
 compassPractice:'Tu l’as explorée : essaie une mise en pratique attentive.',
 compassTransfer:'Tu as déclaré une pratique : essaie de décider dans un autre contexte.',
 compassSkill:'Voir les quatre activités de cette compétence',compassPillar:'Explorer',
 skip:'Aller au contenu',journeyNav:'MON PARCOURS',eyebrow:'LE NOYAU PÉDAGOGIQUE · V1.4',heroOne:'Un parcours à ton image.',heroTwo:'Et toujours libre d’évoluer.',heroLead:'Tes objectifs changent avec les années. Nos compétences et les quatre piliers évoluent avec toi, sans réduire ton potentiel à un âge ou à un diplôme.',
 noScore:'✓ Sans notation automatisée',noAccount:'✓ Sans compte',portable:'✓ Exportable et modifiable',foundationTitle:'L’IDÉE CENTRALE',foundationHeading:'Des compétences, pas des cases.',foundationCopy:'Aucun métier, diplôme, pays ou domaine n’est intégré en dur au moteur. De nouveaux référentiels s’ajoutent comme modules de contenu versionnés, avec des prérequis explicites et des activités sur les quatre piliers.',
 dashboardHeading:"Retrouver mon fil d'apprentissage",dashboardIntro:'Tes étapes sont des déclarations personnelles, pas une note ni une mesure de tes capacités.',
 dashboardTotal:'Compétences dans mon parcours',dashboardNew:'Sans étape déclarée',dashboardReviewed:'Avec une étape déclarée',
 dashboardContinue:'Commencer ma prochaine activité',dashboardLibraries:'Voir les bibliothèques',
 practiceEyebrow:'ATELIER GUIDÉ · SANS NOTE',practiceClose:"Fermer l'activité",
 practiceDisclaimer:"La consigne vient du référentiel chargé. Cette activité est à réaliser librement, sans correction ni exercice imposé. Aucun texte n'est enregistré.",
 practiceExplored:"J'ai exploré",practicePracticed:"J'ai pratiqué",practiceReview:'À revoir',
 practiceNext:'Compétence suivante',practiceSpace:'Explorer le pilier général ↗',
 practiceOpen:'Voir la consigne',practiceCurrent:'Mon étape déclarée',
 searchLabel:'Rechercher une compétence',searchPlaceholder:'Titre, sujet, mot-clé…',
 filterLabel:'Étape déclarée',filterAll:'Toutes les compétences',filterNew:'Sans étape déclarée',
 filterExplored:'Explorées',filterPracticed:'Pratiquées',filterReview:'À revoir',
 searchEmpty:'Aucune compétence ne correspond. Modifie ta recherche ou ton filtre.',
 dashboardMetricsAria:'Récapitulatif des étapes déclarées',practicePillarsAria:'Choisir une modalité de pratique',
 practiceProgressAria:'Étapes personnelles facultatives',searchGroupAria:'Retrouver mes compétences',
 libraryResume:'Ouvrir le parcours',
 libraryHeading:'Bibliothèques prêtes à charger',
 libraryIntro:"Choisis une bibliothèque : un clic l'ajoute à tes objectifs. Ces exemples pédagogiques FR/EN ne sont ni certifiés ni évalués par des experts. Ils restent dans cet onglet.",
 libraryDownload:'Télécharger un exemple JSON',libraryStudio:'Créer ma bibliothèque dans Studio ↗',
 libraryNote:"Les bibliothèques ajoutées disparaissent en actualisant cet onglet. Avant de reprendre un portfolio exporté, recharge les mêmes bibliothèques (ou packs JSON) dans le même ordre. Aucun fichier externe n'est téléchargé automatiquement.",
 libraryReady:'Bibliothèque chargée. Tu peux choisir son parcours ci-dessus.',libraryError:'Impossible de charger cette bibliothèque : ',
 packTitle:'Ajouter un référentiel pédagogique',packHelp:'Importe un pack JSON déclaratif depuis ton appareil : il sera vérifié, utilisable uniquement dans cet onglet et jamais publié automatiquement.',packImport:'Importer un pack JSON',packAdded:'Référentiel importé dans cet onglet. Contenu non certifié : contrôle pédagogique nécessaire.',packFailed:'Référentiel refusé : ',
 builderEyebrow:'ATELIER DE PARCOURS',builderTitle:'Construire mon programme',adultTitle:'Accès au prototype',adultNotice:'Je confirme avoir 18 ans ou plus. Les parcours pour mineurs exigent des garanties complémentaires.',stageTitle:'Ma situation actuelle',stagePersonal:'Apprendre par intérêt personnel',stageSchool:'Reprise d’études à l’âge adulte',stageHigher:'Études supérieures',stageWork:'Vie professionnelle',stageTransition:'Reconversion / transition',stageTeaching:'Enseignement / formation',ageTitle:'Tranche d’âge (facultatif)',ageUnspecified:'Je préfère ne pas préciser',ageHelp:'Jamais utilisée pour déduire tes capacités.',qualificationTitle:'Études / diplôme (facultatif)',qualificationHelp:'Description libre, non utilisée comme classement.',occupationTitle:'Métier / domaine (facultatif)',occupationHelp:'Pour préciser ton contexte, sans limiter les choix.',paceTitle:'Temps souhaité par semaine',pace30:'30 minutes environ',pace60:'1 heure environ',pace120:'2 heures environ',pace180:'3 heures environ',paceHelp:'Simple repère facultatif, pas un chronomètre.',pathTitle:'Mon objectif d’apprentissage',familiarityTitle:'Ce que je connais déjà (facultatif)',familiarityHelp:'Une auto-description, jamais un diagnostic ni un certificat. Toutes les compétences restent accessibles.',create:'Créer mon parcours ↗',clear:'Effacer cette séance',privacyNotice:'Tes réponses restent uniquement dans cet onglet. Aucun profil n’est envoyé au serveur. Tu peux exporter volontairement un fichier JSON pour reprendre plus tard.',
 resultEyebrow:'PROGRAMME INDIVIDUEL · DÉMONSTRATION',export:'Exporter mon portfolio JSON non chiffré',import:'Importer un portfolio JSON',resetProgress:'Effacer les étapes déclarées',exitTitle:'La suite t’appartient.',exitDescription:'Tu peux explorer ces compétences dans THINK, FOCUS, LEARN et DECIDE, arrêter sans justification, ou modifier ton programme à tout moment.',portabilityEyebrow:'TU RESTES PROPRIÉTAIRE DU PARCOURS',portabilityTitle:'Tu peux repartir avec tes données.',portabilityText:'Aucun compte n’est requis. Le portfolio exporté contient ton contexte déclaré, tes choix et les étapes auto-déclarées, jamais des réponses libres ou un classement d’aptitudes. Garde ce fichier privé.',importHome:'Reprendre un portfolio exporté',footer:'18+ · Prototype de démonstration · Pas de mesure de l’intelligence · Think first. AI second.',
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
 compassEyebrow:'V1.3 · LEARNING COMPASS',compassHeading:'Choose my next practice',
 compassLead:'Up to three ideas based on your chosen goal and your own declared steps, never a ranking of ability. You can take another route at any time.',
 compassReminder:'Pillar links open the general learning space, not an automatically assigned exercise. All suggestions are optional and stay in this tab.',
 compassReview:'You chose “review later”: try recalling this skill without help.',
 compassDiscover:'No step declared yet: begin by questioning the situation.',
 compassPractice:'You explored this skill: try focused practice.',
 compassTransfer:'You declared practice: try making a choice in a different context.',
 compassSkill:'See all four activities for this skill',compassPillar:'Explore',
 skip:'Skip to content',journeyNav:'MY JOURNEY',eyebrow:'THE LEARNING KERNEL · V1.4',heroOne:'A pathway shaped by you.',heroTwo:'Free to change as you grow.',heroLead:'Your goals change throughout life. Skills and four pillars can evolve with you, without reducing your potential to an age or a degree.',
 noScore:'✓ No automatic grading',noAccount:'✓ No account',portable:'✓ Portable and editable',foundationTitle:'THE CORE IDEA',foundationHeading:'Competencies, not labels.',foundationCopy:'No occupation, degree, country or field is hard-coded into the engine. New versioned content packs can add explicit prerequisites and activities across the four pillars.',
 dashboardHeading:'Pick up where I left off',dashboardIntro:'These are your own declared steps, not grades or measures of ability.',
 dashboardTotal:'Skills in my pathway',dashboardNew:'No step declared yet',dashboardReviewed:'With a declared step',
 dashboardContinue:'Start my next activity',dashboardLibraries:'Browse the libraries',
 practiceEyebrow:'GUIDED PRACTICE · NO GRADE',practiceClose:'Close activity',
 practiceDisclaimer:'This instruction comes from the loaded curriculum. Practice freely without an assigned exercise or automatic correction. No text is saved.',
 practiceExplored:'I explored this',practicePracticed:'I practiced this',practiceReview:'Review later',
 practiceNext:'Next skill',practiceSpace:'Explore the general pillar ↗',
 practiceOpen:'Read the instruction',practiceCurrent:'My declared step',
 searchLabel:'Find a skill',searchPlaceholder:'Title, topic, keyword…',
 filterLabel:'Declared step',filterAll:'All skills',filterNew:'No step declared',
 filterExplored:'Explored',filterPracticed:'Practiced',filterReview:'Review later',
 searchEmpty:'No skills match. Change your search or filter.',
 dashboardMetricsAria:'Self-declared steps summary',practicePillarsAria:'Choose a learning mode',
 practiceProgressAria:'Optional personal progress markers',searchGroupAria:'Find my skills',
 libraryResume:'Open this pathway',
 libraryHeading:'Ready-to-use knowledge libraries',
 libraryIntro:'Choose a library: one click adds its learning goals. These bilingual demonstrations are not certified or independently reviewed. They stay in this tab.',
 libraryDownload:'Download a JSON example',libraryStudio:'Create my own library in Studio ↗',
 libraryNote:'Added libraries disappear when you reload this tab. Before restoring an exported portfolio, load the same libraries (or JSON packs) in the same order. No external files are downloaded automatically.',
 libraryReady:'Library loaded. You can select its pathway above.',libraryError:'Cannot load this library: ',
 packTitle:'Add a learning content pack',packHelp:'Import a declarative JSON pack from your device: it will be validated, used in this tab only, and never automatically published.',packImport:'Import a JSON pack',packAdded:'Pack available in this tab. Not certified: educational review required.',packFailed:'Pack rejected: ',
 builderEyebrow:'JOURNEY WORKSHOP',builderTitle:'Build my learning program',adultTitle:'Demo access',adultNotice:'I confirm that I am 18 or older. Learning paths for minors need additional safeguards.',stageTitle:'My current situation',stagePersonal:'Personal learning',stageSchool:'Returning to education as an adult',stageHigher:'Higher education',stageWork:'Professional life',stageTransition:'Career change / transition',stageTeaching:'Teaching / training',ageTitle:'Age band (optional)',ageUnspecified:'Prefer not to say',ageHelp:'Never used to infer your ability.',qualificationTitle:'Education / qualification (optional)',qualificationHelp:'Free description, not used as a ranking.',occupationTitle:'Occupation / field (optional)',occupationHelp:'Adds context without limiting your choices.',paceTitle:'Preferred time per week',pace30:'About 30 minutes',pace60:'About 1 hour',pace120:'About 2 hours',pace180:'About 3 hours',paceHelp:'Only a guide; never an enforced timer.',pathTitle:'My learning goal',familiarityTitle:'What I already know (optional)',familiarityHelp:'Self-description only, not a diagnostic or certificate. Every competency remains open.',create:'Create my pathway ↗',clear:'Erase this session',privacyNotice:'Your entries remain in this tab only. No profile is sent to a server. You can explicitly export a JSON file to return later.',
 resultEyebrow:'PERSONAL PROGRAM · DEMONSTRATION',export:'Export my unencrypted JSON portfolio',import:'Import a JSON portfolio',resetProgress:'Erase self-reported steps',exitTitle:'The next step is yours.',exitDescription:'Explore the skills through THINK, FOCUS, LEARN and DECIDE. Stop whenever you want or change your pathway freely.',portabilityEyebrow:'YOU CONTROL YOUR PATHWAY',portabilityTitle:'Your data can travel with you.',portabilityText:'No account needed. Your exported portfolio contains your chosen context and self-reported steps, never free-text answers or rankings of ability. Keep your file private.',importHome:'Continue from an exported portfolio',footer:'18+ · Demonstration · No intelligence measurement · Think first. AI second.',
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
 syncLanguage(locale);
 translateVault();
 remoteUi.render();
 document.title=(locale==='en'?'My journey':'Mon parcours')+' | HUMAN FIRST';
 for(const element of document.querySelectorAll('[data-text]')){
   const key=element.dataset.text;
   if(typeof w(key)==='string')element.textContent=w(key);
 }
 document.querySelector('[data-text="aliasesLabel"]').textContent=locale==='en'?'Load an equivalence map for older catalogs (optional)':'Table d’équivalences pour anciens référentiels (facultative)';
 $('lang').textContent=locale==='en'?'FR':'EN';$('lang').setAttribute('aria-label',locale==='en'?'Passer en français':'Switch to English');
 for(const pillar of PILLARS)$('link-'+pillar).href=tags[pillar]+'?lang='+locale;
 $('program-search').placeholder=w('searchPlaceholder');
 $('dashboard-metrics').setAttribute('aria-label',w('dashboardMetricsAria'));
 $('practice-pillar-choices').setAttribute('aria-label',w('practicePillarsAria'));
 document.querySelector('.practice-declarations').setAttribute('aria-label',w('practiceProgressAria'));
 document.querySelector('.program-tools').setAttribute('aria-label',w('searchGroupAria'));
 const qual=$('qualification'),occupation=$('occupation');
 qual.placeholder=locale==='en'?'Bachelor, vocational training, self-directed learning…':'Licence, BTS, formation libre…';
 occupation.placeholder=locale==='en'?'Laboratory, design, computing…':'Laboratoire, artisanat, informatique…';
 const stats=registryPublicStats(registry);
 $('stats').textContent=w('stats')(stats.packs,stats.competencies,stats.pathways);
 renderLibraryCards();
 renderPathways();
 if(program)renderProgram();
}
function renderLibraryCards(){
 const list=$('library-list');list.replaceChildren();
 const action=libraryActions[locale];
 for(const library of starterLibraries){
  const loaded=importedPacks.some(pack=>pack.id===library.id);
  const card=element('article','hf-library-card');
  const title=local(library.pack.title);
  card.append(element('h4',null,title),element('p',null,local(library.summary)));
  card.append(element('span','hf-library-meta',
   library.pack.competencies.length+' '+(library.pack.competencies.length===1?action.skill:action.skills)+' · '+
   library.pack.pathways.length+' '+(library.pack.pathways.length===1?action.path:action.paths)+' · 18+'));
  const button=element('button','hf-action '+(loaded?'hf-action--secondary':'hf-action--primary'),
   loaded?action.loaded:action.load);
  button.type='button';button.dataset.libraryId=library.id;
  button.setAttribute('aria-label',(loaded?action.loaded:action.load)+': '+title);
  if(loaded){
   button.textContent=w('libraryResume');
   button.setAttribute('aria-label',w('libraryResume')+': '+title);
  }
  button.addEventListener('click',()=>loaded?openLibraryPath(library):loadStarter(library.id));
  card.append(button);list.append(card);
 }
}
function openLibraryPath(library){
 const pathId=library.pack.pathways[0]?.id;
 if(!pathId||!registry.paths.has(pathId))return;
 $('path').value=pathId;renderPathways();
 if($('adult').checked)generate();
 else{$('adult').focus();message(w('noAge'));}
}
function activatePack(pack,nextRegistry,targetPath){
 const hadProgram=Boolean(program);
 closeFormative();
 importedPacks.push(pack);registry=nextRegistry;
 aliasManifest=null;$('alias-state').textContent='';
 renderLocale();
 if(targetPath&&registry.paths.has(targetPath)){
  $('path').value=targetPath;renderPathways();
  if($('adult').checked)generate();
 }else if(hadProgram)renderProgram();
}
function loadStarter(id){
 try{
  const added=addStarterLibrary(installedPacks,importedPacks,id);
  activatePack(added.optionalPacks.at(-1),added.registry,added.library.pack.pathways[0]?.id);
  message(libraryActions[locale].loadedNotice+local(added.library.pack.title)+'.');
  // Preserve keyboard position when the cards are updated.
  const button=[...document.querySelectorAll('#library-list button')].find(x=>x.dataset.libraryId===id);
  button?.focus({preventScroll:true});
 }catch(error){message(w('libraryError')+String(error.message||error));}
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
  const profile=readProfile();
  const nextProgram=buildJourney(registry,profile);
  if(program?.pathway.id!==nextProgram.pathway.id){
   closePractice();
   $('program-search').value='';$('program-filter').value='all';
  }
  program=nextProgram;message(w('success'));
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
 if(events.length>=1500){message(locale==='en'?'Export your portfolio before adding more steps.':'Exporte ton portfolio avant d’ajouter d’autres étapes.');return;}
 const oldFocus=document.activeElement;
 const fromCard=oldFocus?.dataset?.progressSkill===skillId;
 events.push({skillId,type,at:new Date().toISOString(),source:'self-declared'});
 renderProgram();
 if(fromCard){
  const next=[...document.querySelectorAll('#program-list button[data-progress-skill]')]
   .find(button=>button.dataset.progressSkill===skillId&&button.dataset.progressType===type);
  next?.focus({preventScroll:true});
 }
}
// Formative work is deliberately not graded. The learner's writing only exists in
// this textarea, not in the portfolio, analytics or any HTTP request.
function closeFormative(){
 activeFormative=null;
 $('formative-answer').value='';
 $('formative-answer').disabled=false;
 $('formative-feedback').hidden=true;
 $('formative-criteria').replaceChildren();
 $('formative-panel').hidden=true;
}
function openFormative(skillId){
 const task=availableFormative(registry,skillId,locale);
 if(!task)return;
 closeFormative();
 activeFormative=task;
 $('formative-panel').hidden=false;
 $('formative-heading').textContent=task.title;
 $('formative-scenario').textContent=task.scenario;
 $('formative-question').textContent=task.question;
 const en=locale==='en';
 $('formative-eyebrow').textContent=en?'FORMATIVE PRACTICE · NO GRADE':'ATELIER FORMATIF · SANS NOTE';
 $('formative-close').textContent=en?'Close without saving':'Fermer sans conserver';
 $('formative-label').textContent=en?'Your attempt (optional, private, never exported)':'Ta tentative (facultative, privée, jamais exportée)';
 $('formative-privacy').textContent=en?'Your writing stays only in this browser tab. No automated grade or ability assessment.':'Le texte reste uniquement dans cet onglet. Aucune correction automatique ni appréciation de tes capacités.';
 $('formative-reveal').textContent=en?'Compare with self-check criteria':'Comparer avec les critères d’auto-vérification';
 $('formative-criteria-heading').textContent=en?'Questions for your own review':'Questions de relecture personnelle';
 $('formative-feedback-explanation').textContent=en?'Tick only what you believe you considered. No score or certification is generated.':'Coche seulement les éléments que tu penses avoir pris en compte. Aucune note ni certification.';
 $('formative-transfer-heading').textContent=en?'Try another situation':'Essayer dans un nouveau contexte';
 $('formative-save').textContent=en?'Keep a record of this reflection (not my answer)':'Garder une trace de cette réflexion (sans ma réponse)';
 $('formative-reveal').hidden=false;
 $('formative-feedback').hidden=true;
 $('formative-panel').scrollIntoView({behavior:'auto',block:'start'});
 $('formative-heading').focus();
}
/**
 * Locale switches must not destroy a learner's unfinished private response.
 * Snapshot lives only in this call stack; never stored or exported.
 */
function relocalizeActiveFormative(){
 if(!activeFormative)return;
 const skillId=activeFormative.skillId;
 const answer=$('formative-answer').value;
 const revealed=!$('formative-feedback').hidden;
 const checked=new Set([...document.querySelectorAll('#formative-criteria input:checked')].map(x=>x.value));
 openFormative(skillId);
 $('formative-answer').value=answer;
 if(revealed){
  revealFormative();
  for(const input of document.querySelectorAll('#formative-criteria input')){
   input.checked=checked.has(input.value);
  }
 }
}

function revealFormative(){
 if(!activeFormative)return;
 $('formative-answer').disabled=true;
 $('formative-reveal').hidden=true;
 const list=$('formative-criteria');list.replaceChildren();
 activeFormative.criteria.forEach(c=>{
  const row=element('label','formative-criterion');
  const check=document.createElement('input');check.type='checkbox';check.value=c.id;check.name='formative-criterion';
  const body=element('span');
  body.append(element('strong',null,c.label),element('small',null,c.guidance));
  row.append(check,body);list.append(row);
 });
 $('formative-transfer').textContent=activeFormative.transfer;
 $('formative-feedback').hidden=false;
 $('formative-criteria-heading').focus?.();
}
function saveFormative(){
 if(!activeFormative||$('formative-feedback').hidden)return;
 try{
  const selected=[...document.querySelectorAll('#formative-criteria input:checked')].map(x=>x.value);
  const record=makeFormativeObservation(registry,activeFormative.skillId,selected);
  if(formative.length>=500)throw new Error('Maximum 500 reflective entries. Export your portfolio first.');
  formative.push(record);
  closeFormative();
  renderProgram();
  message(locale==='en'?'Self-reflection noted. Your written answer was not saved.':'Réflexion notée. Ta réponse rédigée n’a pas été conservée.');
 }catch(e){message(String(e.message||e));}
}

function choosePillar(skillId){
 const state=latestDeclarations(program,events).get(skillId);
 return state==='review-later'?'learn':state==='explored'?'focus':state==='practiced'?'decide':'think';
}
function closePractice(){
 activePractice=null;
 $('practice-panel').hidden=true;
}
function openPractice(skillId,pillar=choosePillar(skillId),focus=true){
 try{
  practicePrompt(program,skillId,pillar);
  activePractice={skillId,pillar};
  renderPractice();
  if(focus){
   $('practice-panel').scrollIntoView({behavior:'auto',block:'start'});
   $('practice-title').focus({preventScroll:true});
  }
 }catch(error){message(w('invalid')+String(error.message||error));}
}
function renderPractice(){
 if(!activePractice)return;
 let current;
 try{current=practicePrompt(program,activePractice.skillId,activePractice.pillar);}
 catch{closePractice();return;}
 $('practice-panel').hidden=false;
 $('practice-title').textContent=current.title+' · '+w('titles')[current.pillar];
 $('practice-outcome').textContent=current.outcome;
 $('practice-instruction').textContent=current.activity;
 const context=$('practice-context');context.hidden=!current.context;
 context.textContent=current.context?w('context')+' '+current.context:'';
 $('practice-status').textContent=w('practiceCurrent')+': '+latestStatus(current.skillId);
 const choices=$('practice-pillar-choices');choices.replaceChildren();
 for(const pillar of PILLARS){
  const button=element('button','hf-action hf-action--secondary',w('titles')[pillar]);
  button.type='button';button.dataset.pillar=pillar;
  button.setAttribute('aria-pressed',String(pillar===current.pillar));
  button.setAttribute('aria-label',w('practiceOpen')+' '+w('titles')[pillar]+': '+current.title);
  button.addEventListener('click',()=>{
   activePractice={skillId:current.skillId,pillar};
   renderPractice();
   [...choices.querySelectorAll('button')].find(x=>x.dataset.pillar===pillar)?.focus({preventScroll:true});
  });
  choices.append(button);
 }
 $('practice-open-space').href=tags[current.pillar]+'?lang='+locale;
 $('practice-open-space').textContent=w('practiceSpace')+' '+w('titles')[current.pillar];
 $('practice-open-space').setAttribute('aria-label',w('practiceSpace')+' '+w('titles')[current.pillar]);
 const position=program.plan.findIndex(item=>item.skillId===current.skillId);
 $('practice-next').disabled=position<0||position>=program.plan.length-1;
}
function renderDashboard(){
 const counts=selfReportedSummary(program,events);
 $('dashboard-total').textContent=String(counts.total);
 $('dashboard-new').textContent=String(counts['not-started']);
 $('dashboard-reviewed').textContent=String(counts.total-counts['not-started']);
 $('dashboard-continue').disabled=!program.plan.length;
}
function renderCompass(){
 const list=$('compass-list');
 list.replaceChildren();
 const reasonTexts={
  review:'compassReview',discover:'compassDiscover',
  practice:'compassPractice',transfer:'compassTransfer'
 };
 for(const next of suggestPractice(program,events)){
  const li=element('li','compass-card');
  const heading=element('div','compass-card-heading');
  heading.append(element('strong',null,next.title),
   element('span','badge',w('titles')[next.pillar]));
  li.append(heading);
  li.append(element('p','compass-reason',w(reasonTexts[next.reason])));
  li.append(element('p','compass-activity',next.activity));
  if(next.context)li.append(element('p','context',w('context')+' '+next.context));
  const actions=element('div','compass-actions');
  const skillLink=element('a',null,w('compassSkill'));
  skillLink.href='#skill-'+next.skillId;
  skillLink.setAttribute('aria-label',w('compassSkill')+': '+next.title);
  const pillarLink=element('a',null,w('compassPillar')+' '+w('titles')[next.pillar]+' ↗');
  pillarLink.href=tags[next.pillar]+'?lang='+locale;
  pillarLink.setAttribute('aria-label',w('compassPillar')+' '+w('titles')[next.pillar]+': '+next.title);
  const open=element('button','hf-action hf-action--secondary',w('practiceOpen'));
  open.type='button';
  open.setAttribute('aria-label',w('practiceOpen')+': '+next.title+' · '+w('titles')[next.pillar]);
  open.addEventListener('click',()=>openPractice(next.skillId,next.pillar));
  actions.append(open,skillLink,pillarLink);
  li.append(actions);
  list.append(li);
 }
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
 renderDashboard();
 const list=$('program-list');list.replaceChildren();
 const shown=visibleSkills(program,events,{query:$('program-search').value,status:$('program-filter').value});
 $('program-empty').hidden=Boolean(shown.length);
 $('program-visible-count').textContent=locale==='en'?
  shown.length+' of '+program.plan.length+' skills shown':
  shown.length+' compétence(s) sur '+program.plan.length+' affichée(s)';
 shown.forEach(item=>{
  const li=element('li','program-card');li.id='skill-'+item.skillId;li.tabIndex=-1;
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
    const localButton=element('button','hf-action hf-action--secondary',w('practiceOpen'));
    localButton.type='button';
    localButton.setAttribute('aria-label',w('practiceOpen')+' '+w('titles')[pillar]+': '+item.title);
    localButton.addEventListener('click',()=>openPractice(item.skillId,pillar));
    const link=element('a',null,w('activity')+' '+w('titles')[pillar]+' ↗');
    link.href=tags[pillar]+'?lang='+locale;
    link.setAttribute('aria-label',w('compassPillar')+' '+w('titles')[pillar]+': '+item.title);
    card.append(localButton,link);grid.append(card);
  }
  li.append(grid);
  const progress=element('div','progress-row');progress.append(element('span','progress-status',w('progress')+': '+latestStatus(item.skillId)));
  for(let i=0;i<PROGRESS_EVENTS.length;i++){
    const button=element('button',null,w('progressNames')[i]);button.type='button';
    button.dataset.progressSkill=item.skillId;button.dataset.progressType=PROGRESS_EVENTS[i];
    button.setAttribute('aria-label',w('progressNames')[i]+': '+item.title);
    button.addEventListener('click',()=>record(item.skillId,PROGRESS_EVENTS[i]));progress.append(button);
  }
  li.append(progress);
  if(availableFormative(registry,item.skillId,locale)){
   const bar=element('div','formative-cta');
   const button=element('button','secondary',locale==='en'?'Try an optional practice task':'Essayer une tâche formative facultative');
   button.type='button';
   button.addEventListener('click',()=>openFormative(item.skillId));
   bar.append(button);
   const count=formative.filter(x=>x.skillId===item.skillId).length;
   if(count)bar.append(element('span',null,locale==='en'?count+' personal reflection(s), not graded':count+' réflexion(s) personnelles, sans note'));
   li.append(bar);
  }
  list.append(li);
 });
 renderCompass();
 renderPractice();
}
function resetAll(){
 closeFormative();closePractice();aliasManifest=null;$('alias-state').textContent='';
 registry=createRegistry(installedPacks);importedPacks.length=0;
 program=null;events=[];formative=[];familiarity={};
 $('program-search').value='';$('program-filter').value='all';
 $('profile-form').reset();$('result').hidden=true;
 renderLibraryCards();renderPathways();message(w('cleared'));
}
function savePortfolio(){
 if(!program){message(w('noProfile'));return;}
 try{
   const json=exportPortfolio(registry,program.generatedFor,events,{formative});
   const blob=new Blob([json],{type:'application/json'});const url=URL.createObjectURL(blob);
   const anchor=document.createElement('a');anchor.href=url;anchor.download='human-first-mon-parcours-v10.json';
   document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   message(w('saved'));
 }catch(e){message(w('invalid')+e.message);}
}
function applyImportedPortfolio(portfolio){
 // Build and validate the new plan before replacing the current in-memory state.
 // Preserve the currently selected UI language across imported portfolios.
 const p={...portfolio.profile,locale};
 const restoredProgram=buildJourney(registry,p);
 if(program&&!window.confirm(vaultWords[locale].replace))return false;
 closeFormative();closePractice();
 $('program-search').value='';$('program-filter').value='all';
 program=restoredProgram;
 events=portfolio.evidence;
 formative=portfolio.formative;
 locale=p.locale;
 $('adult').checked=true;$('stage').value=p.stage;$('age-band').value=p.ageBand;
 $('qualification').value=p.qualification;$('occupation').value=p.occupation;$('pace').value=String(p.minutesPerWeek);
 familiarity={...p.familiarity};
 renderPathways();$('path').value=p.pathId;renderPathways();
 $('result').hidden=false;renderLocale();renderProgram();
 if(aliasManifest){aliasManifest=null;$('alias-state').textContent='';}
 message(portfolio.migrated?w('migrated'):w('imported'));
 $('result').scrollIntoView({behavior:'auto',block:'start'});
 return true;
}
function encryptedPassphrase(){
 // No passphrase is written to storage, cookies, URLs, logs, or portfolio exports.
 const value=$('vault-passphrase').value;
 if(value.length<12||value.length>256||!value.trim())
   throw new TypeError(locale==='en'?'Use a unique passphrase of 12–256 characters.':'Choisis une phrase secrète unique de 12 à 256 caractères.');
 return value;
}
function downloadEncrypted(envelope){
 const link=document.createElement('a');
 const url=URL.createObjectURL(new Blob([envelope],{type:'application/json'}));
 link.href=url;link.download='human-first-parcours-prive.hfvault';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),5000);
}
let vaultBusy=false;
async function vaultAction(action){
 if(vaultBusy)return;
 vaultBusy=true;
 for(const id of ['vault-download','vault-save-device','vault-resume-device','vault-clear-device'])$(id).disabled=true;
 vaultStatus(vaultWords[locale][action==='clear'?'clearing':action==='device-resume'?'restoring':'encrypting']);
 try{
  if(action==='clear'){
   if(!window.confirm(vaultWords[locale].confirmDelete)){vaultStatus('');return;}
   await clearEncryptedDevice();
   vaultStatus(vaultWords[locale].deleted);
   return;
  }
  if((action==='download'||action==='device-save')&&!program)
   throw new Error(vaultWords[locale].mustCreate);
  const secret=encryptedPassphrase();
  if(action==='download'||action==='device-save'){
   if(secret!==$('vault-confirm').value)throw new Error(vaultWords[locale].mismatch);
   if(action==='device-save'&&await readEncryptedDevice()&&!window.confirm(vaultWords[locale].overwrite)){
    vaultStatus('');return;
   }
   const plain=exportPortfolio(registry,program.generatedFor,events,{formative});
   const cipher=await encryptPortfolio(plain,secret);
   if(action==='download'){downloadEncrypted(cipher);vaultStatus(vaultWords[locale].savedFile);}
   else{await saveEncryptedDevice(cipher);vaultStatus(vaultWords[locale].savedDevice);}
  }else{
   const encrypted=await readEncryptedDevice();
   if(!encrypted)throw new Error(vaultWords[locale].missing);
   const plain=await decryptPortfolio(encrypted,secret);
   const restored=restorePortablePortfolio(plain,registry,aliasManifest);
   if(applyImportedPortfolio(restored))vaultStatus(vaultWords[locale].restored);
   else vaultStatus('');
  }
 }catch(error){vaultStatus(vaultWords[locale].failed+String(error.message||error));}
 finally{
  $('vault-passphrase').value='';$('vault-confirm').value='';vaultBusy=false;
  for(const id of ['vault-download','vault-save-device','vault-resume-device','vault-clear-device'])$(id).disabled=false;
 }
}
async function importEncryptedVault(input){
 const file=input.files?.[0];input.value='';if(!file)return;
 if(vaultBusy)return;
 vaultBusy=true;
 vaultStatus(vaultWords[locale].restoring);
 try{
  if(file.size>VAULT_MAX_ENVELOPE)throw new Error('Encrypted backup exceeds size limit');
  const secret=encryptedPassphrase();
  const plain=await decryptPortfolio(await file.text(),secret);
  const restored=aliasManifest?migratePortfolio(plain,registry,aliasManifest):importPortfolio(plain,registry);
  if(applyImportedPortfolio(restored))vaultStatus(vaultWords[locale].restored);
  else vaultStatus('');
 }catch(error){vaultStatus(vaultWords[locale].failed+String(error.message||error));}
 finally{$('vault-passphrase').value='';$('vault-confirm').value='';vaultBusy=false;}
}

async function loadFile(input){
 const file=input.files?.[0];input.value='';if(!file)return;
 try{
   if(file.size>80_000)throw new TypeError('File exceeds 80 kB');
   const raw=await file.text();
   const portfolio=restorePortablePortfolio(raw,registry,aliasManifest);
   applyImportedPortfolio(portfolio);
 }catch(e){message(w('importError')+e.message);$('form-status').scrollIntoView({block:'nearest'});}
}
async function loadPack(input) {
 const file=input.files?.[0];input.value='';if(!file)return;
 try {
   if(file.size>150_000)throw new TypeError('Pack must be under 150 kB');
   let parsed;
   try{parsed=JSON.parse(await file.text());}catch{throw new TypeError('Invalid JSON pack');}
   // JSON only: never execute imported scripts or import arbitrary JavaScript URLs.
   const next=createRegistry([...installedPacks,...importedPacks,parsed]);
   activatePack(parsed,next,parsed.pathways?.[0]?.id);
   message(w('packAdded'));
 }catch(error){message(w('packFailed')+error.message);}
}
async function loadAliasFile(input){
 const file=input.files?.[0];input.value='';
 if(!file)return;
 try{
  if(file.size>30_000)throw new TypeError('Alias map exceeds 30 kB');
  const raw=JSON.parse(await file.text());
  // Aliases are not inferred and cannot execute code; only a manifest matching
  // the installed catalog is accepted. No learner answer is read at this step.
  normalizeAliasManifest(raw,registry);
  aliasManifest=raw;
  $('alias-state').textContent=locale==='en'?'Explicit mapping ready. The original portfolio is never modified.':'Table d’équivalences prête. Le portfolio d’origine reste intact.';
 }catch(error){
  aliasManifest=null;$('alias-state').textContent=String(error.message||error);
 }
}

$('profile-form').addEventListener('submit',e=>{e.preventDefault();generate();});
$('dashboard-continue').addEventListener('click',()=>{
 if(!program)return;
 const next=suggestPractice(program,events,{limit:1})[0];
 if(next)openPractice(next.skillId,next.pillar);
});
$('program-search').addEventListener('input',()=>{if(program)renderProgram();});
$('program-filter').addEventListener('change',()=>{if(program)renderProgram();});
$('practice-close').addEventListener('click',()=>{closePractice();$('dashboard-continue').focus({preventScroll:true});});
for(const [id,type] of [['practice-mark-explored','explored'],['practice-mark-practiced','practiced'],['practice-mark-review','review-later']]){
 $(id).addEventListener('click',()=>{if(activePractice)record(activePractice.skillId,type);});
}
$('practice-next').addEventListener('click',()=>{
 if(!activePractice||!program)return;
 const index=program.plan.findIndex(x=>x.skillId===activePractice.skillId);
 const next=program.plan[index+1];
 if(next)openPractice(next.skillId,choosePillar(next.skillId));
});
$('pack-file').addEventListener('change',e=>loadPack(e.target));
$('path').addEventListener('change',()=>{$('path-help').textContent=local(registry.paths.get($('path').value).summary);renderFamiliarity();});
$('stage').addEventListener('change',renderPathways);
$('clear').addEventListener('click',resetAll);
$('export').addEventListener('click',savePortfolio);
$('reset-progress').addEventListener('click',()=>{closeFormative();events=[];formative=[];renderProgram();});
$('import').addEventListener('change',e=>loadFile(e.target));
$('import-home').addEventListener('change',e=>loadFile(e.target));
$('aliases-file').addEventListener('change',e=>loadAliasFile(e.target));
$('vault-download').addEventListener('click',()=>vaultAction('download'));
$('vault-save-device').addEventListener('click',()=>vaultAction('device-save'));
$('vault-resume-device').addEventListener('click',()=>vaultAction('device-resume'));
$('vault-clear-device').addEventListener('click',()=>vaultAction('clear'));
$('vault-import').addEventListener('change',e=>importEncryptedVault(e.target));
$('vault-import-label').addEventListener('keydown',event=>{
 if(event.key==='Enter'||event.key===' '){event.preventDefault();$('vault-import').click();}
});
$('formative-close').addEventListener('click',closeFormative);
$('formative-reveal').addEventListener('click',revealFormative);
$('formative-save').addEventListener('click',saveFormative);
const remoteUi=mountEncryptedRemoteSync({
 lang:()=>locale,
 busy:()=>vaultBusy,
 createPlaintext:()=>program?exportPortfolio(registry,program.generatedFor,events,{formative}):null,
 restorePlaintext:plain=>applyImportedPortfolio(restorePortablePortfolio(plain,registry,aliasManifest)),
 getPassphrase:encryptedPassphrase,
 getConfirmation:()=>$('vault-confirm').value,
 clearPassphrases:()=>{$('vault-passphrase').value='';$('vault-confirm').value='';},
 downloadCipher:downloadEncrypted,
 confirm:message=>window.confirm(message)
});
$('lang').addEventListener('click',()=>{
  // Do not drop what the learner typed when translating the UI.
  familiarity=Object.fromEntries([...document.querySelectorAll('.familiarity-item select')].map(el=>[el.id.slice('familiarity-'.length),el.value]));
  locale=locale==='en'?'fr':'en';const url=new URL(location.href);url.searchParams.set('lang',locale);history.replaceState(null,'',url);
  renderLocale();
  relocalizeActiveFormative();
});
renderLocale();
void remoteUi.initialize();
