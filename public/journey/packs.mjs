/** Example content packs: new domains, certificates or professions are ADDED as data, not hard-coded into the engine. */
const pair=(fr,en)=>({fr,en});
const skill=(pack,id,title,outcome,tags,requires,steps,contexts={})=>({
  id:`${pack}.${id}`,title:pair(...title),outcome:pair(...outcome),tags,requires,
  activities:Object.fromEntries(['think','focus','learn','decide'].map((p,i)=>[p,pair(...steps[i])])),contexts
});
const path=(pack,id,title,summary,competencyIds,audiences=[])=>({id:`${pack}.${id}`,title:pair(...title),summary:pair(...summary),competencyIds,audiences});

export const corePack={
  id:'core',version:'1.0.0',title:pair('Fondamentaux du raisonnement','Reasoning foundations'),
  competencies:[
    skill('core','evidence',
      ['Vérifier une affirmation','Evaluate a claim'],
      ['Distinguer observation, interprétation et justification.','Distinguish observation, interpretation, and evidence.'],
      ['critical-thinking','information'],[],[
        ['Relève une affirmation, puis indique ce qui la rend vérifiable.','Find a claim and identify what would make it testable.'],
        ['Pendant la lecture d’une phrase, sépare mentalement fait et jugement.','While reading a sentence, separate observations from judgments.'],
        ['Sans support, restitue trois questions utiles pour vérifier une source.','Without notes, recall three useful questions for verifying a source.'],
        ['Avant de relayer une information, nomme une preuve encore manquante.','Before forwarding a claim, identify one missing piece of evidence.']
      ],{
        'higher-education':pair('Applique cette méthode à l’introduction d’un article scientifique.','Apply this method to a scientific paper introduction.'),
        work:pair('Applique-la à une note de réunion ou à un rapport professionnel.','Apply it to a meeting note or a workplace report.')
      }),
    skill('core','causality',
      ['Examiner une relation de cause à effet','Examine cause and effect'],
      ['Chercher d’autres explications à une corrélation.','Consider alternative explanations for a correlation.'],
      ['reasoning','science'],['core.evidence'],[
        ['Imagine une troisième variable qui pourrait expliquer deux évolutions conjointes.','Imagine a third variable that could explain two trends.'],
        ['Prends le temps de dessiner un schéma reliant hypothèses et observations.','Take time to draw a diagram linking hypotheses and observations.'],
        ['Explique de mémoire pourquoi corrélation ne prouve pas causalité.','From memory, explain why correlation does not prove causation.'],
        ['Décide quelle observation supplémentaire départagerait deux hypothèses.','Decide what extra observation could discriminate between two hypotheses.']
      ]),
    skill('core','data',
      ['Interpréter des données avec prudence','Interpret data carefully'],
      ['Vérifier ce qu’un indicateur montre et ne montre pas.','Check what a metric does and does not show.'],
      ['data-literacy','statistics'],['core.evidence'],[
        ['Construis deux petits jeux de valeurs partageant la même moyenne.','Create two small datasets with the same average.'],
        ['Observe d’abord les unités et la population avant de lire une conclusion.','Inspect units and population before reading a conclusion.'],
        ['Sans support, définis le taux de base et propose un exemple simple.','Without notes, define a base rate and invent an example.'],
        ['Demande quelles données individuelles manquent avant d’interpréter un résumé.','Ask which individual observations are missing before interpreting a summary.']
      ])
  ],
  pathways:[path('core','foundations',['Autonomie intellectuelle','Intellectual autonomy'],
    ['Construire des bases transférables dans la vie quotidienne.','Develop foundations transferable to everyday life.'],
    ['core.evidence','core.causality','core.data'],['personal','school-return','higher-education'])]
};

