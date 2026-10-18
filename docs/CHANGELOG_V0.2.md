# THINK FIRST V0.2 - incrément internationalisation et qualité pédagogique

## Fonctionnalités

- Sélecteur FR / EN sur l'accueil. Le choix reste dans l'URL et non dans un cookie de suivi.
- Traductions de l'interface et des trois démonstrations (énoncés, indices, explications, transferts et grilles de relecture).
- La langue est figée pendant une séance, même après une recharge du navigateur. Pour la changer, terminer ou quitter l'exercice.
- Indices progressifs : l'API ne renvoie plus les indices futurs au début de la séance.
- L'épreuve autonome de transfert ne contient ni solution, ni grille, ni indices dans sa réponse API.
- Fiche finale : question, réponse de l'utilisateur, auto-évaluation qualitative, exemple et proposition d'exercice hors écran.
- Impression depuis le navigateur. Ne crée aucun profil, score ou stockage durable de la réponse.
- CI GitHub pour exécuter les tests techniques à chaque proposition de changement.

## Validation

- `npm run check` : tests automatiques API/états/langues/confidentialité.
- Contrôler sur ordinateur et smartphone : changement FR↔EN, tous les parcours, reprise après rechargement, auto-évaluation, impression.
- La recette graphique automatisée peut être bloquée en environnement protégé ; recette locale humaine demandée.

## Limites volontaires

- Contenus de démonstration non validés scientifiquement, y compris les traductions.
- L'IA générative, la recherche impliquant des participants et le recrutement de mineurs restent désactivés.
- L'impression du navigateur peut proposer l'enregistrement en PDF : ce choix est géré par l'utilisateur.
- Sans connexion au serveur, demander un nouvel indice n'est pas possible. Pas de promesse de fonctionnement intégral hors ligne.
- La version anglaise ne vaut pas validation interculturelle des questions.
