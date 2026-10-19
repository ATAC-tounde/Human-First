# V0.4.1 - Activités hors écran, intégrées sur le programme à 20 défis

**Statut : démonstration bilingue pour adultes, non validée scientifiquement.**

La branche de cette PR repart de `main`, après fusion du programme V0.3 à 20 défis et de la réconciliation V0.4 (#11). L'ancienne branche V0.4.1 à 9 défis n'est pas fusionnée directement.

## Activités et confidentialité
- Les 20 défis FR/EN ont une activité papier facultative. Les 9 anciennes cartes sont réutilisées lorsque le thème correspond ; le reste est fondé sur l'activité éditoriale `offlineChallenge` propre à chaque défi et non sur un générateur IA.
- Un titre, 3 actions, un matériel simple, une durée **indicative** et une question d'autoévaluation sont présentés après transfert ou rappel, jamais avant.
- L'ancienne consigne V0.3 `offlineChallenge` est conservée dans le bilan.
- Le serveur ne collecte aucune réponse de restitution. Les brouillons existent seulement dans `sessionStorage`, liés à un identifiant de session non secret (12 octets hexadécimaux). Seul le cookie de session authentifié fait autorité.
- Aucune mesure d'efficacité cognitive, aucun compte, aucun suivi et aucune activation d'IA par ce changement.

## Recette
1. Vérifier 20 cartes FR et EN, filtres par domaine/niveau préservés.
2. Débuter `causalite`, contrôler qu'aucune carte détaillée n'apparait avant le transfert.
3. Soumettre ou passer, contrôler 3 étapes, les consignes V0.3 et l'impression.
4. Commencer une révision `alarme`, vérifier la carte seulement après soumission.
5. Deux sessions/tabs : vérifier que le texte d'une ancienne session n'est pas restauré.
6. Exécuter `npm run check`, puis contrôler manuellement à 200% et sur mobile.

Les horaires de révision opt-in J+1/J+7 restent locaux et révocables. L'ancienne limitation des sessions stateless (pas de révocation serveur d'un cookie copié avant expiration) reste applicable.
