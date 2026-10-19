// HUMAN FIRST DECIDE: original bilingual educational examples, not tested psychological instruments.
// Every scenario is fictional. These are prompts, not advice or predictions.
export const decisionStages = Object.freeze(['frame','compare','verify','challenge','conclude']);

export const decisionLibrary = Object.freeze([
  {
    id:'outil',category:'digital',
    fr:{title:'Choisir un outil numérique',short:'Une application pratique ou un outil plus simple ?',situation:'Deux applications peuvent accomplir une tâche quotidienne. La première promet beaucoup de fonctions, mais réclame un compte et des données. La seconde fonctionne hors ligne avec moins de fonctions.', options:['Application connectée riche en fonctions','Outil simple utilisable hors ligne'],question:'Quelle information sur les données collectées te manque avant de choisir ?',claim:'« Choisis l’application la plus populaire : elle est nécessairement meilleure. »', challenge:'La popularité démontre-t-elle la qualité pour tes propres besoins ?',transfer:'Compare deux outils réels à partir de critères que tu as définis toi-même, sans noter de données personnelles.'},
    en:{title:'Choose a digital tool',short:'A feature-rich app or a simpler tool?',situation:'Two apps can help with an everyday task. The first offers many features but asks for an account and data. The second works offline with fewer features.', options:['Feature-rich connected app','Simple offline tool'],question:'What do you need to learn about the data being collected?',claim:'“Choose the most popular app: it must be better.”',challenge:'Does popularity prove quality for your needs?',transfer:'Compare two real tools using criteria you define yourself, without writing down personal data.'}
  },
  {
    id:'etudier',category:'learning',
    fr:{title:'Organiser son apprentissage',short:'Relire encore ou s’entraîner à restituer ?',situation:'Tu disposes de peu de temps pour revoir une notion. Tu peux relire un texte une nouvelle fois ou essayer de l’expliquer sans regarder, puis vérifier tes erreurs.',options:['Relire les notes','Essayer un rappel puis vérifier'],question:'Comment vérifierais-tu ta compréhension au-delà d’une impression de familiarité ?',claim:'« La lecture est toujours la meilleure méthode parce qu’elle paraît plus facile. »',challenge:'Une méthode confortable produit-elle nécessairement une meilleure compréhension ?',transfer:'Prépare deux façons de réviser une notion et définis ce que chacune t’aiderait à vérifier.'},
    en:{title:'Plan your learning',short:'Reread again or practise recalling?',situation:'You have limited time to review a topic. You can reread a passage or try explaining it without looking, then check your mistakes.',options:['Reread the notes','Recall first, then check'],question:'How could you verify understanding beyond a feeling of familiarity?',claim:'“Rereading is always the best method because it feels easier.”',challenge:'Does a comfortable method necessarily produce deeper understanding?',transfer:'Plan two ways to review an idea and decide what each method might help you check.'}
  },
  {
    id:'collaboration',category:'relations',
    fr:{title:'Collaborer sans décider pour les autres',short:'Répartir les rôles sans imposer une méthode.',situation:'Un petit groupe veut réaliser une activité. Certains préfèrent répartir les tâches dès le départ, d’autres souhaitent discuter avant de décider.',options:['Répartir les tâches tout de suite','Clarifier les attentes en groupe avant la répartition'],question:'Quelles contraintes et préférences des autres membres faut-il demander, plutôt que supposer ?',claim:'« La personne la plus sûre d’elle devrait toujours choisir pour tout le monde. »',challenge:'Assurance et légitimité à décider sont-elles équivalentes ?',transfer:'Sur papier, propose une procédure pour recueillir plusieurs avis avant un choix collectif.'},
    en:{title:'Collaborate without deciding for others',short:'Divide responsibilities without forcing a method.',situation:'A small group wants to complete a task. Some members prefer assigning jobs right away; others want to discuss expectations first.',options:['Assign responsibilities immediately','Discuss expectations before assigning tasks'],question:'Which constraints and preferences should you ask others about rather than assume?',claim:'“The most confident person should always choose for everyone.”',challenge:'Is confidence the same as legitimate decision-making authority?',transfer:'On paper, devise a way to hear several views before a group decision.'}
  },
  {
    id:'information',category:'critical',
    fr:{title:'Vérifier une recommandation',short:'Un titre convaincant suffit-il ?',situation:'Une publication affirme qu’une nouvelle méthode est efficace. Elle montre un témoignage, mais aucune méthode de comparaison ni source primaire.',options:['Partager sans vérifier','Chercher la méthode et la source avant de relayer'],question:'Quel document ou quelle comparaison aiderait à juger la crédibilité de l’affirmation ?',claim:'« Beaucoup de réactions positives prouvent que cette affirmation est vraie. »',challenge:'Une réaction sociale est-elle une preuve indépendante ?',transfer:'Choisis une affirmation publique non personnelle et écris deux vérifications réalisables avant de la transmettre.'},
    en:{title:'Check a recommendation',short:'Is a convincing headline enough?',situation:'A post claims a new method is effective. It provides one testimonial, but no comparison method or primary source.',options:['Share without checking','Find the method and original source before sharing'],question:'What document or comparison would help evaluate the claim?',claim:'“Many positive reactions prove the claim is true.”',challenge:'Is a social reaction independent evidence?',transfer:'Pick a public, non-personal claim and write two practical checks before sharing it.'}
  },
  {
    id:'organisation',category:'planning',
    fr:{title:'Définir une priorité réaliste',short:'Tout faire ou choisir une étape utile ?',situation:'Tu as trois petites tâches possibles et un créneau court. Certaines peuvent attendre, d’autres dépendent d’une réponse extérieure.',options:['Commencer plusieurs tâches en même temps','Choisir une première action vérifiable'],question:'Quelle tâche est vraiment urgente, et quelle information te manque pour la prioriser ?',claim:'« Faire davantage de choses à la fois est toujours plus productif. »',challenge:'Le nombre d’activités commencées mesure-t-il un résultat utile ?',transfer:'Écris trois tâches fictives et justifie une priorité selon deux critères explicites.'},
    en:{title:'Set a realistic priority',short:'Do everything or choose one useful step?',situation:'You have three small potential tasks and a short window. Some can wait; others depend on information from someone else.',options:['Start several tasks at once','Choose one verifiable first action'],question:'Which task is genuinely urgent, and what is missing to set a priority?',claim:'“Starting more things at once is always more productive.”',challenge:'Does the number of activities started measure a useful result?',transfer:'Write three fictional tasks and justify a priority with two explicit criteria.'}
  },
  {
    id:'conseil-ia',category:'digital',
    fr:{title:'Face à un classement d’IA',short:'Un classement n’est pas une décision.',situation:'Un assistant propose une liste de trois services « recommandés », sans montrer ses critères, ses sources ni les limites de son classement.',options:['Choisir automatiquement le premier','Définir ses critères puis demander les preuves'],question:'Quelles sources, méthodes et éventuels intérêts commerciaux voudrais-tu connaître ?',claim:'« Ce service est n° 1 dans ma liste, donc c’est objectivement ton meilleur choix. »',challenge:'Un classement généré sans critères transparents est-il personnalisé ou vérifiable ?',transfer:'Établis trois critères personnels non sensibles avant de consulter une recommandation externe.'},
    en:{title:'When AI ranks your options',short:'A ranking is not a decision.',situation:'An assistant lists three “recommended” services without explaining its criteria, sources or limitations.',options:['Automatically choose the top-ranked service','Define your criteria and request evidence first'],question:'Which sources, methods or potential commercial interests would you want to know about?',claim:'“This service is number one on my list, so it is objectively best for you.”',challenge:'Is a ranking without transparent criteria personalised or verifiable?',transfer:'Write three non-sensitive criteria of your own before consulting an external recommendation.'}
  },
  {
    id:'libre',category:'personal',
    fr:{title:'Ma propre décision',short:'Utilise une situation que tu choisis.',situation:'Décris une décision de faible enjeu, réelle ou fictive, sans inclure d’information intime, de santé ou financière.',options:['Option A que tu définis','Option B que tu définis'],question:'Quelles informations utiles n’as-tu pas encore vérifiées ?',claim:'« Si une IA me recommande une option, je n’ai plus besoin de la vérifier. »',challenge:'Quelles hypothèses et quels critères manquerait-il pour accepter cette recommandation ?',transfer:'Note sur papier un critère à vérifier dans la réalité, puis quitte l’application si tu le souhaites.'},
    en:{title:'My own decision',short:'Use a situation of your choice.',situation:'Describe a low-stakes, real or fictional decision without sensitive personal, health or financial details.',options:['Option A you define','Option B you define'],question:'Which helpful facts have you not checked yet?',claim:'“If an AI recommends an option, there is no need for me to verify it.”',challenge:'Which missing assumptions and criteria should be tested before accepting this recommendation?',transfer:'On paper, choose one criterion to check in real life, then leave the app if you wish.'}
  }
]);
export function decideScenarios(locale='fr'){
  const lang=locale==='en'?'en':'fr';
  return decisionLibrary.map(item=>({id:item.id,category:item.category,...item[lang],options:[...item[lang].options]}));
}
export function decideScenario(id,locale='fr'){
  return decideScenarios(locale).find(item=>item.id===id)??null;
}
// Does not rank alternatives or decide for the user.
export function reflectionPrompts(locale='fr'){
  return locale==='en' ? [
    'Which priorities come from you, not from a ranking?',
    'What could make you change your mind?',
    'Whose interests might be missing?',
    'Can the decision be reconsidered later?'
  ] : [
    'Quels critères viennent de toi et non d’un classement ?',
    'Qu’est-ce qui pourrait te faire changer d’avis ?',
    'Quels intérêts ou personnes risquent d’être oubliés ?',
    'Peux-tu revenir sur ton choix plus tard ?'
  ];
}