// Original training examples for the 0.3 demonstration only. NOT validated for research or assessment.
export const newCurriculum = [
  {
    "id": "alarme",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "logic",
    "difficulty": 2,
    "duration": 7,
    "title": "Une alarme, plusieurs causes",
    "category": "Raisonnement logique",
    "level": "Exploration",
    "introduction": "Une conséquence prouve-t-elle sa cause ?",
    "prompt": "Si le détecteur repère de la fumée, l’alarme sonne. L’alarme sonne. Pouvons-nous affirmer que le détecteur a repéré de la fumée ? Justifie.",
    "guide": "La première phrase affirme-t-elle que la fumée est la seule cause possible de l’alarme ?",
    "hints": [
      "Imagine que l’alarme ait été déclenchée manuellement.",
      "Distingue « si A, alors B » de « si B, alors A » : les deux propositions sont-elles équivalentes ?"
    ],
    "explanation": "Non. La règle « fumée détectée implique alarme » n’autorise pas l’inverse. L’alarme peut sonner pour d’autres raisons. Affirmer la cause à partir de la conséquence est une erreur logique appelée affirmation du conséquent.",
    "transfer": "Si un serveur tombe en panne, la page devient inaccessible. La page est inaccessible. Peut-on conclure que le serveur est en panne ? Pourquoi ?",
    "review": [
      "As-tu identifié le sens de l’implication ?",
      "As-tu envisagé d’autres causes possibles ?",
      "As-tu expliqué pourquoi la conséquence ne garantit pas sa cause ?"
    ],
    "example": "Non. Une page inaccessible peut aussi venir d’une panne réseau ou d’une erreur d’adresse. La conséquence ne suffit pas à prouver une cause particulière.",
    "offlineChallenge": "Sur papier, invente deux causes différentes pouvant expliquer un même événement."
  },
  {
    "id": "quantificateurs",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "logic",
    "difficulty": 2,
    "duration": 7,
    "title": "Certains, tous ou aucun ?",
    "category": "Raisonnement logique",
    "level": "Exploration",
    "introduction": "Les mots qui changent toute une conclusion.",
    "prompt": "Dans un atelier, au moins un participant a terminé son exercice. Peut-on en conclure que la majorité a terminé ? Quelles informations manquent ?",
    "guide": "« Au moins un » donne-t-il une proportion du groupe ?",
    "hints": [
      "Le groupe pourrait compter 2 personnes ou 200.",
      "Pour savoir si une majorité a fini, il faut connaître le nombre total et le nombre de personnes ayant terminé."
    ],
    "explanation": "Non. « Au moins un » signifie une ou plusieurs personnes, sans garantir plus de la moitié. Il faut connaître la taille du groupe et le nombre exact de personnes ayant terminé.",
    "transfer": "Une enquête indique que « certains élèves utilisent une calculatrice ». Peut-on conclure que « presque tous » l’utilisent ? Justifie.",
    "review": [
      "As-tu identifié précisément ce que garantit « au moins un » ?",
      "As-tu évité d’inventer une proportion ?",
      "As-tu demandé les effectifs utiles ?"
    ],
    "example": "Non. « Certains » ne donne aucune proportion précise. Il faudrait connaître le nombre d’élèves interrogés et le nombre d’utilisateurs.",
    "offlineChallenge": "Rédige trois phrases où remplacer « certains » par « tous » changerait fortement le sens."
  },
  {
    "id": "contre_exemple",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "logic",
    "difficulty": 3,
    "duration": 8,
    "title": "Un seul contre-exemple",
    "category": "Raisonnement logique",
    "level": "Approfondissement",
    "introduction": "Comment réfuter une affirmation universelle ?",
    "prompt": "Une personne affirme : « Tous les nombres impairs supérieurs à 1 sont premiers. » Trouve un contre-exemple et explique pourquoi il suffit.",
    "guide": "As-tu besoin de tester tous les nombres impairs pour invalider « tous » ?",
    "hints": [
      "Cherche un nombre impair qui possède un diviseur autre que 1 et lui-même.",
      "Neuf est impair : combien vaut 3 × 3 ?"
    ],
    "explanation": "Neuf est impair, supérieur à 1, mais n’est pas premier car 9 = 3 × 3. Un seul cas qui satisfait la condition et contredit la conclusion suffit à réfuter une affirmation universelle.",
    "transfer": "Une personne affirme : « Tous les nombres pairs supérieurs à 2 sont divisibles par 4. » Donne un contre-exemple et explique.",
    "review": [
      "Ton exemple vérifie-t-il la condition initiale ?",
      "Contredit-il bien la conclusion ?",
      "As-tu expliqué pourquoi un seul exemple suffit ?"
    ],
    "example": "Six est pair et supérieur à 2, mais 6 n’est pas divisible par 4. Cette affirmation universelle est donc fausse.",
    "offlineChallenge": "Choisis une phrase contenant « toujours » et invente un contre-exemple possible."
  },
  {
    "id": "sources",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "critical",
    "difficulty": 2,
    "duration": 8,
    "title": "Qui affirme, sur quelles preuves ?",
    "category": "Esprit critique",
    "level": "Exploration",
    "introduction": "Un récit convaincant n’est pas toujours une preuve.",
    "prompt": "Un message anonyme affirme : « Cette méthode double la mémoire en trois jours », sans fournir de source ni de protocole. Quelles vérifications ferais-tu avant d’y croire ?",
    "guide": "Peux-tu distinguer une promesse d’un résultat mesuré ?",
    "hints": [
      "Identifie qui a publié l’affirmation, comment « mémoire » est définie et avec quelle méthode elle a été mesurée.",
      "Cherche une étude indépendante, une comparaison et des résultats reproductibles."
    ],
    "explanation": "Une affirmation spectaculaire ne constitue pas une preuve. Il faut vérifier l’auteur, la méthode, la taille et la sélection de l’échantillon, les comparaisons et l’existence d’évaluations indépendantes. L’absence de preuve ne prouve pas nécessairement que la méthode ne fonctionne pas : elle limite ce qu’on peut conclure.",
    "transfer": "Une publication affirme : « Une application élimine totalement la distraction numérique », sans fournir de données. Comment évaluerais-tu cette affirmation ?",
    "review": [
      "As-tu distingué affirmation et preuve ?",
      "As-tu proposé des sources indépendantes ?",
      "As-tu évité de conclure trop vite dans un sens ou dans l’autre ?"
    ],
    "example": "Je chercherais des mesures définies à l’avance et une étude comparative indépendante. Sans données contrôlables, je ne peux ni confirmer la promesse ni affirmer qu’elle est impossible.",
    "offlineChallenge": "Note trois questions à poser quand une publicité promet un résultat extraordinaire."
  },
  {
    "id": "echelle",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "critical",
    "difficulty": 3,
    "duration": 8,
    "title": "Quand le graphique exagère",
    "category": "Esprit critique",
    "level": "Approfondissement",
    "introduction": "Les axes modifient notre perception des écarts.",
    "prompt": "Un graphique en barres affiche 100 ventes un mois et 102 le mois suivant. Son axe vertical commence à 99 plutôt qu’à 0, ce qui rend la deuxième barre visuellement trois fois plus haute. Que peut-on réellement conclure ?",
    "guide": "Distingue l’écart absolu, le pourcentage de variation et l’effet du choix de l’axe.",
    "hints": [
      "La différence est de 2 ventes pour un point de départ à 100.",
      "Une hausse de 2 % peut être présentée visuellement comme une hausse gigantesque si l’axe est tronqué."
    ],
    "explanation": "Les ventes ont augmenté de 2 unités, soit 2 % par rapport aux 100 initiales. Un axe vertical tronqué peut amplifier l’impression visuelle : il ne change pas les données. Pour interpréter la tendance, regarde les graduations, la période et le contexte.",
    "transfer": "Un graphique passe de 1 000 à 1 005 visites mais commence son axe vertical à 995. Quelle est la variation relative et quel risque d’interprétation existe ?",
    "review": [
      "As-tu calculé la variation avec la bonne base ?",
      "As-tu examiné l’axe vertical ?",
      "As-tu évité de confondre impression graphique et données ?"
    ],
    "example": "La hausse est de 5 visites, soit 0,5 %. Un axe tronqué peut la faire paraître beaucoup plus forte qu’elle ne l’est.",
    "offlineChallenge": "Dessine deux graphiques des mêmes valeurs, l’un avec un axe à zéro, l’autre tronqué, puis compare leur effet."
  },
  {
    "id": "billets",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "problem",
    "difficulty": 1,
    "duration": 7,
    "title": "Choisir un tarif raisonnable",
    "category": "Résolution de problèmes",
    "level": "Découverte",
    "introduction": "Comparer avant de choisir.",
    "prompt": "Tu prévois 6 trajets. Chaque ticket coûte 2,40 €, tandis qu’un carnet de 10 tickets coûte 18 €. Quelle option coûte le moins cher si les tickets non utilisés ne sont pas remboursés ? Explique le calcul.",
    "guide": "Quels sont les coûts totaux des deux options ?",
    "hints": [
      "Multiplie 6 par 2,40 € pour l’achat à l’unité.",
      "Compare le total des tickets à l’unité au prix fixe de 18 € : le carnet n’est pas toujours le moins cher."
    ],
    "explanation": "Six tickets coûtent 6 × 2,40 € = 14,40 €. Le carnet coûte 18 €, donc acheter à l’unité économise 3,60 € pour exactement six trajets. Une autre fréquence de voyage pourrait changer ce choix.",
    "transfer": "Cette fois, tu prévois 9 trajets avec les mêmes tarifs : ticket à 2,40 € et carnet de 10 à 18 €. Quel choix fais-tu et pourquoi ?",
    "review": [
      "As-tu identifié le nombre exact de trajets ?",
      "As-tu comparé les coûts totaux plutôt que les prix unitaires ?",
      "As-tu justifié ton choix avec des nombres ?"
    ],
    "example": "Neuf tickets à l’unité coûtent 21,60 €. Le carnet coûte 18 € : le carnet économise 3,60 €.",
    "offlineChallenge": "Compare sur papier deux offres de transport ou d’abonnement que tu connais."
  },
  {
    "id": "dependances",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "problem",
    "difficulty": 2,
    "duration": 8,
    "title": "Organiser sans se précipiter",
    "category": "Résolution de problèmes",
    "level": "Exploration",
    "introduction": "Un bon plan respecte les dépendances.",
    "prompt": "Pour publier une fiche, il faut : rédiger le texte (20 min), vérifier ses faits (15 min, après rédaction) et choisir une illustration (10 min, sans dépendance). Propose un ordre de travail qui respecte les contraintes et évite l’attente inutile.",
    "guide": "Quelles tâches peuvent commencer tout de suite ? Laquelle doit obligatoirement attendre ?",
    "hints": [
      "La vérification dépend de la rédaction ; l’illustration n’en dépend pas.",
      "Si deux personnes travaillent, l’illustration peut avancer pendant la rédaction. Si une seule travaille, toutes les tâches doivent être planifiées successivement."
    ],
    "explanation": "La vérification doit suivre la rédaction. L’illustration est indépendante : elle peut être faite avant ou pendant la rédaction par une autre personne. Avec une personne, il faut au moins 45 minutes de travail (20 + 15 + 10) ; deux personnes peuvent réduire le temps écoulé en parallélisant l’illustration.",
    "transfer": "Une équipe doit préparer une présentation (25 min), la relire (10 min après préparation) et vérifier le matériel (5 min, indépendant). Propose un planning si deux personnes sont disponibles.",
    "review": [
      "As-tu repéré la dépendance obligatoire ?",
      "As-tu identifié une tâche indépendante ?",
      "As-tu distingué durée de travail et temps écoulé ?"
    ],
    "example": "Une personne prépare la présentation pendant 25 minutes puis la relit 10 minutes. La deuxième vérifie le matériel en parallèle au début. Le temps écoulé minimal est de 35 minutes.",
    "offlineChallenge": "Écris trois tâches réelles de ta journée et trace leurs dépendances avec des flèches."
  },
  {
    "id": "temps",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "problem",
    "difficulty": 3,
    "duration": 8,
    "title": "Faire mieux avec une limite",
    "category": "Résolution de problèmes",
    "level": "Approfondissement",
    "introduction": "Optimiser sans décider au hasard.",
    "prompt": "Tu disposes de 60 minutes pour lire des dossiers indépendants. Type A : 12 pages en 45 minutes. Type B : 7 pages en 30 minutes. Tu peux choisir plusieurs dossiers de chaque type, sans interruption. Quelle combinaison maximise les pages lues ?",
    "guide": "Quels dossiers entiers tiennent dans 60 minutes ?",
    "hints": [
      "45 + 30 minutes dépassent le temps disponible.",
      "Deux dossiers de type B demandent exactement 60 minutes et représentent 14 pages."
    ],
    "explanation": "Avec 60 minutes, on peut lire un dossier A (12 pages) ou deux dossiers B (14 pages). La combinaison A + B dépasse 60 minutes. Deux dossiers B maximisent ici le nombre de pages à 14, en supposant que les dossiers sont comparables et disponibles.",
    "transfer": "Tu disposes de 60 minutes. Un dossier C demande 40 minutes pour 9 pages ; un dossier D, 20 minutes pour 5 pages. Les dossiers sont disponibles en quantité suffisante. Quelle combinaison permet le plus de pages ?",
    "review": [
      "As-tu respecté la limite de temps ?",
      "As-tu envisagé plusieurs combinaisons possibles ?",
      "As-tu indiqué les hypothèses de comparaison ?"
    ],
    "example": "Trois dossiers D prennent 60 minutes et représentent 15 pages. Un C + un D donne 14 pages ; un C seul, 9. Trois D est donc le meilleur choix pour ce critère.",
    "offlineChallenge": "Sur une feuille, organise un créneau de 45 minutes entre plusieurs petites tâches et justifie ton choix."
  },
  {
    "id": "diagnostic",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "problem",
    "difficulty": 2,
    "duration": 7,
    "title": "Enquêter avant d’agir",
    "category": "Résolution de problèmes",
    "level": "Exploration",
    "introduction": "Tester une hypothèse à la fois.",
    "prompt": "Une application se ferme parfois sur un téléphone. Quel plan proposerais-tu pour identifier la cause, plutôt que de désinstaller tout de suite l’application ?",
    "guide": "Comment reproduire le problème en modifiant un seul facteur à la fois ?",
    "hints": [
      "Note les conditions du problème : action, heure, réseau, version et message d’erreur éventuel.",
      "Change une seule variable entre deux essais pour comparer les résultats."
    ],
    "explanation": "Une démarche prudente consiste à décrire les symptômes, reproduire l’incident, vérifier les informations disponibles puis tester une hypothèse à la fois. Cela évite d’attribuer la panne à une cause non vérifiée et limite les manipulations inutiles.",
    "transfer": "Une imprimante produit parfois des pages blanches. Propose trois vérifications ordonnées qui permettraient de distinguer un problème de document, de consommable ou de configuration.",
    "review": [
      "As-tu distingué le symptôme de la cause ?",
      "As-tu proposé des tests vérifiables ?",
      "As-tu évité de changer plusieurs paramètres simultanément ?"
    ],
    "example": "Je testerais d’abord l’aperçu du document, puis une page de test de l’imprimante, puis les niveaux et réglages d’encre. Je noterais le résultat de chaque essai.",
    "offlineChallenge": "Choisis un problème non urgent et écris trois hypothèses qui pourraient l’expliquer."
  },
  {
    "id": "reformuler",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "learn",
    "difficulty": 1,
    "duration": 7,
    "title": "Expliquer sans recopier",
    "category": "Compréhension et mémorisation",
    "level": "Découverte",
    "introduction": "Comprendre, c’est pouvoir reformuler.",
    "prompt": "Lis cette idée : « Un exemple illustre une règle, mais ne la prouve pas dans tous les cas. » Sans répéter la phrase mot pour mot, explique ce qu’elle veut dire et donne un exemple.",
    "guide": "Un exemple suffit-il à établir une affirmation sur « tous » ?",
    "hints": [
      "Pense à la différence entre « j’ai vu un cas » et « cela fonctionne toujours ».",
      "Un seul chat noir ne prouve pas que tous les chats sont noirs."
    ],
    "explanation": "Un exemple peut rendre une règle concrète, mais ne suffit pas à démontrer une généralisation universelle. Reformuler avec ses mots et trouver un nouvel exemple permet d’examiner ce que l’on a réellement compris.",
    "transfer": "Explique avec tes mots : « Une moyenne résume un groupe, mais ne décrit pas forcément chaque membre. » Donne un exemple inédit.",
    "review": [
      "As-tu utilisé tes propres mots ?",
      "Ton exemple illustre-t-il bien le principe ?",
      "As-tu évité une généralisation excessive ?"
    ],
    "example": "Si trois personnes marchent respectivement 1, 2 et 9 km, leur moyenne est 4 km. Pourtant aucune personne n’a marché exactement 4 km.",
    "offlineChallenge": "Prends un paragraphe d’un livre, ferme-le et explique-le oralement en une minute."
  },
  {
    "id": "rappel",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "learn",
    "difficulty": 2,
    "duration": 7,
    "title": "Retrouver l’idée sans relire",
    "category": "Compréhension et mémorisation",
    "level": "Exploration",
    "introduction": "Essayer de rappeler plutôt que seulement relire.",
    "prompt": "Lis une fois : « Une hypothèse est une explication à tester. Une observation est une information recueillie. Une conclusion doit tenir compte des résultats et de leurs limites. » Masque ensuite l’énoncé avec le bouton prévu, puis reformule le rôle de chacun des trois éléments de mémoire.",
    "guide": "Quels sont les trois moments d’une démarche : proposer, observer, conclure ?",
    "hints": [
      "L’hypothèse n’est pas déjà une preuve.",
      "Une observation peut contredire l’hypothèse : la conclusion doit l’admettre."
    ],
    "explanation": "L’hypothèse propose une explication vérifiable ; l’observation apporte des données ; la conclusion interprète ces données en respectant leurs limites. Ici, l’objectif est une restitution immédiate, pas une mesure validée de mémoire à long terme.",
    "transfer": "Sans reprendre les mots exacts : explique la différence entre une question de recherche, un résultat observé et une interprétation.",
    "review": [
      "As-tu distingué proposition et preuve ?",
      "As-tu décrit le rôle des observations ?",
      "As-tu indiqué que la conclusion a des limites ?"
    ],
    "example": "La question indique ce qu’on veut savoir, les observations décrivent ce qu’on a constaté, l’interprétation propose une explication sans dépasser les données.",
    "offlineChallenge": "Après une lecture, ferme le document et écris trois idées retenues avant de le rouvrir."
  },
  {
    "id": "principe",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "learn",
    "difficulty": 2,
    "duration": 7,
    "title": "Une idée, un autre contexte",
    "category": "Compréhension et mémorisation",
    "level": "Exploration",
    "introduction": "Transférer un principe vers une situation différente.",
    "prompt": "Règle : « Dans une file ordinaire, la première personne arrivée est servie la première. » Explique cette règle et donne un contexte différent où le même principe pourrait être appliqué.",
    "guide": "Que signifie « premier arrivé, premier servi » ?",
    "hints": [
      "Imagine des demandes qui attendent leur tour.",
      "Par exemple, une liste d’impressions peut être traitée dans l’ordre de réception, sauf priorité explicite."
    ],
    "explanation": "Cette règle décrit une organisation en file d’attente, souvent appelée FIFO (« first in, first out »). Elle peut s’appliquer à des personnes, des documents ou des tâches. Certaines situations justifient d’autres priorités : il faut préciser le contexte.",
    "transfer": "Dans une bibliothèque, des demandes de réservation sont traitées dans l’ordre de leur arrivée. Explique un avantage et une limite possible de cette règle.",
    "review": [
      "As-tu reconnu le principe commun ?",
      "As-tu donné un contexte pertinent ?",
      "As-tu envisagé les limites de son application ?"
    ],
    "example": "L’ordre d’arrivée paraît transparent et prévisible. Mais une urgence ou un besoin d’accessibilité peut justifier un traitement prioritaire clairement défini.",
    "offlineChallenge": "Repère une règle de fonctionnement autour de toi et décris une autre situation où elle serait utile."
  },
  {
    "id": "incertitude",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "learn",
    "difficulty": 3,
    "duration": 8,
    "title": "Savoir ce que l’on ne sait pas",
    "category": "Compréhension et mémorisation",
    "level": "Approfondissement",
    "introduction": "Prendre du recul sur sa certitude.",
    "prompt": "Tu as lu une réponse de l’IA et tu es « presque certain » qu’elle est correcte, mais tu ne sais pas expliquer pourquoi. Que peux-tu faire pour vérifier si tu as réellement compris ?",
    "guide": "Être sûr d’une réponse signifie-t-il être capable de la justifier ?",
    "hints": [
      "Essaie de retrouver l’argument sans regarder la réponse.",
      "Cherche un exemple nouveau, une objection possible et une source indépendante."
    ],
    "explanation": "La confiance ressentie n’est pas une mesure suffisante de compréhension. Pour vérifier sa maîtrise, on peut expliquer de mémoire, résoudre un cas inédit, trouver une limite et confronter son raisonnement à des sources vérifiables. Il n’existe pas ici de diagnostic automatique de « dépendance à l’IA ».",
    "transfer": "Un ami affirme maîtriser un sujet car il reconnaît toutes les réponses dans un quiz. Propose une épreuve différente pour vérifier sa compréhension sans le dévaloriser.",
    "review": [
      "As-tu distingué confiance et justification ?",
      "As-tu proposé une vérification autonome ?",
      "As-tu gardé une attitude respectueuse et non culpabilisante ?"
    ],
    "example": "Je lui proposerais d’expliquer le sujet sans propositions de réponse, puis de résoudre un nouveau problème. On comparerait les raisonnements sans attribuer une note sur sa personne.",
    "offlineChallenge": "Avant de demander une réponse à une IA, écris ce que tu sais, ce que tu supposes et ce que tu dois vérifier."
  },
  {
    "id": "negation",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "logic",
    "difficulty": 3,
    "duration": 7,
    "title": "La conclusion à rebours",
    "category": "Raisonnement logique",
    "level": "Approfondissement",
    "introduction": "Reconnaître une déduction valide.",
    "prompt": "Dans un atelier, toute carte validée porte un symbole bleu. La carte que tu observes ne porte pas de symbole bleu. Peut-on conclure qu’elle n’a pas été validée ? Justifie en précisant l’hypothèse.",
    "guide": "Si toute carte validée doit être bleue, une carte sans bleu peut-elle être validée sans contredire la règle ?",
    "hints": [
      "Traduis la règle par « si validée, alors symbole bleu ».",
      "Ce raisonnement est différent de « symbole bleu, donc validée » : ici on constate l’absence de la conséquence requise."
    ],
    "explanation": "Oui, si la règle est générale et exacte : une carte validée doit nécessairement porter le symbole bleu. Son absence exclut donc la validation. C’est la contraposée de l’implication. La qualité de la conclusion dépend de la fiabilité de la règle.",
    "transfer": "Tous les billets authentiques de cet événement portent un numéro. Un billet présenté ne porte aucun numéro. Que peut-on conclure si la règle ne comporte aucune exception ?",
    "review": [
      "As-tu clairement identifié la règle initiale ?",
      "As-tu distingué absence de la conséquence et présence de la conséquence ?",
      "As-tu précisé que la règle doit être fiable et sans exception ?"
    ],
    "example": "Si tous les billets authentiques doivent être numérotés et que la règle ne comporte aucune exception, un billet non numéroté ne peut pas être authentique selon cette règle.",
    "offlineChallenge": "Écris une règle « si A alors B » puis teste ce que l’absence de B permet de conclure."
  },
  {
    "id": "alertes",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "critical",
    "difficulty": 2,
    "duration": 8,
    "title": "Que mesurent les alertes ?",
    "category": "Esprit critique",
    "level": "Exploration",
    "introduction": "Ne pas confondre précision et couverture.",
    "prompt": "Un logiciel signale 10 messages comme suspects. Une vérification indépendante montre que 2 d’entre eux étaient réellement frauduleux. Peut-on connaître la proportion de tous les messages frauduleux que le logiciel a détectés ? Explique.",
    "guide": "Connais-tu le nombre de messages frauduleux qui n’ont pas été signalés ?",
    "hints": [
      "Tu sais que 2 alertes sur 10 étaient justifiées.",
      "Pour mesurer la proportion de fraudes détectées, il faut aussi connaître les fraudes non signalées."
    ],
    "explanation": "On peut calculer la précision des alertes de cet échantillon : 2/10 = 20 %. On ne peut pas connaître le taux de détection de l’ensemble des fraudes sans savoir combien de fraudes ont été manquées. Les deux indicateurs répondent à des questions différentes.",
    "transfer": "Un outil signale 20 documents comme erronés. Parmi eux, 5 présentent réellement une erreur. Que peut-on calculer, et quelle information manque pour mesurer toutes les erreurs repérées ?",
    "review": [
      "As-tu calculé la proportion parmi les alertes ?",
      "As-tu identifié les cas potentiellement manqués ?",
      "As-tu évité de confondre deux indicateurs ?"
    ],
    "example": "La part d’alertes justifiées est 5/20 = 25 %. On ne connaît pas la part de toutes les erreurs détectées sans dénombrer aussi les erreurs non signalées.",
    "offlineChallenge": "Quand un indicateur est annoncé, note précisément son dénominateur et ce qu’il ne mesure pas."
  },
  {
    "id": "criteres",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "problem",
    "difficulty": 2,
    "duration": 8,
    "title": "Le meilleur choix pour qui ?",
    "category": "Résolution de problèmes",
    "level": "Exploration",
    "introduction": "Une décision dépend de ses critères.",
    "prompt": "Deux services livrent le même colis : A coûte 8 € et arrive dans 5 jours, B coûte 15 € et arrive dans 1 jour. Sans autre information, peux-tu affirmer lequel est le meilleur ? Propose deux critères de décision.",
    "guide": "Quelle option choisirais-tu en cas d’urgence ? Et sans urgence ?",
    "hints": [
      "Définis d’abord la priorité : réduire le coût ou réduire le délai.",
      "La même option n’est pas forcément optimale pour toutes les personnes."
    ],
    "explanation": "On ne peut pas désigner un gagnant universel sans connaître la situation. A minimise le coût ; B minimise le délai. Une décision justifiée explicite les critères, leur importance et les contraintes réelles.",
    "transfer": "Deux ordinateurs conviennent à un travail : l’un coûte 400 € et pèse 2,5 kg, l’autre coûte 550 € et pèse 1,2 kg. Comment ferais-tu ton choix si tu te déplaces beaucoup ?",
    "review": [
      "As-tu énoncé les critères de décision ?",
      "As-tu distingué contraintes et préférences ?",
      "As-tu évité de présenter un choix universel sans contexte ?"
    ],
    "example": "Si je voyage souvent, je peux privilégier l’ordinateur plus léger, à condition que 550 € respecte mon budget. Si le budget est strictement limité à 450 €, le premier reste le seul choix possible.",
    "offlineChallenge": "Compare deux options d’un choix réel à l’aide de trois critères que tu définis toi-même."
  },
  {
    "id": "espacement",
    "version": "demo-0.3",
    "status": "demonstration",
    "domain": "learn",
    "difficulty": 2,
    "duration": 8,
    "title": "Revoir sans rester connecté",
    "category": "Compréhension et mémorisation",
    "level": "Exploration",
    "introduction": "Prévoir des rappels hors écran sans obsession des séries.",
    "prompt": "Tu viens d’apprendre une nouvelle notion. Au lieu de la relire dix fois aujourd’hui, propose un petit plan de vérifications sans aide sur plusieurs jours. Comment saurais-tu ce qui reste difficile ?",
    "guide": "Comment vérifier la restitution après un intervalle, sans que la réponse soit sous tes yeux ?",
    "hints": [
      "Prévois une tentative aujourd’hui, puis une autre après un ou plusieurs jours.",
      "Après chaque tentative, compare avec un support fiable, repère ce qui manque et ajuste le prochain rappel."
    ],
    "explanation": "On peut planifier de courtes récupérations de mémoire espacées et sans assistance, puis vérifier avec une source fiable. La durée des intervalles dépend du contexte et des besoins. Cet exercice propose une méthode, il ne mesure pas la mémorisation différée.",
    "transfer": "Tu apprends deux notions proches et les confonds parfois. Propose un planning papier de deux rappels différés et une façon de vérifier que tu les distingues.",
    "review": [
      "As-tu prévu des tentatives de rappel sans aide ?",
      "As-tu prévu une vérification après chaque rappel ?",
      "As-tu laissé la possibilité d’adapter le rythme sans pénalité ?"
    ],
    "example": "J’écris deux questions différentes sur papier. Je réponds sans cours dans deux jours, puis quelques jours plus tard. Je compare mes réponses aux définitions, puis je retravaille seulement ce que j’ai confondu.",
    "offlineChallenge": "Programmes sur papier deux vérifications futures, sans rappel numérique obligatoire ni pénalité si tu changes d’avis."
  }
];