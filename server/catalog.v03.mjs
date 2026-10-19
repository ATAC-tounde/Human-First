// HUMAN FIRST V0.3 : exercices originaux de démonstration, non validés scientifiquement.
// Chaque transfert est indépendant du problème initial. Aucun score automatique.
export const pedagogicalExercises = [
  {
    id:'source', version:'demo-0.3', status:'demonstration',
    title:'Une affirmation virale', category:'Esprit critique', duration:9, level:'Exploration',
    introduction:'Apprendre à vérifier avant de partager une information frappante.',
    prompt:'Une publication affirme : « 9 personnes sur 10 apprennent mieux en regardant des vidéos courtes. » Elle ne cite ni étude, ni date, ni méthode. Quelles vérifications ferais-tu avant d’y croire ou de la partager ?',
    guide:'Qui a produit cette affirmation et comment les données auraient-elles été recueillies ?',
    hints:['Cherche la taille et la composition de l’échantillon, et la définition de « apprendre mieux ».','Quels résultats indépendants permettraient de comparer l’apprentissage immédiat et l’apprentissage différé ?'],
    explanation:'Un pourcentage isolé ne prouve rien à lui seul. Il faut identifier une source primaire, une méthode, la population étudiée et les mesures utilisées. La satisfaction ou le visionnage ne sont pas équivalents à une mémorisation durable. On suspend son jugement tant que ces éléments manquent.',
    transfer:'Une affiche annonce : « 80 % des utilisateurs deviennent plus concentrés grâce à notre application. » Sans autre détail, quelles questions poserais-tu pour évaluer cette promesse ?',
    review:['As-tu demandé la source et les conditions de mesure ?','As-tu distingué témoignages, impressions et données mesurées ?','As-tu évité d’affirmer une conclusion sans preuve suffisante ?'],
    example:'Je demanderais qui a été évalué, sur combien de temps, par quel test de concentration, contre quel groupe et avec quel organisme indépendant.'
  },
  {
    id:'planification', version:'demo-0.3', status:'demonstration',
    title:'Choisir une stratégie', category:'Résolution de problèmes', duration:10, level:'Exploration',
    introduction:'Raisonner avec des contraintes avant de choisir une action.',
    prompt:'Tu disposes de 90 minutes pour préparer un contrôle. Tu dois relire trois chapitres, t’entraîner à résoudre des problèmes et te reposer. Propose une méthode de travail réaliste et explique tes priorités.',
    guide:'Quelles activités produisent des preuves de compréhension, plutôt qu’une simple impression de familiarité ?',
    hints:['Commence par repérer les notions que tu maîtrises le moins et estime le temps nécessaire.','Prévois un exercice sans support et quelques minutes pour vérifier les erreurs ou faire une pause.'],
    explanation:'Il n’existe pas une répartition universelle. Une stratégie justifiée peut combiner une courte identification des lacunes, une récupération active des notions et des exercices ciblés, avec une marge pour corriger les erreurs. L’essentiel est de relier le plan à l’objectif et de vérifier son efficacité.',
    transfer:'Tu dois préparer en 45 minutes une présentation de cinq minutes sur un sujet nouveau. Comment organiserais-tu le temps sans demander à l’IA de rédiger intégralement le contenu ?',
    review:['As-tu formulé un objectif vérifiable ?','As-tu choisi et justifié des priorités compatibles avec le temps ?','As-tu prévu une vérification autonome du résultat ?'],
    example:'Je consacrerais une partie du temps à comprendre le sujet, puis à sélectionner trois idées, à les structurer et enfin à répéter cinq minutes sans notes pour corriger les difficultés.'
  },
  {
    id:'contreexemple', version:'demo-0.3', status:'demonstration',
    title:'Un seul contre-exemple', category:'Raisonnement logique', duration:8, level:'Découverte',
    introduction:'Mettre à l’épreuve une affirmation absolue plutôt que la répéter.',
    prompt:'Un camarade affirme : « Tous les élèves qui utilisent l’IA obtiennent de meilleures notes. » Comment pourrais-tu tester logiquement cette phrase sans prétendre connaître les résultats de tous les élèves ?',
    guide:'Quelle observation suffirait à réfuter le mot « tous » ?',
    hints:['Compare « tous » et « certains » : l’une des formulations est beaucoup plus forte.','Construis un cas possible d’élève utilisant l’IA sans amélioration de ses notes. Que prouverait ce cas ?'],
    explanation:'Une affirmation universelle (« tous ») est réfutée par un seul contre-exemple réel et bien établi. Un exemple simplement imaginé montre que la conclusion n’est pas logiquement nécessaire, mais ne prouve pas que le contre-exemple existe. Il faut distinguer logique, hypothèses et observations.',
    transfer:'On affirme : « Tous les cours en ligne sont moins efficaces que les cours en classe. » Quelle observation remettrait en cause cette affirmation ? Quelle nuance conserverais-tu ?',
    review:['As-tu identifié le quantificateur « tous » ?','As-tu distingué un contre-exemple hypothétique d’un cas observé ?','As-tu évité de remplacer une généralisation par la généralisation inverse ?'],
    example:'Un cours en ligne donnant de meilleurs résultats sur une mesure comparable pourrait réfuter « tous ». Cela ne prouverait pas que tous les cours en ligne sont supérieurs.'
  },
  {
    id:'probabilites', version:'demo-0.3', status:'demonstration',
    title:'Le piège des pourcentages', category:'Interprétation des données', duration:10, level:'Exploration',
    introduction:'Comprendre pourquoi une information spectaculaire peut rester trompeuse.',
    prompt:'Un outil détecte correctement 90 % des messages frauduleux, mais classe aussi comme frauduleux 10 % des messages légitimes. Si seuls 10 messages sur 1 000 sont réellement frauduleux, peut-on croire presque toutes les alertes ? Explique avec des nombres simples.',
    guide:'Sur 1 000 messages, combien sont frauduleux et combien sont légitimes ?',
    hints:['Parmi 10 messages frauduleux, l’outil en détecte environ 9. Parmi 990 messages légitimes, il déclenche environ 99 fausses alertes.','Compare les 9 vraies alertes aux 99 fausses alertes. Que devient la proportion d’alertes correctes ?'],
    explanation:'Avec ces taux et ces effectifs approximatifs, 9 vraies alertes et 99 fausses donnent 108 alertes, dont seulement 9 correspondent à des fraudes (environ 8 %). La rareté initiale du phénomène, appelée taux de base, est essentielle pour interpréter un test.',
    transfer:'Un contrôle repère 80 % des objets défectueux mais se trompe sur 20 % des objets corrects. Sur 100 objets, dont 5 défectueux, estime le nombre de vraies alertes et de fausses alertes. Pourquoi le total importe-t-il ?',
    review:['As-tu commencé par les effectifs de chaque groupe ?','As-tu distingué faux positifs et véritables détections ?','As-tu relié les résultats au taux de base initial ?'],
    example:'Sur 5 défectueux, 4 vraies alertes environ ; sur 95 corrects, 19 fausses alertes environ. Parmi 23 alertes, seulement 4 signalent un défaut dans cet exemple.'
  },
  {
    id:'rappel', version:'demo-0.3', status:'demonstration',
    title:'Comprendre sans relire', category:'Apprentissage durable', duration:8, level:'Découverte',
    introduction:'S’entraîner à retrouver une connaissance sans consulter sa source.',
    prompt:'Tu viens d’apprendre la différence entre une cause et une corrélation. Sans consulter de notes, explique cette différence et invente ton propre exemple.',
    guide:'Que peut-on observer sans savoir encore pourquoi cela arrive ?',
    hints:['La corrélation décrit une variation conjointe ; la causalité affirme qu’un facteur en influence un autre.','Dans ton exemple, cherche une troisième variable susceptible d’expliquer les deux phénomènes.'],
    explanation:'Rappeler une idée avec ses propres mots aide à identifier ce qui est compris et ce qui reste flou. Corrélation ne signifie pas nécessairement causalité : un facteur caché, un hasard ou une causalité inverse peuvent expliquer l’association. Cet exercice seul ne prouve pas une amélioration durable de la mémoire.',
    transfer:'Sans relire l’explication, donne un nouvel exemple montrant pourquoi deux phénomènes qui évoluent ensemble ne sont pas forcément liés par une cause directe.',
    review:['As-tu formulé la distinction avec tes propres mots ?','Ton exemple est-il réellement différent de celui de départ ?','As-tu évoqué au moins une autre explication possible ?'],
    example:'Les ventes de glaces et les baignades augmentent l’été. La chaleur peut expliquer les deux, sans que l’achat de glaces provoque directement la baignade.'
  },
  {
    id:'decision', version:'demo-0.3', status:'demonstration',
    title:'Décider sans suivre aveuglément', category:'Autonomie décisionnelle', duration:10, level:'Exploration',
    introduction:'Clarifier ses critères avant de recevoir une recommandation algorithmique.',
    prompt:'Deux applications de révision te sont proposées. A offre beaucoup de notifications et un grand choix d’exercices. B propose moins de fonctions, fonctionne hors connexion et ne collecte pas tes réponses. Comment choisirais-tu, sans déléguer ta décision à un classement IA ?',
    guide:'Quels critères sont importants pour toi et pourquoi : attention, confidentialité, accessibilité ou efficacité ?',
    hints:['Classe tes trois priorités, puis note ce que tu sais réellement et ce qui reste à vérifier.','Envisage un essai limité de chacune, avec une mesure personnelle simple : que retiens-tu sans aide après une séance ?'],
    explanation:'Une décision autonome commence par des objectifs explicites, des critères pondérés et l’examen des informations manquantes. Une recommandation peut éclairer le choix, mais ne remplace ni les préférences personnelles ni la vérification des affirmations des fournisseurs. Les deux applications peuvent être adaptées à des besoins différents.',
    transfer:'Une IA recommande un service gratuit qui conserve tes données ; un autre est payant et minimise les données. Quelles questions et quels critères utilisera-tu pour décider ?',
    review:['As-tu défini tes propres critères au lieu d’adopter la recommandation ?','As-tu pris en compte les incertitudes et compromis ?','As-tu indiqué comment vérifier le choix après utilisation ?'],
    example:'Je comparerais coût réel, données collectées, possibilités d’export et qualité du service ; je vérifierais la politique de confidentialité et testerais la solution sur une courte période.'
  }
];
