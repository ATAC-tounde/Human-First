// HUMAN FIRST - V0.4.1: human-authored offscreen micro-challenges.
// Demonstration prompts, NOT scientifically validated. Never expose before the independent transfer / recall is submitted.
// No personal data, analytics, scores, or completion status is collected.
const cards = {
  causalite: {
    fr: {title:'Dessiner une autre cause',materials:'Une feuille et un crayon',minutes:5,steps:['Imagine deux événements qui arrivent ensemble dans la vie quotidienne.','Dessine une troisième cause possible qui pourrait expliquer les deux.','Note une observation qui aiderait à départager les explications.'],check:'Peux-tu distinguer ce que tu observes de ce que tu supposes ?'},
    en: {title:'Sketch a different cause',materials:'Paper and pencil',minutes:5,steps:['Invent two everyday events that happen at the same time.','Draw a third factor that could explain both.','Write one observation that could help distinguish the explanations.'],check:'Can you separate observations from assumptions?'}
  },
  deduction: {
    fr: {title:'Des ensembles sur papier',materials:'Une feuille et un crayon',minutes:5,steps:['Dessine un grand cercle « véhicules » et un plus petit « vélos » à l’intérieur.','Dessine une zone « rouges » qui croise uniquement les véhicules hors du cercle « vélos ».','Explique pourquoi les prémisses restent vraies sans démontrer la conclusion.'],check:'Sais-tu produire un modèle où la conclusion ne suit pas ?'},
    en: {title:'Draw a set diagram',materials:'Paper and pencil',minutes:5,steps:['Draw a large “vehicles” circle with a smaller “bicycles” circle inside.','Draw a “red” region touching vehicles but not bicycles.','Explain why both premises can be true while the conclusion remains unproven.'],check:'Can you construct a model where the conclusion does not follow?'}
  },
  moyenne: {
    fr: {title:'Inventer des notes',materials:'Une feuille et un crayon',minutes:6,steps:['Écris les notes fictives de quatre personnes à deux moments différents.','Fais monter la moyenne entre les deux moments, tout en faisant baisser la note d’une personne.','Explique pourquoi une moyenne ne suffit pas à décrire les trajectoires individuelles.'],check:'As-tu vérifié les deux moyennes par le calcul ?'},
    en: {title:'Invent some scores',materials:'Paper and pencil',minutes:6,steps:['Write fictional scores for four people at two different times.','Make the average rise while one person’s score falls.','Explain why the mean cannot tell you what happened to every individual.'],check:'Did you calculate both averages to verify the example?'}
  },
  source: {
    fr: {title:'Le détective des affirmations',materials:'Une publicité ou un titre imprimé et un crayon',minutes:7,steps:['Choisis une affirmation non personnelle dans une publicité ou un titre.','Souligne ce qui est présenté comme un fait, puis écris la source qu’il faudrait retrouver.','Indique ce que tu ne peux pas conclure avec les informations disponibles.'],check:'As-tu choisi une conclusion proportionnée aux preuves ?'},
    en: {title:'Claim detective',materials:'A printed ad or headline and a pencil',minutes:7,steps:['Choose a non-personal claim from an ad or headline.','Underline what is presented as fact and name the original source you would need.','Write what cannot be concluded from the evidence provided.'],check:'Is your conclusion proportionate to the evidence?'}
  },
  planification: {
    fr: {title:'Un plan sans application',materials:'Un carnet et un crayon',minutes:5,steps:['Choisis une petite tâche réalisable hors écran.','Découpe-la en trois étapes et définis comment tu sauras qu’elle est terminée.','Réalise la première étape sans consulter d’assistant.'],check:'Ton plan repose-t-il sur un résultat vérifiable plutôt que sur un temps passé ?'},
    en: {title:'A plan without an app',materials:'Notebook and pencil',minutes:5,steps:['Choose a small task you can do offline.','Divide it into three steps and decide what completion would look like.','Do the first step without consulting an assistant.'],check:'Does your plan target a verifiable result rather than time spent?'}
  },
  contreexemple: {
    fr: {title:'Chercher la faille logique',materials:'Une feuille',minutes:5,steps:['Écris une phrase qui commence par « Tous les… ».','Imagine une situation possible où cette phrase serait fausse.','Explique ce qu’un cas imaginé démontre et ce qu’une observation réelle apporterait en plus.'],check:'As-tu évité de généraliser dans l’autre sens ?'},
    en: {title:'Find the logical gap',materials:'Paper',minutes:5,steps:['Write a sentence beginning “Every…”.','Imagine a possible situation in which that claim is false.','Explain the difference between an imagined case and an observed, verified counterexample.'],check:'Did you avoid making the opposite sweeping generalisation?'}
  },
  probabilites: {
    fr: {title:'Dessiner un taux de base',materials:'Une feuille quadrillée',minutes:8,steps:['Trace 100 cases : 5 représentent des objets défectueux et 95 des objets corrects.','Marque quatre détections vraies parmi les cinq objets défectueux et dix-neuf fausses alertes parmi les autres.','Compte les alertes et explique pourquoi leur proportion n’est pas la précision annoncée du test.'],check:'Distingues-tu nombre de cas réels et nombre d’alertes ?'},
    en: {title:'Draw a base rate',materials:'Squared paper',minutes:8,steps:['Draw 100 squares: 5 for faulty objects and 95 for good objects.','Mark four true detections among faulty objects and nineteen false alarms among good ones.','Count the alerts and explain why the share of correct alerts differs from the advertised sensitivity.'],check:'Can you distinguish actual cases from the number of alerts?'}
  },
  rappel: {
    fr: {title:'Expliquer sans écran',materials:'Une feuille et un crayon',minutes:5,steps:['Ferme cette page et note trois idées dont tu te souviens.','Crée un exemple inédit pour illustrer une de ces idées.','Plus tard, vérifie sur ton support ce que tu avais oublié.'],check:'Qu’as-tu pu retrouver sans recopier une explication ?'},
    en: {title:'Explain it without a screen',materials:'Paper and pencil',minutes:5,steps:['Close this page and write three ideas you can remember.','Invent a new example illustrating one idea.','Later, compare with your source to identify anything you missed.'],check:'What could you retrieve without copying an explanation?'}
  },
  decision: {
    fr: {title:'Mes critères, mon choix',materials:'Une feuille',minutes:7,steps:['Choisis une petite décision fictive, sans noter de données privées.','Définis trois critères importants et deux options possibles.','Explique quel compromis tu acceptes et quelle information supplémentaire tu vérifierais.'],check:'La décision vient-elle de tes propres critères ?'},
    en: {title:'My criteria, my decision',materials:'Paper',minutes:7,steps:['Choose a small fictional decision without noting private data.','List three priorities and two possible options.','Explain which trade-off you accept and one missing fact to check.'],check:'Does the decision follow your own criteria?'}
  }
};

export function offlineIds(){return Object.keys(cards);}
export function offlineCard(exerciseId,locale='fr') {
  const card=cards[exerciseId]?.[locale==='en'?'en':'fr'];
  return card?{...card,steps:[...card.steps]}:null;
}