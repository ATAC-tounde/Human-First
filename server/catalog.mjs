import {englishExercises} from './catalog.en.mjs';
// Documents de démonstration : ils ne constituent PAS des contenus validés pour la recherche.
// Les solutions et les items de transfert restent dans le module serveur uniquement.
export const catalog = Object.freeze([
  {
    id: 'causalite', version: 'demo-0.1', status: 'demonstration',
    title: 'Cause ou coïncidence ?', category: 'Esprit critique', duration: 8,
    level: 'Découverte',
    introduction: 'Une observation suffit-elle pour affirmer qu’un événement en a provoqué un autre ?',
    prompt: 'Dans une ville, les notes moyennes des élèves ont augmenté après l’installation de nouveaux espaces de travail. Peut-on conclure que ces espaces ont causé cette hausse ? Explique ton raisonnement.',
    guide: 'Quelles informations te permettraient de distinguer une coïncidence d’une cause ?',
    hints: [
      'Imagine qu’un autre changement ait eu lieu au même moment.',
      'Quel groupe pourrait servir de comparaison ? Que se serait-il peut-être passé sans les nouveaux espaces ?'
    ],
    explanation: 'Non, la simple succession des événements ne suffit pas à démontrer une relation causale. D’autres facteurs peuvent avoir influencé les notes : enseignement, composition des classes ou ressources disponibles. Il faudrait des données supplémentaires et une comparaison rigoureuse.',
    transfer: 'Après l’ouverture d’une bibliothèque, les inscriptions à l’université augmentent dans une ville. Peut-on affirmer que la bibliothèque est la cause de cette augmentation ? Justifie et propose une vérification.',
    review: [
      'As-tu distingué corrélation temporelle et causalité ?',
      'As-tu envisagé d’autres explications ?',
      'As-tu proposé une comparaison ou des données complémentaires ?'
    ],
    example: 'On ne peut pas conclure à un lien causal avec cette seule observation. D’autres facteurs ont pu évoluer au même moment. Je comparerais par exemple la tendance avant et après l’ouverture avec celle de villes similaires.'
  },
  {
    id: 'deduction', version: 'demo-0.1', status: 'demonstration',
    title: 'Ce qui suit… ou non', category: 'Raisonnement logique', duration: 7,
    level: 'Découverte',
    introduction: 'Une conclusion séduisante est-elle forcément déductible des prémisses ?',
    prompt: 'Tous les vélos sont des véhicules. Certains véhicules sont rouges. Peut-on en déduire que certains vélos sont rouges ? Explique pourquoi.',
    guide: 'Que signifie exactement le mot « certains » dans la deuxième phrase ?',
    hints: [
      'Les véhicules rouges pourraient-ils être uniquement des voitures ?',
      'Essaie de construire un exemple où les deux phrases sont vraies, mais où aucun vélo n’est rouge.'
    ],
    explanation: 'Non. Les vélos appartiennent à l’ensemble des véhicules, mais les véhicules rouges mentionnés peuvent appartenir à une autre catégorie. Pour établir la conclusion, il faudrait une information reliant directement les vélos à la couleur rouge.',
    transfer: 'Tous les chats sont des mammifères. Certains mammifères vivent dans l’eau. Peut-on en conclure que certains chats vivent dans l’eau ? Justifie.',
    review: [
      'As-tu évité une conclusion qui dépasse les prémisses ?',
      'As-tu distingué « tous » de « certains » ?',
      'As-tu donné un contre-exemple ou expliqué le chaînon manquant ?'
    ],
    example: 'Non, car les mammifères qui vivent dans l’eau pourraient être uniquement des dauphins ou des baleines. Rien ne relie dans les prémisses les chats à cette propriété.'
  },
  {
    id: 'moyenne', version: 'demo-0.1', status: 'demonstration',
    title: 'Les chiffres racontent-ils tout ?', category: 'Interprétation des données', duration: 8,
    level: 'Découverte',
    introduction: 'Un chiffre moyen décrit-il nécessairement chaque individu ?',
    prompt: 'La note moyenne d’une classe passe de 12/20 à 14/20 entre deux contrôles. Peut-on affirmer que tous les élèves ont progressé ? Pourquoi ?',
    guide: 'Une moyenne parle-t-elle de chaque élève ou de l’ensemble du groupe ?',
    hints: [
      'Peut-on imaginer qu’une partie de la classe progresse beaucoup, tandis que d’autres élèves régressent ?',
      'Quelles données individuelles faudrait-il comparer pour savoir si tous ont progressé ?'
    ],
    explanation: 'Non. Une moyenne peut augmenter alors que certains élèves stagnent ou voient leurs résultats baisser. Pour savoir si tous ont progressé, il faudrait comparer les notes de chaque élève entre les deux contrôles, en tenant aussi compte des différences éventuelles entre les évaluations.',
    transfer: 'Le temps moyen de trajet domicile-travail dans une entreprise diminue de 40 à 30 minutes. Peut-on affirmer que chaque salarié gagne du temps ? Explique quelles données seraient utiles.',
    review: [
      'As-tu expliqué la différence entre moyenne et valeurs individuelles ?',
      'As-tu envisagé des situations différentes parmi les personnes ?',
      'As-tu identifié les données nécessaires pour conclure ?'
    ],
    example: 'Non, une baisse de la moyenne ne signifie pas que chacun gagne du temps. Il faudrait disposer des durées avant et après pour chaque salarié et vérifier que les populations comparées sont identiques.'
  }
]);

export function localizeExercise(exercise, locale = 'fr') {
  if (locale !== 'en') return exercise;
  return {...exercise, ...(englishExercises[exercise.id] || {})};
}
export function publicCatalog(locale = 'fr') {
  return catalog.filter(x => x.status === 'demonstration').map(original => {
    const {id, version, title, category, duration, level, introduction} = localizeExercise(original, locale);
    return {id, version, title, category, duration, level, introduction};
  });
}
export function getExercise(id) {return catalog.find(x => x.id === id && x.status === 'demonstration') ?? null;}
export function publicTraining(exercise) {
  const {id, version, title, category, introduction, prompt} = exercise;
  return {id, version, title, category, introduction, prompt};
}
