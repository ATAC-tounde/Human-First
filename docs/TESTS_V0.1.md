# Rapport de recette technique locale — V0.1

Date : 18 octobre 2026.

## Exécution

Commande : `npm run check` (Node.js 22.16.0).

**Résultat : 8 tests automatisés réussis, 0 échec.**

Couverture automatisée :
- Vérification d'état / désactivation IA et recherche.
- Non-divulgation des corrections, grilles et transferts dans le catalogue.
- Déclaration 18+ et contrôle de l'origine des requêtes mutantes.
- Enchaînement tentative, trois indices, explication, transfert autonome, bilan et suppression de session.
- Accès direct à l'explication et possibilité de passer.
- En-têtes HTTP de sécurité et interdiction d'accès direct au code serveur.
- Limitation de la taille de la réponse libre et isolation de sessions distinctes.

## Limites de la recette

Les tests sont des tests HTTP et de logique métier. **Aucune recette complète du rendu visuel sous navigateur n'a pu être exécutée dans cet environnement** (l'exécution Chromium renvoie un blocage administratif de navigation). Un contrôle visuel manuel reste requis sur Firefox/Chrome, téléphone, zoom 200%, navigation clavier et lecteur d'écran.

Ce PV n'établit pas la qualité scientifique des exercices, la conformité RGPD ou l'aptitude du prototype à recevoir des participants à une étude.

## Contrôles manuels recommandés

1. Exécuter `npm start`, ouvrir `http://127.0.0.1:4173`.
2. Vérifier la page d'accueil en 360px, 768px, 1440px.
3. Essayer un exercice, puis demander chacun des trois indices.
4. Accéder directement à l'explication sans tentative : vérifier l'absence de culpabilisation.
5. Effectuer le transfert : aucun bouton d'aide / accès à la solution avant soumission.
6. Finir et quitter : l'API GET `/api/session` doit retourner `stage: idle` après réinitialisation.
7. Utiliser Tab/Shift+Tab, vérifier l'outline focus, zoom navigateur 200%.