export const studyPack={
  id:'study',version:'1.0.0',title:pair('Méthodes d’apprentissage','Learning methods'),
  competencies:[
    skill('study','reading',
      ['Lire activement','Read actively'],
      ['Formuler des questions à partir d’un texte.','Build useful questions from a text.'],
      ['reading','learning'],['core.evidence'],[
        ['Transforme le titre d’un document en deux questions ouvertes.','Turn a document title into two open questions.'],
        ['Lis un passage court sans changer de tâche ni consulter d’assistant.','Read a short passage without switching tasks or consulting an assistant.'],
        ['Ferme la page et reformule l’idée principale avec tes mots.','Close the page and restate the main idea in your words.'],
        ['Choisis quelle information vérifier avant de résumer le document.','Choose which information you would check before summarizing the document.']
      ]),
    skill('study','retrieval',
      ['Restituer sans support','Retrieve without prompts'],
      ['Utiliser la restitution et l’identification des lacunes.','Use retrieval and identify knowledge gaps.'],
      ['learning','memory'],['study.reading'],[
        ['Compare ce que tu crois savoir à une explication vérifiable.','Compare what you think you know with a verifiable explanation.'],
        ['Réserve une courte période de concentration sans regarder tes notes.','Choose a short, distraction-light moment without looking at notes.'],
        ['Note de mémoire trois idées, puis contrôle chacune dans la source.','Recall three ideas, then check each one against the source.'],
        ['Choisis le point oublié à revoir, sans chercher à obtenir une note.','Choose one missing point to revisit without chasing a score.']
      ]),
    skill('study','transfer',
      ['Transférer ses connaissances','Transfer knowledge'],
      ['Adapter une notion à un problème nouveau.','Apply an idea to a novel problem.'],
      ['transfer','learning'],['study.retrieval'],[
        ['Crée une situation différente dans laquelle la même idée s’applique.','Invent a different situation where the same idea applies.'],
        ['Réalise ton nouvel exemple d’abord sur papier, sans réponse immédiate.','Work on the new example on paper before checking any answer.'],
        ['Explique de mémoire ce qui reste identique entre les deux situations.','From memory, explain what remains the same in both situations.'],
        ['Décide si la méthode convient encore ou doit être adaptée.','Decide whether the method still fits or needs adapting.']
      ])
  ],
  pathways:[path('study','learning',['Apprendre durablement','Learn sustainably'],
    ['Lire, restituer et réutiliser une idée dans un nouveau contexte.','Read, retrieve, and reuse an idea in a new context.'],
    ['study.reading','study.retrieval','study.transfer'],['higher-education','school-return','transition','teaching'])]
};

export const workPack={
  id:'work',version:'1.0.0',title:pair('Savoir-faire professionnels','Professional practice'),
  competencies:[
    skill('work','requirements',
      ['Clarifier un besoin','Clarify requirements'],
      ['Transformer une demande floue en conditions vérifiables.','Turn vague requests into checkable criteria.'],
      ['quality','requirements'],['core.evidence'],[
        ['Réécris une demande vague en trois critères observables.','Rewrite a vague request as three observable criteria.'],
        ['Lis l’énoncé en entier avant de proposer une solution.','Read the full requirement before proposing a solution.'],
        ['Sans aide, reformule la différence entre besoin et solution.','Without help, explain the difference between a need and a solution.'],
        ['Identifie le critère à faire valider avant de commencer le travail.','Identify which criterion needs agreement before work begins.']
      ],{
        work:pair('Cas suggéré : analyser une demande d’amélioration d’un outil.','Suggested case: review a request to improve a tool.'),
        transition:pair('Cas suggéré : clarifier les attentes d’un nouveau métier.','Suggested case: clarify expectations of a new profession.')
      }),
    skill('work','risks',
      ['Identifier et argumenter les risques','Identify and explain risks'],
      ['Distinguer incertitude, impact et mesures possibles.','Distinguish uncertainty, impact, and possible safeguards.'],
      ['quality','risk'],['work.requirements','core.data'],[
        ['Décris deux scénarios de risque possibles sans les présenter comme certains.','Describe two possible risks without presenting them as certainties.'],
        ['Concentre-toi sur une seule hypothèse de risque à la fois.','Examine one risk hypothesis at a time.'],
        ['Sans notes, explique les différences entre gravité et probabilité.','Without notes, explain severity versus likelihood.'],
        ['Choisis une vérification proportionnée au risque et justifie-la.','Choose a proportionate check and explain why.']
      ]),
    skill('work','explain',
      ['Justifier une décision professionnelle','Explain a professional decision'],
      ['Communiquer un choix, ses limites et les faits à vérifier.','Communicate a choice, its limits, and facts to verify.'],
      ['communication','ethics'],['work.risks'],[
        ['Rédige un raisonnement avec conclusion, preuves et limites.','Write an argument with conclusion, evidence, and limitations.'],
        ['Prépare trois points avant d’exposer ton raisonnement.','Prepare three points before explaining your reasoning.'],
        ['Explique sans support une décision prise et ses hypothèses.','Explain a decision and its assumptions without notes.'],
        ['Définis ce qui te ferait reconsidérer ce choix.','Define what would make you reconsider this choice.']
      ])
  ],
  pathways:[path('work','quality',['Raisonnement professionnel et qualité','Professional quality reasoning'],
    ['Analyser une exigence, un risque et justifier une décision.','Review a requirement, evaluate risk, and justify a decision.'],
    ['work.requirements','work.risks','work.explain'],['work','transition']),
    path('work','reconversion',['Découvrir une nouvelle activité','Explore a new professional field'],
    ['Clarifier les attentes et prendre des décisions révisables.','Clarify expectations and make revisable decisions.'],
    ['work.requirements','life.options','work.explain'],['transition','work'])]
};

