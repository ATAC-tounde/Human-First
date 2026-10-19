// Original educational demonstration content. NOT scientifically validated assessment material.
// Never send feedback, transfer task, or answer keys with the public syllabus or early stages.
const lessons = [
  {
    id:'evidence',domain:'critical',tier:1,duration:9,prerequisites:[],
    fr:{title:'Distinguer une preuve d’une opinion',summary:'Passer d’une affirmation à une question vérifiable.',objective:'Identifier ce qui peut être vérifié et les preuves qui manquent.',
      sections:[{heading:'Une phrase, plusieurs fonctions',text:'« Cette méthode est la meilleure » exprime une appréciation tant que les critères ne sont pas définis. « Dans ce test, 14 personnes sur 20 ont réussi » décrit une mesure annoncée qu’il faut encore vérifier.'},{heading:'Une preuve a une provenance',text:'Demande qui a recueilli les données, comment elles ont été obtenues et dans quelles conditions. Une source reconnue peut aussi se tromper ; sa méthode compte.'},{heading:'Rendre l’affirmation testable',text:'Remplace les mots vagues (« meilleur », « efficace ») par des critères observables, une population, une période et une comparaison. Une seule observation ne suffit pas toujours.'}],
      recall:'Sans relire : comment distinguer une opinion d’une affirmation vérifiable ? Donne un exemple de question que tu poserais à une source.',
      feedback:'Une opinion exprime une appréciation ; une affirmation empirique peut être confrontée à des observations. Pour juger cette dernière, on vérifie la source, la définition des termes, la méthode et les limites. Une affirmation vérifiable n’est pas automatiquement vraie.',
      rubric:['Ai-je distingué jugement de valeur et observation ?','Ai-je proposé un critère mesurable ?','Ai-je demandé d’où viennent les données ?'],
      transfer:'Une affiche affirme : « Notre cours rend tous les élèves plus autonomes. » Quelles informations demanderais-tu pour transformer cette promesse en hypothèse vérifiable ?',
      transferReference:'Je définirais « autonome » au moyen de tâches effectuées sans aide, puis demanderais la méthode, le groupe de comparaison, la période et les variations entre participants.',
      offline:'Sur une feuille, choisis une publicité et sépare ses jugements de valeur de ses affirmations vérifiables.'},
    en:{title:'Evidence or opinion?',summary:'Turn a strong claim into a testable question.',objective:'Recognise what can be checked and what evidence is missing.',
      sections:[{heading:'One sentence, different roles',text:'“This method is the best” expresses a judgement until the criteria are defined. “In this test, 14 out of 20 participants succeeded” reports a measurement that still needs verification.'},{heading:'Evidence has a source',text:'Ask who collected the data, how it was gathered and under what conditions. Even a reputable source can be wrong; its methods matter.'},{heading:'Make a claim testable',text:'Replace vague terms (“best”, “effective”) with observable criteria, a population, a period and a comparison. One observation may not be enough.'}],
      recall:'Without rereading, distinguish an opinion from a verifiable statement. Suggest one question you would ask about a source.',
      feedback:'An opinion conveys a judgement; an empirical claim can be checked against observations. Evaluate its source, operational definitions, method and limitations. Being testable does not make a claim true.',
      rubric:['Did I separate judgements from observations?','Did I suggest a measurable criterion?','Did I ask where the data came from?'],
      transfer:'An advert states: “Our course makes every student more independent.” What would you ask to make this promise a testable hypothesis?',
      transferReference:'I would define independence using tasks completed unaided, then ask for the method, comparison group, time period and differences across participants.',
      offline:'On paper, choose an advertisement and separate value judgements from checkable claims.'}
  },
  {
    id:'causality',domain:'critical',tier:2,duration:10,prerequisites:['evidence'],
    fr:{title:'Quand deux choses évoluent ensemble',summary:'Ne pas confondre coïncidence et explication.',objective:'Proposer au moins deux explications possibles à une association.',
      sections:[{heading:'Observer n’est pas expliquer',text:'Deux variables peuvent augmenter ensemble sans que l’une cause l’autre. Une troisième variable peut agir sur les deux ; la direction de causalité peut aussi être inversée.'},{heading:'Questionner la comparaison',text:'Demande ce qui aurait pu se passer sans l’intervention. Compare si possible avec une situation proche, tout en vérifiant les autres changements.'},{heading:'Conserver les limites',text:'Une expérience ou une étude d’observation ne répond pas forcément à toutes les questions. La prudence sur les conclusions est une force du raisonnement.'}],
      recall:'De mémoire, quelles sont deux autres explications possibles lorsque deux événements se produisent au même moment ?',
      feedback:'La coïncidence temporelle, un facteur tiers, une causalité inverse ou le hasard peuvent expliquer une association. Une conclusion causale demande une méthode adaptée, une comparaison et une évaluation des limites.',
      rubric:['Ai-je évité de déduire une cause de la seule succession ?','Ai-je envisagé au moins une variable supplémentaire ?','Ai-je proposé une comparaison pertinente ?'],
      transfer:'Après l’installation de nouveaux bancs publics, les commerces d’une rue vendent davantage. Comment vérifier si les bancs ont contribué à la hausse ?',
      transferReference:'Je vérifierais la tendance antérieure, les travaux et événements concomitants, et comparerais des rues similaires sans nouveaux bancs. Même ainsi, je garderais les limites de la comparaison.',
      offline:'Observe deux phénomènes qui varient ensemble dans ton quotidien et écris trois explications différentes possibles.'},
    en:{title:'When two things change together',summary:'Separate coincidence from explanation.',objective:'Suggest two possible explanations for an association.',
      sections:[{heading:'Observation is not explanation',text:'Two variables can increase together without one causing the other. A third factor may affect both; causation could even run in the opposite direction.'},{heading:'Ask about comparisons',text:'Consider what might have happened without the intervention. Compare similar situations while checking other concurrent changes.'},{heading:'Keep the limitations visible',text:'Experiments and observational studies do not always settle every uncertainty. Qualified conclusions are part of careful reasoning.'}],
      recall:'From memory, give two alternative explanations when two events happen at the same time.',
      feedback:'Timing, a third factor, reverse causation or chance can explain an association. A causal claim requires suitable methods, comparisons and a discussion of limits.',
      rubric:['Did I avoid deriving causation from sequence alone?','Did I consider another factor?','Did I propose a useful comparison?'],
      transfer:'After a street gets new public benches, nearby shops sell more. How would you check whether the benches contributed to the increase?',
      transferReference:'I would look at earlier trends, concurrent roadworks or events, and similar streets without new benches, while keeping the comparison limits in mind.',
      offline:'Notice two things that vary together in daily life. Write three different explanations on paper.'}
  },
  {
    id:'averages',domain:'data',tier:1,duration:8,prerequisites:[],
    fr:{title:'La moyenne ne raconte pas tout',summary:'Distinguer un résultat global des cas individuels.',objective:'Expliquer ce que la moyenne ne permet pas de conclure.',
      sections:[{heading:'Une synthèse, pas une photographie',text:'La moyenne de 4, 4 et 10 vaut 6. Elle ne décrit aucun des trois individus : résumer un groupe ne suffit pas à connaître chaque personne.'},{heading:'Regarder la dispersion',text:'Deux groupes peuvent partager la même moyenne tout en ayant des valeurs très différentes. Cherche les valeurs minimales, maximales, la médiane ou les données individuelles.'},{heading:'Faire attention aux groupes',text:'Comparer deux moyennes à des dates différentes suppose aussi de comprendre si la composition des groupes et les conditions de mesure ont changé.'}],
      recall:'Sans relire, explique en une phrase pourquoi une moyenne qui augmente ne signifie pas que tous les résultats ont augmenté.',
      feedback:'Une moyenne est un indicateur de groupe. Elle peut augmenter malgré une baisse pour certaines personnes, par exemple si d’autres progressent beaucoup. La dispersion et la comparabilité des groupes restent importantes.',
      rubric:['Ai-je distingué groupe et individu ?','Ai-je envisagé des changements inégaux ?','Ai-je demandé les données individuelles ?'],
      transfer:'Deux classes ont toutes deux 13/20 de moyenne. Peut-on affirmer qu’elles ont la même répartition de notes ? Quelle information te manque ?',
      transferReference:'Non : 13,13,13 et 8,13,18 donnent tous deux une moyenne de 13. Les distributions et la dispersion sont nécessaires pour comparer les classes.',
      offline:'Invente deux listes de trois nombres ayant la même moyenne, mais des valeurs très différentes.'},
    en:{title:'An average is not the whole story',summary:'Separate a group summary from individual outcomes.',objective:'Explain what an average does not establish.',
      sections:[{heading:'A summary, not a portrait',text:'The mean of 4, 4 and 10 is 6. This number describes none of those three people. A group summary is not an individual account.'},{heading:'Inspect the spread',text:'Groups with the same mean can have very different values. Look for a range, median or individual data.'},{heading:'Check who was counted',text:'Comparing averages over time also requires knowing whether group membership and measurement conditions changed.'}],
      recall:'Without rereading, explain why a higher average does not imply every individual result increased.',
      feedback:'A mean describes a group. It can rise even when some people decline if others improve substantially. Data spread and group comparability also matter.',
      rubric:['Did I distinguish group from individual?','Did I consider unequal changes?','Did I ask for individual observations?'],
      transfer:'Two classes both have a mean score of 13/20. Must their grades be distributed the same way? What information is missing?',
      transferReference:'No. The lists 13,13,13 and 8,13,18 both average 13, but the distribution differs. We need more than the mean.',
      offline:'Invent two lists of three numbers with the same average but very different values.'}
  },
  {
    id:'base-rate',domain:'data',tier:3,duration:12,prerequisites:['averages'],
    fr:{title:'Raisonner avec les taux de base',summary:'Interpréter une alerte en tenant compte de la rareté.',objective:'Comparer vrais signaux et fausses alertes à partir d’effectifs.',
      sections:[{heading:'Commencer par 1 000 cas',text:'Si 1 % d’un ensemble de 1 000 objets présente un défaut, 10 objets sont défectueux et 990 sont corrects.'},{heading:'Appliquer les deux taux',text:'Un contrôle détectant 90 % des défauts en signale environ 9. S’il signale à tort 10 % des objets corrects, cela ajoute environ 99 fausses alertes.'},{heading:'Interpréter les alertes',text:'Sur environ 108 alertes, 9 sont justifiées. Cette proportion dépend du taux de base et des performances du contrôle, pas seulement du taux de détection.'}],
      recall:'De mémoire, pourquoi une alerte peut-elle être peu fiable même si le contrôle repère la plupart des cas réellement positifs ?',
      feedback:'Quand un événement est rare, le groupe des cas négatifs peut produire beaucoup de fausses alertes. Il faut combiner la fréquence initiale, le taux de détection et le taux de faux positifs.',
      rubric:['Ai-je compté les cas positifs et négatifs au départ ?','Ai-je calculé séparément vraies et fausses alertes ?','Ai-je vérifié la proportion parmi toutes les alertes ?'],
      transfer:'Sur 100 objets dont 5 sont défectueux, un test repère 80 % des défauts et classe à tort 20 % des objets corrects comme défectueux. Estime les vraies et fausses alertes.',
      transferReference:'Il y a 5 objets défectueux : environ 4 vraies alertes. Il y a 95 objets corrects : environ 19 fausses alertes. Le total est proche de 23 alertes, dont 4 véritables.',
      offline:'Dessine un tableau de 100 cases et répartis les objets corrects, défectueux, détectés et faussement signalés.'},
    en:{title:'Reason with base rates',summary:'Interpret an alert in light of how rare an event is.',objective:'Compare true detections and false alerts using counts.',
      sections:[{heading:'Start with 1,000 cases',text:'If 1% of 1,000 objects are faulty, 10 objects are faulty while 990 are fine; these two groups have very different sizes.'},{heading:'Apply both rates',text:'A check that detects 90% of faults flags around 9 of them. If it wrongly flags 10% of good objects, it adds around 99 false alarms.'},{heading:'Interpret the alerts',text:'Of roughly 108 alerts, 9 are justified. This share depends on the base rate and the test properties, not only on its detection rate.'}],
      recall:'From memory, why might an alert often be wrong even when the system catches most genuinely positive cases?',
      feedback:'When an event is rare, the much larger negative group may generate many false alerts. Combine prevalence, detection rate and false-positive rate.',
      rubric:['Did I count positive and negative cases first?','Did I estimate real detections and false alerts separately?','Did I compare real detections with all alerts?'],
      transfer:'Among 100 objects, 5 are faulty. A test finds 80% of faults but wrongly flags 20% of good objects. Estimate true detections and false alerts.',
      transferReference:'Of 5 faulty items, around 4 are detected. Of 95 good items, about 19 are wrongly flagged. So around 4 of 23 alerts indicate a fault.',
      offline:'Draw 100 squares and label good items, faulty items, true detections and false alerts.'}
  },
  {
    id:'retrieve',domain:'learning',tier:1,duration:8,prerequisites:[],
    fr:{title:'Retrouver plutôt que relire',summary:'Faire l’expérience de la restitution volontaire.',objective:'Formuler une connaissance avec ses propres mots sans ouvrir sa source.',
      sections:[{heading:'Familiarité et restitution',text:'Relire plusieurs fois peut donner une impression de facilité. Essayer d’expliquer sans le texte révèle ce que l’on arrive réellement à retrouver.'},{heading:'La boucle simple',text:'Lis un court passage, ferme-le, note ce que tu retiens, puis compare ton souvenir avec une version de référence. Cherche ce qui manque plutôt qu’une note.'},{heading:'Une méthode, pas une garantie',text:'Les besoins et résultats varient selon la personne et le contexte. Une séance ne prouve pas une amélioration durable ; les révisions différées peuvent aider à vérifier ce qui reste.'}],
      recall:'Sans consulter le texte, raconte les trois étapes d’une restitution active et explique ce qu’elle te permet de vérifier.',
      feedback:'On étudie un contenu, on le ferme, on tente de restituer les idées de mémoire puis on compare à une référence. Ce retour aide à repérer les idées oubliées ou déformées sans faire de diagnostic.',
      rubric:['Ai-je essayé sans regarder le support ?','Ai-je comparé avec un exemple de référence ?','Ai-je identifié une idée à revoir ?'],
      transfer:'Tu dois retenir les points importants d’une courte réunion. Comment utiliserais-tu la restitution active sans conserver d’informations confidentielles ?',
      transferReference:'Après la réunion, je noterais de mémoire les décisions non sensibles et prochaines étapes, puis je confronterais ce résumé à mes notes autorisées pour détecter les oublis.',
      offline:'Lis une page non sensible d’un livre, ferme-la et explique les trois idées essentielles à voix haute.'},
    en:{title:'Recall rather than reread',summary:'Try to retrieve ideas in your own words.',objective:'Explain a concept without reopening its source.',
      sections:[{heading:'Familiarity and retrieval',text:'Repeated reading can feel easy. Explaining a concept without the text reveals what you can actually remember.'},{heading:'A simple loop',text:'Read a short passage, close it, write what you remember, then compare your recall with a reference. Look for gaps instead of a score.'},{heading:'A method, not a guarantee',text:'Needs and outcomes vary. One session does not prove a lasting benefit; later reviews can help reveal what remains accessible.'}],
      recall:'Without rereading, describe the three steps of active retrieval and what the process helps you check.',
      feedback:'Study, close the material, retrieve from memory, and compare with a reference. The comparison can reveal missing or distorted ideas without diagnosing ability.',
      rubric:['Did I try without looking at the source?','Did I compare with a reference?','Did I spot an idea to revisit?'],
      transfer:'You need to remember the key points of a short meeting. How might you use retrieval without storing confidential information?',
      transferReference:'After the meeting, I would recall non-sensitive decisions and next steps, then compare with my permitted notes to identify omissions.',
      offline:'Read one non-sensitive book page, close it, and explain the three key ideas aloud.'}
  },
  {
    id:'choices',domain:'agency',tier:2,duration:11,prerequisites:['evidence'],
    fr:{title:'Choisir sans se laisser guider',summary:'Évaluer des options avec ses propres critères.',objective:'Exprimer des compromis et des inconnues avant une décision.',
      sections:[{heading:'Commencer par son intention',text:'Une recommandation n’est pas une décision. Avant de comparer, écris ce qui compte pour toi : coût, confidentialité, facilité d’usage, temps et possibilité de revenir en arrière.'},{heading:'Comparer des compromis',text:'Une option peut coûter moins cher et recueillir davantage de données. Une autre peut être moins pratique et plus protectrice. Un arbitrage explicite vaut mieux qu’un classement opaque.'},{heading:'Vérifier les inconnues',text:'Demande ce que la recommandation ne sait pas, comment les avantages sont mesurés et si un essai limité est possible. Évite de déléguer un choix important sans contrôle.'}],
      recall:'Sans relire, donne trois questions à poser avant d’adopter une recommandation IA importante.',
      feedback:'Définis tes critères, vérifie les sources et les compromis, puis cherche les informations manquantes. Une recommandation éclaire le choix sans te retirer la responsabilité de décider.',
      rubric:['Ai-je identifié mes propres priorités ?','Ai-je considéré au moins un compromis ?','Ai-je défini une vérification avant de choisir ?'],
      transfer:'Un service gratuit collecte beaucoup de données ; un service payant fonctionne hors connexion. Comment déciderais-tu en tenant compte de ta situation ?',
      transferReference:'Je définirais mes usages et mon budget, examinerais les règles de données et vérifierais si un essai ou un changement ultérieur reste possible. Le bon choix dépend des besoins.',
      offline:'Sur une feuille, compare deux solutions possibles à un problème quotidien, avec trois critères choisis par toi.'},
    en:{title:'Choose with your own judgment',summary:'Evaluate options using criteria you define.',objective:'Express trade-offs and unknowns before choosing.',
      sections:[{heading:'Start with your intention',text:'A recommendation is not a decision. Before comparing options, list what matters to you: cost, privacy, ease of use, time and reversibility.'},{heading:'Compare trade-offs',text:'One option may cost less but collect more data. Another may be less convenient and more protective. Explicit trade-offs are better than opaque rankings.'},{heading:'Check the unknowns',text:'Ask what a recommendation does not know, how advantages were measured and whether you can try a limited experiment. Keep control over important choices.'}],
      recall:'Without rereading, suggest three questions to ask before following an important AI recommendation.',
      feedback:'Define your criteria, examine evidence and trade-offs, and identify missing information. A recommendation can inform your decision without taking away responsibility.',
      rubric:['Did I name my priorities?','Did I consider a trade-off?','Did I propose a way to verify before choosing?'],
      transfer:'A free service collects substantial data; a paid one works offline. How would you decide based on your situation?',
      transferReference:'I would list my needs and budget, investigate data policies and ask whether I can trial or switch services. The right choice depends on the user.',
      offline:'On paper, compare two possible solutions to an everyday problem using three criteria of your choice.'}
  }
];
function localeOf(lang){return lang==='en'?'en':'fr';}
export function lessonIds(){return lessons.map(l=>l.id);}
export function getLesson(id,lang='fr'){
 const lesson=lessons.find(l=>l.id===id);
 return lesson?{id:lesson.id,version:'demo-0.6',status:'demonstration',domain:lesson.domain,tier:lesson.tier,duration:lesson.duration,
  prerequisites:[...lesson.prerequisites],locale:localeOf(lang),...lesson[localeOf(lang)]}:null;
}
export function syllabus(lang='fr'){
 return lessons.map(l=>{const x=l[localeOf(lang)];return {id:l.id,version:'demo-0.6',domain:l.domain,tier:l.tier,duration:l.duration,prerequisites:[...l.prerequisites],title:x.title,summary:x.summary,objective:x.objective};});
}
export function lessonForStage(lesson,stage){
 const base={id:lesson.id,version:lesson.version,domain:lesson.domain,tier:lesson.tier,locale:lesson.locale,
 title:lesson.title,objective:lesson.objective,stage};
 if(stage==='learn-study')return {...base,sections:lesson.sections};
 if(stage==='learn-recall')return {...base,recall:lesson.recall};
 if(stage==='learn-feedback')return {...base,recall:lesson.recall,feedback:lesson.feedback,rubric:lesson.rubric};
 if(stage==='learn-apply')return {...base,transfer:lesson.transfer};
 if(stage==='learn-finished')return {...base,transfer:lesson.transfer,transferReference:lesson.transferReference,offline:lesson.offline,rubric:lesson.rubric};
 return base;
}