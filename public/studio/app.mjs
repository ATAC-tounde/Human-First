/** HUMAN FIRST Studio v0.9. Deliberately no fetch, external API, analytics or persistent browser storage. */
import {installedPacks} from '../journey/packs.mjs';
import {initialLanguage,syncLanguage} from '../language.mjs';
import {studioText,renderStudioLanguage} from './translations.mjs';
import {makeDocument,renamePack,editDraft,validateDocument,requestReview,approveDocument,
  reopenDraft,publishDocument,nextDraft,exportPack,exportStudioDocument,importForEditing,
  previewDocument,versionFormativeTask,REVIEW_CHECKS,LICENSES} from './model.mjs';
let locale=initialLanguage();
const tr=source=>studioText(source,locale);
const $=id=>document.getElementById(id);
const root=$('form-fields');
const text=(id,value)=>{$(id).textContent=tr(String(value??''));};
const create=(tag,className,content)=>{const n=document.createElement(tag);if(className)n.className=className;if(content!==undefined)n.textContent=tr(String(content));return n;};
const list=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const deep=x=>JSON.parse(JSON.stringify(x));
let doc=makeDocument(),selection={kind:'pack',id:null},dirty=false;
const confirmAction=message=>window.confirm(tr(message));
const promptAction=(message,defaultValue)=>window.prompt(tr(message),defaultValue);
function refreshStudioLanguage(){
 renderStudioLanguage(locale);
 const authorField=$('author');
 if(authorField.value==='Équipe pédagogique'&&locale==='en')authorField.value='Learning team';
 else if(authorField.value==='Learning team'&&locale==='fr')authorField.value='Équipe pédagogique';
}

const isAdult=()=>$('adult').checked;
const author=()=>$('author').value.trim();
function notice(message,error=false){const el=$('notice');el.textContent=tr(message);el.classList.toggle('is-error',error);}
function tryDo(action){try{if(!isAdult())throw new Error('Confirme avoir 18 ans ou plus avant d’utiliser le Studio.');Promise.resolve(action()).catch(e=>notice(e.message||'Erreur de validation.',true));}catch(e){notice(e.message||'Erreur de validation.',true);}}
function download(name,body){const blob=new Blob([body],{type:'application/json;charset=utf-8'});const uri=URL.createObjectURL(blob);const link=create('a');link.href=uri;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(uri),2000);}
function labelFor(n,caption,hint=''){const wrap=create('div','field');wrap.classList.toggle('wide',n.wide===true);const label=create('label',null,caption);label.htmlFor='f-'+n.name;wrap.append(label);
 const el=create(n.multiline?'textarea':n.options?'select':'input');el.id='f-'+n.name;el.name=n.name;
 if(el.tagName==='INPUT'){el.type='text';el.maxLength=6000;}else if(el.tagName==='TEXTAREA'){el.maxLength=n.name==='skill.assessment.criteria'?22000:6000;el.rows=n.name==='skill.assessment.criteria'?8:3;}
 if(n.options){for(const choice of n.options){const option=create('option',null,choice);option.value=choice;el.append(option);}}
 el.value=String(n.value??'');el.disabled=doc.status!=='draft'||n.name==='skill.assessment.version';el.addEventListener('input',()=>{dirty=true;notice('Modifications non appliquées - sélectionner « Appliquer » avant de changer d’élément.');});
 wrap.append(el);if(hint)wrap.append(create('small',null,hint));return wrap;}
