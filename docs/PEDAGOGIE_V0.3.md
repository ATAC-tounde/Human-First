# THINK FIRST V0.3 | Cadre de conception et banque de défis

**Statut : démonstration pédagogique, pas de preuve d’efficacité.** Date : 19 octobre 2026. Public : adultes (déclaration 18+). Langues : français et anglais. Zéro évaluation psychométrique, zéro classement et aucune collecte scientifique.

## Objectifs pédagogiques de la version

- **THINK / Logique** : identifier le sens d'une implication, distinguer « certains » et « tous », raisonner avec un contre-exemple ou une contraposée.
- **DECIDE / Esprit critique** : distinguer preuve et promesse, causalité et coïncidence, métrique et représentations trompeuses.
- **THINK / Résolution** : expliciter objectifs, hypothèses, contraintes et stratégie ; vérifier ses décisions.
- **LEARN / Comprendre et retenir** : reformuler sans copier, préparer des rappels espacés sur papier, transférer un principe et calibrer son sentiment de maîtrise.

Le pilier **FOCUS** est présent dans les principes anti-captation (aucune série, récompense, scroll infini ou notification), et les activités hors écran. Il n'y a **pas encore** de module FOCUS évalué : éviter de prétendre réduire l'addiction ou les distractions.

## Matrice des exercices

| Domaine | Découverte (1) | Exploration (2) | Approfondissement (3) |
|---|---|---|---|
| Raisonnement logique | `deduction` | `alarme`, `quantificateurs` | `contre_exemple`, `negation` |
| Esprit critique | `causalite`, `moyenne` | `sources`, `alertes` | `echelle` |
| Résolution de problèmes | `billets` | `dependances`, `diagnostic`, `criteres` | `temps` |
| Comprendre et retenir | `reformuler` | `rappel`, `principe`, `espacement` | `incertitude` |

Chaque fiche contient : code stable, version du contenu, domaine, difficulté, introduction, **problème de départ**, question de guidage, deux indices gradués, explication, **problème inédit de transfert**, trois questions de relecture, exemple indicatif de réponse, activité hors écran adaptée, traduction anglaise et durée estimative. Les durées sont **approximatives et non chronométrées**. Aucun calcul de score ou de profil cognitif.

## Parcours de démonstration standard

1. Un adulte choisit volontairement un défi, éventuellement filtré par domaine / difficulté.
2. Il peut proposer son raisonnement ou demander directement l'explication, sans pénalité.
3. Après une tentative (ou un passage), il peut demander jusqu'à trois indices serveur, révélés un à un.
4. Il lit l'explication, puis résout **un autre problème** sans affichage d'indices ou de corrigé anticipé.
5. Après sa soumission, il lit une grille qualitative (trois questions) et un exemple de raisonnement ; aucune correction automatique ne prétend mesurer ses aptitudes.
6. Il peut terminer immédiatement et réaliser une courte activité hors écran. Les données de la séance ne donnent lieu à aucun profil persistant.

### Masquage volontaire

Le bouton **Masquer l'énoncé / Hide challenge** offre la possibilité de rappeler l'information sans la relire. Il est facultatif, réversible, limité à la phase d'entraînement et ne produit aucun score. Il ne transforme pas une séance immédiate en test de mémorisation différée.

## Critères d'acceptation techniques

| ID | Critère vérifiable |
|---|---|
| PED-01 | API catalogue : 20 identifiants uniques, 5 par domaine, niveaux 1–3. |
| PED-02 | Aucun champ `prompt`, `guide`, `hints`, `explanation`, `transfer`, `example` ni `review` dans la liste publique des défis. |
| PED-03 | Chacune des 20 entrées possède sa version FR et EN complète. |
| PED-04 | Chaque défi comporte exactement 3 indices progressifs (guidage + 2 indices), servis individuellement après la tentative ou le passage. |
| PED-05 | La phase de transfert présente un item différent et ne révèle ni correction ni grille. |
| PED-06 | La grille de relecture et l'activité hors écran ne sont disponibles qu'après la soumission du transfert. |
| PED-07 | Filtres domaine et niveau : résultat cohérent, intitulés FR/EN et état de bouton accessible. |
| PED-08 | Masquage : option volontaire, accessible clavier, réversible et indisponible au transfert. |
| PED-09 | Aucune mécanique de rétention, score, diagnostic, télémétrie ou appel à une IA externe. |

## Portes de validation pédagogique et scientifique (NON franchies)

**G1 | Relecture disciplinaire** : deux relecteurs indépendants vérifient pour chaque langue l'exactitude du raisonnement, l'unicité des réponses éventuellement attendues, la neutralité, le degré d'aide apportée par les indices et la qualité de l'item de transfert. L'approbation doit être nominative, datée et versionnée.

**G2 | Traductions / inclusion** : revue des formulations FR/EN, situations culturellement compréhensibles en France et en Afrique, accessibilité clavier et lecteurs d'écran, absence de stigmatisation ou d'exclusion des profils d'apprentissage.

**G3 | Mesure** : créer et valider des séries équivalentes A/B/C distinctes des exemples d'entraînement, déterminer les seuils de difficulté sur données pilotes et préenregistrer l'analyse statistique. Ne pas confondre réussite dans l'application et compétence générale.

**G4 | Recherche responsable** : protocole, examen éthique approprié, base légale, notices de protection des données, consentement, minimisation, durée de conservation, gestion du retrait, dispositif de signalement, garde-fous mineurs et sécurité d'une infrastructure de recherche dédiée.

**G5 | Exploitation** : configuration Vercel vérifiée, sessions révocables si comptes créés, mesures contre les abus, contrôle des performances, audit d'accessibilité et tests manuels sur téléphones. La démonstration actuelle reste séparée de tout établissement réel.

## Grille de relecture pédagogique (à utiliser pour chaque défi)

| Question | Critère d'acceptation humaine |
|---|---|
| Exactitude | Énoncé non ambigu ; calculs et explications vérifiés indépendamment. |
| Complexité | Difficulté adaptée au niveau affiché ; durée indicative réaliste. |
| Indices | Guidage progressif, sans livrer immédiatement le résultat. |
| Transfert | Nouvel habillage/contextualisation sans simple copie de la réponse initiale. |
| Éthique | Pas de promesse de réparation cognitive, pas de jugement de valeur. |
| Hors écran | Activité courte, facultative et faisable sans abonnement ou équipement. |
| FR/EN | Sens équivalent et exemples compréhensibles dans les deux langues. |
| Sécurité | Pas de corrigé dévoilé dans `/api/catalog` ni `/api/session` avant l'étape prévue. |

## Limites et suites

Les 20 contenus permettent de **tester un parcours**, pas de lancer une étude. Les transferts restent liés à la même notion, les niveaux ne sont pas calibrés et les solutions proposées ne constituent pas des notes normatives. **Aucune efficacité sur l'addiction, l'attention, l'intelligence ou la mémorisation durable n'est établie.**

Suite après recette : correction des items signalés, atelier de relecture avec enseignants et psychologues de l'éducation, validation de l'accessibilité, conception des jeux de mesure A/B/C, puis pilote scientifique séparé sous autorisations appropriées.