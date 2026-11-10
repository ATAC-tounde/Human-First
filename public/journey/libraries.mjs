/**
 * Optional, original demonstration libraries. They are NOT certified knowledge,
 * an exhaustive reference, professional advice or a third-party feed.
 * Every competency has an explicit bilingual goal and four practice activities.
 * Nothing is fetched or stored when these packs are selected.
 */
const pair=(fr,en)=>({fr,en});
const skill=(pack,id,title,outcome,tags,requires,steps,contexts={})=>({
 id:pack+'.'+id,title:pair(...title),outcome:pair(...outcome),tags,requires,
 activities:Object.fromEntries(['think','focus','learn','decide'].map((pillar,index)=>[pillar,pair(...steps[index])])),
 contexts
});
const pathway=(pack,id,title,summary,competencyIds,audiences)=>({
 id:pack+'.'+id,title:pair(...title),summary:pair(...summary),competencyIds,audiences
});
const library=(pack,summary)=>({
 id:pack.id,pack,summary:pair(...summary),audience:'18+',origin:'human-first-demonstration'
});

export const starterLibraries=Object.freeze([
 library({
  id:'digital',version:'1.0.0',title:pair('Vérifier les informations numériques','Check digital information'),
  competencies:[
   skill('digital','sources',['Repérer une source vérifiable','Identify a verifiable source'],
    ['Retrouver l’origine d’une affirmation et la distinguer d’une opinion.','Trace a claim to its origin and distinguish it from an opinion.'],
    ['information','sources'],['core.evidence'],[
     ['Identifier qui affirme quoi et quelles preuves sont proposées.','Identify who claims what and which evidence is offered.'],
     ['Examiner la date, l’auteur et le contexte de deux sources.','Examine the date, author and context of two sources.'],
     ['Restituer de mémoire trois questions pour vérifier une source.','Recall three questions for checking a source from memory.'],
     ['Choisir ce qu’il faut vérifier avant de relayer une publication.','Decide what to verify before sharing a post.']
    ],{personal:pair('Vérifier une information reçue dans un groupe de discussion.','Check information received in a group chat.')}),
   skill('digital','privacy',['Limiter les données partagées','Limit personal data sharing'],
    ['Distinguer les informations nécessaires des données facultatives.','Distinguish necessary information from optional data.'],
    ['numerique','confidentialite'],['life.digital'],[
     ['Questionner l’utilité des données demandées par un formulaire.','Question why a form asks for particular data.'],
     ['Relire les autorisations d’une application fictive.','Review the permissions of a fictional app.'],
     ['Rappeler trois règles simples de minimisation des données.','Recall three simple data-minimization habits.'],
     ['Choisir une option moins intrusive dans un scénario réaliste.','Choose a less intrusive option in a realistic scenario.']
    ],{work:pair('Examiner un formulaire professionnel sans données réelles.','Review a workplace form without using real data.')}),
   skill('digital','ai',['Utiliser une réponse IA avec recul','Question an AI-generated answer'],
    ['Définir ce qui exige une vérification humaine indépendante.','Identify what requires independent human checking.'],
    ['ia','esprit-critique'],['digital.sources'],[
     ['Distinguer une réponse convaincante d’une réponse démontrée.','Distinguish a convincing answer from a supported answer.'],
     ['Rechercher une source primaire pour confirmer un exemple fictif.','Seek a primary source to check a fictional example.'],
     ['Énoncer les limites d’une réponse générée sans consulter de notes.','Recall limitations of a generated response without notes.'],
     ['Décider quand ne pas utiliser une réponse générée telle quelle.','Decide when not to use a generated answer as-is.']
    ])
  ],
  pathways:[pathway('digital','autonomy',['Autonomie numérique','Digital autonomy'],
   ['Examiner les informations, préserver ses données et contrôler les réponses automatiques.','Check information, protect data and verify automated responses.'],
   ['digital.sources','digital.privacy','digital.ai'],['personal','work','transition'])]
 },['Trois compétences concrètes pour vérifier, protéger et décider en ligne.','Three practical skills for checking, protecting and deciding online.']),
 library({
  id:'data-literacy',version:'1.0.0',title:pair('Lire et expliquer les données','Read and explain data'),
  competencies:[
   skill('data-literacy','question',['Formuler une question observable','Frame a measurable question'],
    ['Préciser ce qui est compté, sur quelle période et pour qui.','Clarify what is counted, for which period and for whom.'],
    ['donnees','mesure'],['core.data'],[
     ['Identifier les termes ambigus dans une statistique.','Identify ambiguous terms in a statistic.'],
     ['Décrire l’unité et la population d’un tableau fictif.','Describe units and population in a fictional table.'],
     ['Restituer les vérifications à faire avant de comparer deux valeurs.','Recall checks to make before comparing two values.'],
     ['Choisir un indicateur cohérent avec une question concrète.','Choose a measure that fits a practical question.']
    ]),
   skill('data-literacy','comparison',['Comparer des chiffres avec prudence','Compare numbers carefully'],
    ['Identifier un changement de dénominateur ou de période.','Spot a change in denominator or period.'],
    ['comparaison','graphique'],['data-literacy.question'],[
     ['Questionner deux pourcentages qui n’ont pas la même base.','Question two percentages using different denominators.'],
     ['Comparer deux exemples fictifs à périmètre identique.','Compare two fictional examples with matching scope.'],
     ['Expliquer de mémoire pourquoi une moyenne peut tromper.','Explain from memory why an average may mislead.'],
     ['Choisir une présentation qui signale les limites.','Choose a presentation that discloses limitations.']
    ],{work:pair('Comparer deux rapports fictifs de suivi qualité.','Compare two fictional quality-tracking reports.')}),
   skill('data-literacy','uncertainty',['Communiquer une incertitude','Communicate uncertainty'],
    ['Énoncer ce que les données permettent ou non de conclure.','State what the data can and cannot establish.'],
    ['incertitude','evidence'],['core.causality','data-literacy.comparison'],[
     ['Distinguer association et explication causale.','Distinguish association from causal explanation.'],
     ['Rédiger une conclusion mesurée pour un jeu fictif.','Write a measured conclusion for a fictional dataset.'],
     ['Retrouver les principales limites sans relire le graphique.','Recall key limitations without re-reading the chart.'],
     ['Décider quelles questions complémentaires poser.','Decide what follow-up questions to ask.']
    ])
  ],
  pathways:[pathway('data-literacy','everyday',['Comprendre les chiffres du quotidien','Understand everyday numbers'],
   ['Poser une bonne question, comparer correctement et expliquer les limites.','Ask good questions, make fair comparisons and explain limitations.'],
   ['data-literacy.question','data-literacy.comparison','data-literacy.uncertainty'],['higher-education','work','personal'])]
 },['Une initiation pratique aux tableaux, aux proportions et à l’incertitude.','Practical introduction to tables, proportions and uncertainty.']),
 library({
  id:'health-literacy',version:'1.0.0',title:pair('Évaluer une information de santé','Evaluate health information'),
  competencies:[
   skill('health-literacy','claim',['Examiner une affirmation de santé','Evaluate a health claim'],
    ['Repérer une source crédible et les limites d’une affirmation générale.','Identify a credible source and the limits of a general claim.'],
    ['sante','information'],['core.evidence'],[
     ['Séparer témoignage, publicité et information vérifiable.','Separate testimonials, promotion and verifiable information.'],
     ['Comparer la date et la qualité de deux sources fictives.','Compare the date and quality of two fictional sources.'],
     ['Retrouver les questions de contrôle sans consulter ses notes.','Recall verification questions without notes.'],
     ['Choisir de demander un avis professionnel pour une situation personnelle.','Choose to consult a professional for a personal health situation.']
    ]),
   skill('health-literacy','questions',['Préparer une consultation','Prepare for a health appointment'],
    ['Organiser des questions sans établir de diagnostic personnel.','Organize questions without self-diagnosing.'],
    ['communication','questions'],['health-literacy.claim'],[
     ['Identifier les informations pertinentes à clarifier avec un professionnel.','Identify information to clarify with a professional.'],
     ['Classer trois questions générales dans un scénario fictif.','Order three general questions in a fictional case.'],
     ['Restituer les points à demander lors d’une consultation.','Recall points to ask during an appointment.'],
     ['Décider de conserver la décision médicale auprès du professionnel.','Leave medical decisions to the qualified professional.']
    ]),
   skill('health-literacy','limits',['Reconnaître les limites d’un conseil générique','Recognize limits of generic advice'],
    ['Expliquer pourquoi une réponse générique ne remplace pas un avis médical adapté.','Explain why generic advice cannot replace individualized medical care.'],
    ['prudence','decision'],['health-literacy.questions'],[
     ['Repérer les informations manquantes dans un conseil fictif.','Identify missing information in a fictional recommendation.'],
     ['Reformuler un conseil non personnalisé avec prudence.','Rewrite non-personalized advice with appropriate caution.'],
     ['Restituer les raisons de demander un avis humain qualifié.','Recall reasons to seek qualified human advice.'],
     ['Choisir un recours professionnel plutôt qu’une conclusion hâtive.','Choose professional guidance over an unsupported conclusion.']
    ])
  ],
  pathways:[pathway('health-literacy','information',['Comprendre les informations en santé','Understand health information'],
   ['Vérifier des informations générales et préparer des échanges avec les professionnels, sans diagnostic.','Check general information and prepare professional discussions, without diagnosis.'],
   ['health-literacy.claim','health-literacy.questions','health-literacy.limits'],['personal','work','higher-education'])]
 },['Esprit critique et communication pour des informations générales de santé, sans conseil médical personnalisé.','Critical reading and communication about general health information; not individualized medical advice.']),
 library({
  id:'projects',version:'1.0.0',title:pair('Organiser un projet concret','Organize a practical project'),
  competencies:[
   skill('projects','goal',['Clarifier un résultat attendu','Clarify an expected outcome'],
    ['Transformer une idée vague en objectif vérifiable.','Turn a vague idea into a verifiable goal.'],
    ['projet','objectif'],['work.requirements'],[
     ['Formuler le problème avant de proposer une solution.','Describe the problem before choosing a solution.'],
     ['Transformer un besoin fictif en critères observables.','Turn a fictional need into observable criteria.'],
     ['Restituer de mémoire les critères de réussite.','Recall success criteria from memory.'],
     ['Choisir une première étape réaliste.','Choose a realistic first step.']
    ]),
   skill('projects','plan',['Découper le travail en étapes','Break work into steps'],
    ['Distinguer priorités, dépendances et ressources.','Distinguish priorities, dependencies and resources.'],
    ['organisation','planning'],['projects.goal'],[
     ['Identifier les prérequis d’une tâche.','Identify task prerequisites.'],
     ['Classer des étapes fictives par dépendances.','Arrange fictional steps by dependencies.'],
     ['Retrouver les jalons essentiels sans la liste.','Recall key milestones without the list.'],
     ['Choisir un ordre de travail et expliquer ses compromis.','Choose a task order and explain trade-offs.']
    ]),
   skill('projects','improve',['Relire et améliorer une démarche','Review and improve an approach'],
    ['Comparer un résultat aux critères initiaux et proposer un ajustement.','Compare outcomes with initial criteria and suggest an adjustment.'],
    ['amelioration','retour'],['projects.plan'],[
     ['Questionner les écarts plutôt que chercher un responsable.','Investigate gaps rather than assign blame.'],
     ['Observer un résultat fictif sans masquer ses limites.','Review a fictional result without hiding limitations.'],
     ['Se rappeler un enseignement transférable au projet suivant.','Recall a transferable lesson for the next project.'],
     ['Décider quel ajustement essayer et comment le vérifier.','Choose an adjustment to try and how to verify it.']
    ])
  ],
  pathways:[pathway('projects','delivery',['Conduire un petit projet','Deliver a small project'],
   ['Clarifier un objectif, organiser les étapes et apprendre de l’expérience.','Clarify a goal, organize steps and learn from experience.'],
   ['projects.goal','projects.plan','projects.improve'],['work','transition','personal','higher-education'])]
 },['Une méthode simple pour passer d’une intention à des actions vérifiables.','A simple approach for turning intentions into verifiable action.'])
]);


/** Shared FR/EN verbs and status labels: JOURNEY and Studio show identical actions. */
export const libraryActions=Object.freeze({
 fr:Object.freeze({load:'Charger la bibliothèque',loaded:'Bibliothèque chargée',use:'Utiliser comme modèle',current:'Modèle ouvert',skill:'compétence',skills:'compétences',path:'parcours',paths:'parcours',demo:'Contenus de démonstration, non certifiés',loadedNotice:'Bibliothèque chargée dans cet onglet : ',studioNotice:'Modèle chargé comme brouillon : ',replace:'Remplacer le brouillon actuel par ce modèle ? Exporte auparavant toute modification à conserver.'}),
 en:Object.freeze({load:'Load library',loaded:'Library loaded',use:'Use as a template',current:'Template open',skill:'skill',skills:'skills',path:'pathway',paths:'pathways',demo:'Demonstration content, not certified',loadedNotice:'Library loaded in this tab: ',studioNotice:'Template loaded as a draft: ',replace:'Replace the current draft with this template? Export any changes you want to keep first.'})
});