function field(name,label,value,{multiline=false,wide=false,options=null,hint=''}={}){return labelFor({name,value,multiline,wide,options},label,hint);}
function headline(title){return create('h3','subheading',title);}
function bilingualFields(base,label,object,{multiline=false}={}){
 return [field(base+'.fr',label+' · FR',object?.fr??'',{multiline}),field(base+'.en',label+' · EN',object?.en??'',{multiline})];
}
function editorFields(){
 const fragment=document.createDocumentFragment(),grid=create('div','fields');
 const append=(...fields)=>fields.forEach(f=>grid.append(f));
 const kind=selection.kind;
 if(kind==='pack'){
  text('editor-kind','STRUCTURE · PROVENANCE');text('editor-heading','Paramètres du référentiel');
  text('editor-help','L’identifiant namespacé et la version sont indispensables pour la portabilité des contenus.');
  append(field('pack.id','Identifiant du pack',doc.pack.id,{hint:'2 à 40 caractères : lettres minuscules, chiffres, tirets.'}),field('pack.version','Version SemVer',doc.pack.version,{hint:'Exemple : 1.0.0'}));
  append(...bilingualFields('pack.title','Nom du référentiel',doc.pack.title));
  append(headline('Auteur, droits et provenance'));
  append(field('meta.author','Auteur déclaré',doc.meta.author),field('meta.license','Licence de distribution',doc.meta.license,{options:LICENSES}));
  append(field('meta.sourceUrl','Source HTTPS ou URL de référence',doc.meta.sourceUrl,{wide:true}),field('meta.sourceNote','Méthodologie et provenance',doc.meta.sourceNote,{wide:true,multiline:true}));
  append(...bilingualFields('meta.description','Description pédagogique',doc.meta.description,{multiline:true}));
  append(headline('Contextes indicatifs (jamais un filtre d’aptitudes)'));
  append(field('meta.territory','Territoire / système éducatif',doc.meta.territory),field('meta.agePolicy','Public de cette démo',doc.meta.agePolicy,{options:['18+'],hint:'Les mineurs nécessitent un volet séparé.'}));
  append(field('meta.occupationTags','Métiers / domaines (virgules)',doc.meta.occupationTags.join(', '),{wide:true}),field('meta.qualificationTags','Niveaux / qualifications (virgules)',doc.meta.qualificationTags.join(', '),{wide:true}));
  append(field('meta.editorialNotes','Notes de rédaction (ne figurent pas dans le pack exporté)',doc.meta.editorialNotes,{multiline:true,wide:true}));
 }else if(kind==='skill'){
  const s=doc.pack.competencies.find(x=>x.id===selection.id);
  if(!s){selection={kind:'pack',id:null};editorFields();return;}
  text('editor-kind','UNITÉ · SAVOIR / SAVOIR-FAIRE');text('editor-heading','Éditer une compétence');text('editor-help','Décris un résultat observable et une pratique autonome dans chacun des quatre piliers.');
  append(field('skill.id','Identifiant global',s.id,{wide:true,hint:'Préfixe identique au pack, ex. monpack.analyser-besoin'}));
  append(...bilingualFields('skill.title','Nom de la compétence',s.title));
  append(...bilingualFields('skill.outcome','Résultat observable',s.outcome,{multiline:true}));
  append(field('skill.tags','Mots-clés (virgules)',s.tags.join(', '),{wide:true}),field('skill.requires','Prérequis : identifiants séparés par virgules',s.requires.join(', '),{wide:true,hint:'Exemple : core.evidence, study.reading. Les cycles sont interdits.'}));
  append(headline('Quatre modalités pédagogiques'));
  for(const pillar of ['think','focus','learn','decide']){append(headline(pillar.toUpperCase()));append(...bilingualFields('skill.activities.'+pillar,'Activité '+pillar,s.activities[pillar],{multiline:true}));}
  append(headline('Évaluation formative facultative (locale, non certifiante)'));
  append(field('skill.assessment.version','Version automatique de la tâche',s.assessment?.version??'Nouvelle tâche : 1.0.0',{wide:true,hint:'La version est automatiquement incrémentée dès qu’une situation, une question ou une grille existante change. Version indépendante du pack.'}));
  append(...bilingualFields('skill.assessment.scenario','Situation de départ',s.assessment?.scenario??{fr:'',en:''},{multiline:true}));
  append(...bilingualFields('skill.assessment.question','Question à résoudre sans aide',s.assessment?.question??{fr:'',en:''},{multiline:true}));
  append(...bilingualFields('skill.assessment.transfer','Nouveau cas de transfert',s.assessment?.transfer??{fr:'',en:''},{multiline:true}));
  append(field('skill.assessment.criteria','Critères qualitatifs (tableau JSON)',s.assessment?.criteria?JSON.stringify(s.assessment.criteria,null,2):'',{
   multiline:true,wide:true,hint:'Facultatif. Pour créer une activité, renseigne 3 textes FR/EN et 2 à 6 critères au format JSON : [{"id":"preuve","label":{"fr":"Une preuve vérifiable","en":"A verifiable piece of evidence"},"guidance":{"fr":"...","en":"..."}}, …]. Aucun score automatique.'
  }));
  append(headline('Exemple contextuel facultatif'));
  append(...bilingualFields('skill.contexts.work','Contexte professionnel',s.contexts?.work??{fr:'',en:''},{multiline:true}));
 }else{
  const p=doc.pack.pathways.find(x=>x.id===selection.id);
  if(!p){selection={kind:'pack',id:null};editorFields();return;}
  text('editor-kind','PROGRAMME · OBJECTIFS');text('editor-heading','Éditer un parcours');text('editor-help','Une liste d’objectifs définit un parcours ; les prérequis sont automatiquement expliqués.');
  append(field('path.id','Identifiant global du parcours',p.id,{wide:true}));
  append(...bilingualFields('path.title','Titre du parcours',p.title));
  append(...bilingualFields('path.summary','Objectif et intention',p.summary,{multiline:true}));
  append(field('path.competencyIds','Compétences cibles (identifiants séparés par virgules)',p.competencyIds.join(', '),{wide:true}),field('path.audiences','Situations contextuelles (virgules)',p.audiences.join(', '),{wide:true,hint:'Exemples : work, higher-education, transition, personal.'}));
 }
 fragment.append(grid);root.replaceChildren(fragment);
 $('apply').hidden=doc.status!=='draft';$('delete-item').hidden=kind==='pack'||doc.status!=='draft';
 dirty=false;
}
function values(){const result={};for(const el of root.querySelectorAll('input[name],textarea[name],select[name]'))result[el.name]=el.value.trim();return result;}
function applyForm(){
 if(doc.status!=='draft')throw new Error('Créer une révision pour modifier un document publié ou approuvé.');
 const form=values();const kind=selection.kind;
 if(kind==='pack'){
  let proposed=doc;const newId=form['pack.id'];if(newId!==doc.pack.id)proposed=renamePack(doc,newId,author());
  const pack=deep(proposed.pack);pack.version=form['pack.version'];pack.title={fr:form['pack.title.fr'],en:form['pack.title.en']};
  const meta=deep(proposed.meta);
  for(const x of ['author','license','sourceUrl','sourceNote','territory','agePolicy','editorialNotes'])meta[x]=form['meta.'+x];
  meta.description={fr:form['meta.description.fr'],en:form['meta.description.en']};
  meta.occupationTags=list(form['meta.occupationTags']);meta.qualificationTags=list(form['meta.qualificationTags']);
  doc=editDraft(proposed,{pack,meta},author());
 }else if(kind==='skill'){
  const pack=deep(doc.pack),skill=pack.competencies.find(x=>x.id===selection.id);
  const oldId=skill.id,nextId=form['skill.id'];
  skill.id=nextId;skill.title={fr:form['skill.title.fr'],en:form['skill.title.en']};
  skill.outcome={fr:form['skill.outcome.fr'],en:form['skill.outcome.en']};
  skill.tags=list(form['skill.tags']);skill.requires=list(form['skill.requires']);
  for(const pillar of ['think','focus','learn','decide'])skill.activities[pillar]={fr:form['skill.activities.'+pillar+'.fr'],en:form['skill.activities.'+pillar+'.en']};
  skill.contexts??={};const work={fr:form['skill.contexts.work.fr'],en:form['skill.contexts.work.en']};
  if(work.fr&&work.en)skill.contexts.work=work;else delete skill.contexts.work;
  const scenario={fr:form['skill.assessment.scenario.fr'],en:form['skill.assessment.scenario.en']};
  const question={fr:form['skill.assessment.question.fr'],en:form['skill.assessment.question.en']};
  const transfer={fr:form['skill.assessment.transfer.fr'],en:form['skill.assessment.transfer.en']};
  const rawCriteria=form['skill.assessment.criteria'];
  if(!scenario.fr&&!scenario.en&&!question.fr&&!question.en&&!transfer.fr&&!transfer.en&&!rawCriteria)delete skill.assessment;
  else{
   let criteria;
   try{criteria=rawCriteria?JSON.parse(rawCriteria):[];}catch{throw new TypeError('Critères : JSON invalide.');}
   skill.assessment=versionFormativeTask(skill.assessment,{schema:'hf.formative.task.v1',scenario,question,transfer,criteria});
  }
  if(oldId!==nextId){
   for(const s of pack.competencies)s.requires=s.requires.map(x=>x===oldId?nextId:x);
   for(const path of pack.pathways)path.competencyIds=path.competencyIds.map(x=>x===oldId?nextId:x);
  }
  doc=editDraft(doc,{pack},author());selection.id=nextId;
 }else{
  const pack=deep(doc.pack),path=pack.pathways.find(x=>x.id===selection.id);
  path.id=form['path.id'];path.title={fr:form['path.title.fr'],en:form['path.title.en']};
  path.summary={fr:form['path.summary.fr'],en:form['path.summary.en']};
  path.competencyIds=list(form['path.competencyIds']);path.audiences=list(form['path.audiences']);
  doc=editDraft(doc,{pack},author());selection.id=path.id;
 }
 draw();notice('Modifications appliquées au brouillon. Contrôle qualité recommandé.');
}
function abandonDirty(){return !dirty||confirmAction('Des modifications ne sont pas appliquées. Les abandonner ?');}
function choose(kind,id=null){if(!abandonDirty())return;selection={kind,id};draw();}
function autoName(prefix,collection){let i=1;while(collection.some(x=>x.id===`${prefix}-${i}`))i++;return `${prefix}-${i}`;}
function addSkill(){if(!abandonDirty())return;const pack=deep(doc.pack);const name=autoName(pack.id+'.competence',pack.competencies);
 pack.competencies.push({id:name,title:{fr:'Nouvelle compétence à définir',en:'New competency to define'},outcome:{fr:'Décrire un résultat observable dans cette compétence. ',en:'Describe an observable outcome for this new competency.'},tags:['transversal'],requires:[],activities:Object.fromEntries(['think','focus','learn','decide'].map(k=>[k,{fr:'Décrire une activité pratique et autonome pour ce pilier.',en:'Describe a practical self-directed exercise for this pillar.'}])),contexts:{}});
 doc=editDraft(doc,{pack},author());selection={kind:'skill',id:name};draw();notice('Compétence ajoutée. Personnalise ses contenus.');
}
function addPath(){if(!abandonDirty())return;const pack=deep(doc.pack);const name=autoName(pack.id+'.parcours',pack.pathways);
 pack.pathways.push({id:name,title:{fr:'Nouveau parcours pédagogique',en:'New educational pathway'},summary:{fr:'Préciser les compétences que l’apprenant pourra mobiliser.',en:'Specify the competencies a learner will put into practice.'},competencyIds:[pack.competencies[0].id],audiences:['work']});
 doc=editDraft(doc,{pack},author());selection={kind:'path',id:name};draw();notice('Parcours ajouté. Associe les compétences cibles.');
}
function deleteSelected(){const kind=selection.kind;if(kind==='pack')return;
 if(!confirmAction('Supprimer cet élément du brouillon ? Cette action ne peut être annulée.'))return;
 const pack=deep(doc.pack);
 if(kind==='skill'){
  if(pack.competencies.length===1)throw new Error('Le référentiel doit conserver au moins une compétence.');
  pack.competencies=pack.competencies.filter(x=>x.id!==selection.id);
  pack.competencies.forEach(s=>s.requires=s.requires.filter(x=>x!==selection.id));
  pack.pathways.forEach(p=>p.competencyIds=p.competencyIds.filter(x=>x!==selection.id));
  pack.pathways=pack.pathways.filter(p=>p.competencyIds.length);
 }else pack.pathways=pack.pathways.filter(x=>x.id!==selection.id);
 doc=editDraft(doc,{pack},author());selection={kind:'pack',id:null};draw();notice('Élément supprimé. Les références devenues invalides ont été retirées.');
}
function drawTree(){
 text('status-tag',({draft:'BROUILLON','in-review':'EN REVUE',approved:'APPROUVÉ',published:'EXPORT PUBLIÉ'})[doc.status]||doc.status);
 text('version-label','v'+doc.pack.version);
 $('select-pack').classList.toggle('selected',selection.kind==='pack');
 function fill(container,items,kind){container.replaceChildren();for(const item of items){const b=create('button','node',item.title?.[locale]||item.title?.fr||item.id);b.type='button';b.title=item.id;b.classList.toggle('selected',selection.kind===kind&&selection.id===item.id);b.addEventListener('click',()=>choose(kind,item.id));container.append(b);}}
 fill($('skills'),doc.pack.competencies,'skill');fill($('paths'),doc.pack.pathways,'path');
 $('add-skill').disabled=doc.status!=='draft';$('add-path').disabled=doc.status!=='draft';
 $('request-review').hidden=doc.status!=='draft';$('approval-panel').hidden=doc.status!=='in-review';
 $('reopen').hidden=!['in-review','approved'].includes(doc.status);
 $('publish').hidden=doc.status!=='approved';$('next-release').hidden=doc.status!=='published';
 const box=$('audit');box.replaceChildren();
 for(const event of doc.audit.slice().reverse().slice(0,18))box.append(create('li',null,`${event.event} · ${event.actor} · ${new Date(event.at).toLocaleDateString(locale==='en'?'en-GB':'fr-FR')}`));
}
function showValidation(){const r=validateDocument(doc,installedPacks);
 text('validation-summary',r.ok?`Structure valide : ${r.stats.competencies} compétence(s), ${r.stats.pathways} parcours. Revue éditoriale toujours nécessaire.`:`${r.errors.length} erreur(s) structurelle(s) détectée(s).`);
 const e=$('validation-errors');e.replaceChildren();for(const item of [...r.errors.map(x=>'✖ '+x),...r.warnings.map(x=>'⚠ '+x)])e.append(create('p',null,item));return r;
}
function draw(){drawTree();editorFields();showValidation();text('quality-title','Vérification humaine');refreshStudioLanguage();}
function checkUnsaved(){if(dirty)applyForm();}
function renderReviewChecks(){const c=$('review-checks');const labels={accuracy:'Exactitude des contenus',pedagogy:'Pertinence pédagogique',accessibility:'Accessibilité et clarté',licensing:'Droits / provenance',privacy:'Confidentialité',translation:'Traductions FR / EN'};
 for(const key of REVIEW_CHECKS){const label=create('label');const ch=create('input');ch.type='checkbox';ch.value=key;ch.name='review-check';label.append(ch,document.createTextNode(' '+labels[key]));c.append(label);}}
