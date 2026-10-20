# HUMAN FIRST V1.0 alpha - Évaluations formatives, preuves réflexives et continuité

## Objectif
L'acquisition d'une compétence ne se résume pas au diplôme, à l'âge ni à une impression de maîtrise. La V1.0 ajoute des **tâches formatives rédigées par des humains**, distinctes des exercices déjà proposés, avec question ouverte et critères qualitatifs. Aucun score, classement ou diagnostic psychométrique n'est calculé.

## Architecture
- `public/journey/assessment.mjs` : schéma `hf.formative.task.v1`, validation FR/EN, 2 à 6 critères non notés, cas de transfert, quatre démonstrateurs originaux, observations `hf.formative.observation.v1`.
- `public/journey/engine.mjs` : champ facultatif `competency.assessment` pour tous les packs existants ou futurs, validé lors de la création du registre, et transport contrôlé des observations sans texte de réponse.
- `public/studio/app.mjs` : éditeur facultatif des situations, questions, transfert et critères (tableau JSON), contrôle structurel par le moteur commun ; l'expert métier conserve la responsabilité éditoriale et de licence.
- `public/journey/app.mjs` : tâche privée, tentative libre, révélation des critères après action volontaire, coche qualitative et enregistrement déclaratif. Le contenu du champ libre reste dans le navigateur, disparaît à la fermeture de l'atelier et n'est **jamais** inclus dans un export.
- `hf.portfolio.v1` : le champ **facultatif** `formative` permet le transfert de métadonnées déclaratives pour les versions précédentes du portfolio (compatibilité sans rupture).

## Sémantique de l'évaluation
Une observation représente une **réflexion personnelle**, pas une performance objectivement évaluée. Données autorisées : identifiant de compétence, version de tâche, date et IDs des critères cochés. Champs forcés : `source=self-reflection`, `certification=none`, `conclusion=not-assessed`. Tous les autres attributs sont ignorés à l'export. Pour une évaluation reconnue, il faudra un référentiel de critères et preuves observables, vérification humaine, identité vérifiable, droit de contestation, et gouvernance distincte.

La grille d'auto-vérification est contenue dans les modules JS publics. **Il ne faut donc jamais présenter ces ateliers comme examens sécurisés**, ni prétendre que leur corrigé est techniquement inaccessible.

## Contenus et extensibilité
Les quatre démonstrateurs portent sur la vérification des affirmations, la causalité, la restitution et la clarification des exigences. Tout pack validé peut contenir une évaluation formative bilingue, sans modifier le moteur, ou n'en contenir aucune. Les autres compétences restent accessibles et aucun parcours n'est bloqué.

## Vie privée / publics
- Aucun compte, requête réseau des réponses, stockage persistant ou décision automatique sur les aptitudes. Seules des ressources statiques sont chargées par le navigateur.
- Le portfolio JSON est exporté exclusivement à la demande, avec une auto-observation; il peut contenir des informations personnelles choisies dans le profil. Il ne fait pas foi comme diplôme.
- Périmètre 18+ ; pas de déploiement aux mineurs sans travail sur les droits, consentements et la protection des publics.

## Vérifications avant fusion
Exécuter `npm run check`. Dans `/journey`, choisir « Fondamentaux du raisonnement », ouvrir un atelier, rédiger une réponse, révéler les critères, noter une auto-réflexion, exporter : **aucune trace de la réponse rédigée dans le JSON**. Importer l'export et vérifier que le nombre d'observations est repris, changer de langue puis recommencer. Dans `/studio`, concevoir une compétence à activité formative, valider, faire une revue et exporter un pack JSON. Réimporter ce pack dans JOURNEY.

Les tests Node sont nécessaires mais non suffisants : vérifier clavier, zoom 200 %, lecteur d'écran, Firefox/Chromium et responsive en conditions réelles. Le blocage précédent du Container Registry Vercel doit être résolu pour permettre la recette Preview. **Aucune migration de base de données** n'est effectuée par cette PR.


## Continuité des acquis entre versions de référentiels

La V1.0 inclut `public/journey/continuity.mjs` avec un **plan de migration explicite** : une table JSON associe, sans approximation, les anciens IDs de parcours/compétences aux nouveaux IDs validés par le référentiel actuellement chargé. Un format d'exemple :

```json
{
  "schema":"hf.portfolio.aliases.v1",
  "fromCatalogVersion":"core@0.7.0|study@1.0.0|work@1.0.0|life@1.0.0",
  "toCatalogVersion":"core@1.0.0|study@1.0.0|work@1.0.0|life@1.0.0",
  "competencies":[{"from":"core.old-evidence","to":"core.evidence"}],
  "pathways":[{"from":"core.old-foundations","to":"core.foundations"}]
}
```

Un auteur ou éditeur doit **justifier sémantiquement** chaque équivalence avant de diffuser sa table. La V1.0 ne cherche jamais un équivalent automatiquement et refuse les chaînes, collisions, destinations inconnues et versions non concordantes. Si une observation ne peut pas être réconciliée, **tout l'import est refusé**, sans supprimer silencieusement les données ni changer le fichier original. Les versions de tâches formatives restent contrôlées, et une nouvelle tâche exige une nouvelle auto-réflexion.

Dans JOURNEY, l'apprenant peut charger facultativement ce JSON dans « Table d’équivalences » puis importer son ancien portfolio. Tout fonctionne localement, sans requête et sans conservation en dehors de l'onglet. Recharger d'abord le pack externe correspondant si les référentiels ont changé. L'ancienne importation sans table fonctionne comme auparavant.