export const lifePack={
  id:'life',version:'1.0.0',title:pair('Autonomie au quotidien','Everyday autonomy'),
  competencies:[
    skill('life','options',
      ['Comparer plusieurs options','Compare alternatives'],
      ['Expliciter ses critères et les compromis acceptables.','State priorities and acceptable trade-offs.'],
      ['decision','agency'],['core.evidence'],[
        ['Construis deux options plausibles et trois critères choisis par toi.','Write down two realistic options and three criteria you choose.'],
        ['Sépare ton temps de réflexion des notifications et suggestions.','Separate reflection time from notifications and suggestions.'],
        ['Sans notes, explique pourquoi deux personnes peuvent choisir différemment.','Explain from memory why two people might choose differently.'],
        ['Choisis provisoirement, ou reporte ton choix si les faits manquent.','Make a provisional choice or defer it if key facts are missing.']
      ]),
    skill('life','digital',
      ['Garder la main sur les outils numériques','Stay in control of digital tools'],
      ['Examiner une suggestion automatisée et son contexte.','Examine an automated recommendation and its context.'],
      ['digital-literacy','ai-literacy'],['life.options','core.data'],[
        ['Trouve une information absente d’une recommandation automatique.','Identify information missing from an automated recommendation.'],
        ['Lis la proposition sans cliquer immédiatement sur l’option mise en avant.','Read a suggestion before clicking the highlighted option.'],
        ['De mémoire, rappelle deux limites possibles d’un classement.','Recall two possible limitations of a ranking without notes.'],
        ['Décide indépendamment des critères affichés par le service.','Decide using criteria independent of those shown by the service.']
      ]),
    skill('life','change',
      ['Réviser une décision','Revisit a decision'],
      ['Définir à l’avance les raisons de changer d’avis.','Define ahead of time what would change your mind.'],
      ['agency','learning'],['life.options'],[
        ['Liste deux faits nouveaux qui pourraient modifier une décision.','List two new facts that could change a decision.'],
        ['Prends un moment pour distinguer erreur et information nouvelle.','Take a moment to distinguish an error from new evidence.'],
        ['Sans support, explique comment corriger un jugement sans se dévaloriser.','Explain without notes how to revise a judgement without self-criticism.'],
        ['Choisis un indicateur honnête pour réexaminer ton choix plus tard.','Choose one reasonable sign to revisit your decision later.']
      ])
  ],
  pathways:[path('life','autonomy',['Décider avec autonomie','Make autonomous decisions'],
    ['Examiner les choix personnels et numériques sans déléguer son jugement.','Evaluate personal and digital choices without handing over judgement.'],
    ['life.options','life.digital','life.change'],['personal','transition','work'])]
};

// Add a new country, discipline, qualification or occupation pack by adding a module
// with the SAME schema; the engine and the four pillars do not require modifications.
export const installedPacks=[corePack,studyPack,workPack,lifePack];