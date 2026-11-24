// Original bilingual workshops. The same material is used in Journey, Studio and on paper.
const text = (fr, en) => ({fr, en});
const criterion = (id, label, guidance) => ({id, label, guidance});
const task = (scenario, question, criteria, transfer) => ({
  schema: 'hf.formative.task.v1', version: '1.0.0', scenario, question, criteria, transfer
});

const handover = {
  id: 'everyday.handover',
  title: text('Transmettre un savoir-faire', 'Pass on a practical skill'),
  outcome: text('Préparer une consigne qu’une autre personne peut essayer seule.', 'Write instructions another person can try on their own.'),
  tags: ['transmission', 'communication', 'teaching'], requires: [],
  assessment: task(
    text('Tu sais fabriquer un marque-page en pliant une feuille. Tu veux laisser les instructions à quelqu’un qui ne t’a jamais vu faire. Prends une feuille ou choisis un autre geste que tu connais bien.',
         'You can make a bookmark by folding a sheet of paper. You want to leave instructions for someone who has never seen you do it. Take a sheet of paper or choose another everyday skill you know well.'),
    text('Qu’écrirais-tu pour que cette personne puisse essayer, puis vérifier elle-même le résultat ?',
         'What would you write so the reader can try it and check the result independently?'),
    [criterion('starting-point', text('Le point de départ est clair.', 'The starting point is clear.'), text('Précise le matériel et sa position avant le premier geste.', 'Name what the reader needs and how to position it before the first step.')),
     criterion('visible-check', text('La personne peut vérifier le résultat.', 'The reader can check the result.'), text('Donne un détail qu’elle peut voir ou toucher à la fin.', 'Describe a detail the reader can see or feel when finished.'))],
    text('Transmets un autre geste courant à un adulte d’une autre génération. Demande-lui quelle étape il expliquerait autrement. En solo, reprends ta fiche demain.',
         'Teach a different everyday skill to an adult of another generation. Ask which step they would explain differently. If working alone, try your own instructions tomorrow.')
  ),
  activities: {
    think: text('Fais le geste une fois. Quel détail fais-tu par habitude et qu’une personne qui débute pourrait manquer ?', 'Do the task once. Which small action comes so naturally that you might leave it out when teaching a beginner?'),
    focus: text('Rédige trois étapes sur papier, puis suis-les à la lettre. Entoure le premier endroit où tu as dû deviner un geste.', 'Write three steps on paper and follow them literally. Circle the first point where you had to guess what to do.'),
    learn: text('Retourne la feuille. Explique de mémoire le point de départ, les gestes et un signe qui indique que le résultat est bon.', 'Turn the sheet over. From memory, explain the starting position, the actions and one sign that the task is complete.'),
    decide: text('Choisis entre ajouter un dessin, un détail de position ou un exemple. Modifie une seule étape et refais un essai.', 'Choose a sketch, a positioning detail or an example. Change just one step and try the instructions again.')
  }
};
const message = {
  id: 'everyday.message',
  title: text('Vérifier un message partagé', 'Check a forwarded message'),
  outcome: text('Décider quoi transmettre quand deux annonces semblent se contredire.', 'Decide what to pass on when two notices appear to disagree.'),
  tags: ['information', 'source', 'verification'], requires: [],
  assessment: task(
    text('Dans un groupe de voisins, une capture sans date annonce que le marché aura lieu vendredi. Une affiche signée par le comité du marché indique samedi 12 juin. Rien ne précise de quelle édition parle la capture.',
         'In a neighbourhood group, an undated screenshot says the market will take place on Friday. A poster signed by the market committee says Saturday 12 June. The screenshot does not say which edition it refers to.'),
    text('Quel message pourrais-tu envoyer aux voisins pendant que la date reste à confirmer ?', 'What could you tell your neighbours while the date is still being checked?'),
    [criterion('origin', text('J’ai identifié l’origine des annonces.', 'I identified where the notices came from.'), text('Qui a produit chaque annonce ? Qui l’a simplement relayée ?', 'Who produced each notice? Who just forwarded it?')),
     criterion('edition', text('J’ai vérifié si les annonces parlent du même marché.', 'I checked whether both notices refer to the same market date.'), text('Une date, un lieu et une édition aident à comparer les deux annonces.', 'A date, a place and an edition help you compare the two notices.'))],
    text('Prends un ancien programme de rencontre. Sur papier, marque ce qui resterait compréhensible si quelqu’un le retrouvait l’année prochaine.',
         'Take an old event programme. On paper, mark what would still make sense if someone found it next year.')
  ),
  activities: {
    think: text('Sur deux lignes, note ce qu’affirme chaque annonce. Souligne le détail qui manque pour savoir si elles parlent du même événement.', 'Write down what each notice claims on separate lines. Underline the detail you need to tell whether they refer to the same event.'),
    focus: text('Relis les deux annonces. Pour chacune, relève l’auteur, la date de l’événement et ce qui permettrait de joindre l’organisateur.', 'Reread both notices. For each, look for the author, the event date and a way to contact the organiser.'),
    learn: text('Cache les annonces. Explique à voix haute deux questions qui te permettraient de vérifier un autre message demain.', 'Cover the notices. Say aloud two questions you could use to check a different message tomorrow.'),
    decide: text('Rédige une phrase pour les voisins. Précise ce que tu sais, le point qui reste incertain et auprès de qui tu le vérifierais.', 'Write one sentence for your neighbours. Say what you know, what remains uncertain and who you would ask to check it.')
  }
};
const sharedSpace = {
  id: 'everyday.shared-space',
  title: text('Partager un lieu entre générations', 'Share a space across generations'),
  outcome: text('Proposer un essai réversible qui tient compte des personnes absentes de la discussion.', 'Propose a reversible trial that considers people who are absent from the discussion.'),
  tags: ['collectif', 'dialogue', 'community', 'future'], requires: [],
  assessment: task(
    text('Une salle de quartier est libre le samedi. Un groupe souhaite y accueillir un atelier de réparation, un autre veut un lieu calme pour lire. Les futurs usagers ne sont pas encore venus à la réunion. La salle peut être réservée pour quatre samedis d’essai.',
         'A community room is available on Saturdays. One group wants to run a repair workshop and another wants a quiet reading space. Future users have not yet attended the meeting. The room can be booked for a four-Saturday trial.'),
    text('Quel essai proposerais-tu et qu’aimerais-tu entendre avant de le reconduire ?', 'What trial would you propose and what would you want to hear before renewing it?'),
    [criterion('absent-voices', text('J’ai considéré une personne absente.', 'I considered someone absent from the meeting.'), text('Pense à une personne qui travaille le samedi matin ou qui découvre le quartier.', 'Think of someone who works Saturday mornings or has just moved to the neighbourhood.')),
     criterion('revisit', text('Le choix peut être réexaminé.', 'The group can revisit the decision.'), text('Indique quand recueillir les avis et ce qui pourrait faire changer le partage.', 'Say when to collect feedback and what could lead the group to change the arrangement.'))],
    text('Essaie la démarche pour un objet partagé, à la maison ou dans une association. Laisse une question écrite pour la prochaine personne qui l’utilisera.',
         'Try the same approach with a shared object at home or in a community group. Leave a written question for the next person to use it.')
  ),
  activities: {
    think: text('Nomme un besoin de chaque groupe et un besoin possible d’une personne absente. Lequel faudrait-il vérifier auprès d’elle ?', 'Name one need for each group and one possible need of someone absent. Which assumption would you check with that person?'),
    focus: text('Dessine quatre cases pour les quatre samedis. Essaie deux répartitions et repère qui aurait du mal à participer à chacune.', 'Draw four boxes for the four Saturdays. Try two schedules and identify who might struggle to take part in each.'),
    learn: text('Sans relire, présente les deux options à quelqu’un, ou à voix haute. Peux-tu expliquer la préférence de chaque groupe avec ses propres raisons ?', 'Without looking back, describe the two options to someone or aloud. Can you explain each group’s preference in terms they might use?'),
    decide: text('Choisis une répartition à l’essai. Fixe le moment du bilan et écris une question qui aiderait les prochains usagers à la faire évoluer.', 'Choose a trial schedule. Set a time to review it and write one question that would help future users improve the arrangement.')
  }
};

export const everydayPack = {
  id: 'everyday', version: '1.0.0',
  title: text('Ateliers du quotidien', 'Everyday workshops'),
  competencies: [handover, message, sharedSpace],
  pathways: [{
    id: 'everyday.together', title: text('Apprendre et transmettre au quotidien', 'Learn and share everyday skills'),
    summary: text('Transmettre un geste, vérifier une annonce et décider ensemble de l’usage d’un lieu.', 'Pass on a skill, check a notice and decide together how to use a shared space.'),
    competencyIds: [handover.id, message.id, sharedSpace.id], audiences: ['personal', 'teaching']
  }]
};
