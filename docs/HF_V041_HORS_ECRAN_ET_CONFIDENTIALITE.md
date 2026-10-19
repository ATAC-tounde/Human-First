# HUMAN FIRST - V0.4.1 alpha - Transfert hors écran et isolation des brouillons

**Statut : démonstration pour adultes, non validée scientifiquement.**

## Hypothèse pédagogique

Le produit doit encourager une activité intellectuelle autonome après une séance, y compris loin de l'écran. Cette version offre une tâche courte, imprimable, sans progression obligatoire, minuteur, points, séries ni notifications. Une activité proposée n'est **pas** une preuve d'effet sur l'attention ou la mémoire.

## Parcours cible

1. Choix libre parmi neuf exercices FR/EN.
2. Tentative -> indices gradués -> explication -> transfert **sans aide**.
3. Après soumission du transfert (y compris le choix explicite de passer), affichage de trois étapes concrètes, durée indicative de 5-8 minutes et une question d'auto-vérification.
4. Possibilité d'imprimer la fiche, de quitter immédiatement, ou de proposer une date facultative de rappel.
5. Lors de la restitution différée, l'activité hors écran apparaît **après** soumission de la réponse, jamais pendant la restitution.

Les neuf cartes ont été rédigées pour le prototype : raisonnement causal, ensembles logiques, moyenne, vérification d'affirmations, planification, contre-exemples, taux de base, rappel actif et décision argumentée. Les exemples ne contiennent pas de tâches exigeant l'usage d'un site, d'un téléphone ou de données personnelles.

## Garantie de non-divulgation

- `GET /api/catalog`, `GET /api/paths`, `POST /api/session/start`, `POST /api/session/hint`, `POST /api/session/transfer` et `POST /api/session/recall/start` ne révèlent pas les fiches hors écran.
- `POST /api/session/answer` et `POST /api/session/recall/answer` renvoient la fiche après la réponse ou un passage volontaire.
- La carte n'est pas transmise au fournisseur IA ; la clé IA reste facultative et désactivée par défaut.
- L'interface fabrique ses éléments de liste avec `textContent`, pas avec `innerHTML`.

## Isolation des brouillons entre onglets

Les cookies HttpOnly portent l'état chiffré du parcours. Les réponses libres restent dans le `sessionStorage` de l'onglet, non dans ces cookies. Or, des onglets peuvent partager le cookie de session d'origine.

Depuis ce lot, l'API expose un `sessionId` aléatoire **non secret**, différent à chaque nouveau parcours. Chaque brouillon local stocke ce même identifiant. Lors de l'actualisation, un brouillon dont l'identifiant diffère de celui de la session en cours n'est jamais restauré. `sessionId` n'accorde aucun accès : seule l'authentification HttpOnly chiffrée fait foi.

**Limitation restante** : l'effacement du cookie n'est pas une révocation côté serveur, et `sessionStorage` peut subsister jusqu'à la fermeture de l'onglet. La procédure de suppression au sein de l'application efface le brouillon local et le cookie, mais un ancien cookie copié hors navigateur pourrait rester rejouable jusqu'à expiration (2 h). Cette architecture reste réservée à une démonstration anonyme.

## Recette technique

Exécuter `npm run check`. Les 4 nouveaux tests de `tests/offline.test.mjs` couvrent :
- 9 x 2 cartes complètes ;
- non-divulgation avant soumission ;
- séparation des états du rappel ;
- unicité du nouvel identifiant de session et absence de la valeur secrète du cookie dans l'API.

## Recette manuelle à réaliser par le propriétaire

1. FR et EN : terminer l'exercice « Moyenne », constater l'affichage de la carte à la fin et sa présence dans l'impression.
2. Avant transfert : consulter les réponses réseau, vérifier l'absence de `offlineCard`.
3. Révision autonome : vérifier l'absence de carte et de réponse avant soumission, puis leur apparition après réponse/passage.
4. Ouvrir deux onglets, commencer deux parcours différents et actualiser le premier : vérifier qu'aucune ancienne réponse n'est affichée sur le second exercice.
5. Vérifier 360 px, navigation clavier, zoom 200 %, impression PDF et mise en page sur papier.
6. Confirmer que les contrôles serveur et GitHub Actions réussissent **avec les neuf exercices de la PR #4**, pas seulement la copie locale.

Aucune fonctionnalité de recherche avec des participants, aucune instrumentation analytique, aucun score de QI ou d'addiction n'est ajouté.