function renderPreview(){const result=previewDocument(doc,installedPacks,locale);const box=$('preview-body');box.replaceChildren();box.append(create('p',null,`${result.pathway.title} · ${result.plan.length} compétence(s) · temps indicatif ${result.workload.totalMinutesIndicative} min`));
 for(const x of result.plan){const card=create('article','preview-item');card.append(create('h3',null,`${x.order}. ${x.title}`),create('p',null,x.outcome),create('p',null,`${x.explanation} / ${x.pillars.think}`));box.append(card);} $('preview-panel').hidden=false;$('preview-title').focus();$('preview-panel').scrollIntoView({behavior:'smooth',block:'start'});}
function events(){
 $('studio-language-switch').addEventListener('click',()=>{
  locale=locale==='en'?'fr':'en';
  const newUrl=new URL(location.href);newUrl.searchParams.set('lang',locale);
  history.replaceState(null,'',newUrl);
  // Only UI text nodes change. Unsaved FR/EN competency drafts are preserved.
  refreshStudioLanguage();
 });
 $('editor-form').addEventListener('submit',e=>{e.preventDefault();tryDo(applyForm)});
 $('select-pack').addEventListener('click',()=>choose('pack'));
 $('add-skill').addEventListener('click',()=>tryDo(addSkill));$('add-path').addEventListener('click',()=>tryDo(addPath));
 $('delete-item').addEventListener('click',()=>tryDo(deleteSelected));
 $('validate').addEventListener('click',()=>tryDo(()=>{checkUnsaved();const result=showValidation();notice(result.ok?'Contrôles de structure réussis. Revue humaine requise.':result.errors.join(' · '),!result.ok);}));
 $('preview').addEventListener('click',()=>tryDo(()=>{checkUnsaved();renderPreview();notice('Aperçu calculé localement, sans envoi des données.');}));
 $('close-preview').addEventListener('click',()=>{$('preview-panel').hidden=true;});
 $('save-draft').addEventListener('click',()=>tryDo(()=>{checkUnsaved();download(`${doc.pack.id}-studio-${doc.pack.version}.json`,exportStudioDocument(doc));notice('Document Studio exporté localement. Conserve-le en lieu sûr.');}));
 $('new').addEventListener('click',()=>tryDo(()=>{if(!confirmAction('Créer un nouveau référentiel ? Sauvegarde d’abord tout travail non exporté.'))return;
  const id=promptAction('Identifiant court du nouveau pack (lettres minuscules et tirets)','mon-referentiel');if(id===null)return;doc=makeDocument({id:id.trim(),author:author()});selection={kind:'pack',id:null};draw();notice('Nouveau référentiel créé, dans cet onglet uniquement.');}));
 $('import').addEventListener('change',()=>tryDo(async()=>{const file=$('import').files?.[0];if(!file)return;if(file.size>500_000)throw new Error('Limite : 500 ko.');
  if(!confirmAction('Importer un document comme brouillon ? Le travail courant non exporté sera remplacé.'))return;
  const candidate=importForEditing(await file.text(),{author:author()});const report=validateDocument(candidate,installedPacks);
  doc=candidate;selection={kind:'pack',id:null};draw();notice(report.ok?'Import réussi. Contenu non approuvé : vérifier les sources et licences.':'Brouillon importé avec erreurs à corriger : '+report.errors.join(' | '),!report.ok);
  $('import').value='';}));
 $('request-review').addEventListener('click',()=>tryDo(()=>{checkUnsaved();doc=requestReview(doc,installedPacks,author());draw();for(const checkbox of document.querySelectorAll('input[name="review-check"]'))checkbox.checked=false;notice('Statut « en revue ».  Confirme les contrôles et désigne un relecteur distinct.');}));
 $('approve').addEventListener('click',()=>tryDo(()=>{const checks=Array.from(document.querySelectorAll('input[name="review-check"]:checked'),x=>x.value);
  doc=approveDocument(doc,{reviewer:$('reviewer').value,checks},author());draw();notice('Approbation éditoriale déclarée localement. Il ne s’agit pas d’une signature vérifiée.');}));
 $('reopen').addEventListener('click',()=>tryDo(()=>{doc=reopenDraft(doc,author());draw();notice('Revenu au brouillon. Une nouvelle revue sera requise.');}));
 $('publish').addEventListener('click',()=>tryDo(()=>{doc=publishDocument(doc,installedPacks,author());draw();download(`${doc.pack.id}-${doc.pack.version}.json`,exportPack(doc,installedPacks));notice('Pack JSON exporté. Il est utilisable dans MON PARCOURS, sans publication sur un catalogue public.');}));
 $('make-revision').addEventListener('click',()=>tryDo(()=>{doc=nextDraft(doc,$('next-version').value.trim(),author());selection={kind:'pack',id:null};draw();notice('Nouveau brouillon versionné créé. Archive le fichier de la version publiée séparément.');}));
 }
renderReviewChecks();events();draw();notice('Studio prêt. Confirme ton âge pour commencer. Aucun contenu n’a été envoyé au serveur.');