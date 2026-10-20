# HUMAN FIRST — THINK FIRST 0.3

> **Avant la réponse, ta réflexion.** Prototype web pédagogique indépendant — aucun compte, aucune publicité, aucune API d'IA et aucune collecte scientifique.

Cette application illustre le parcours **tenter → indice(s) → explication → transfert sans aide → bilan qualitatif** prévu dans la spécification fonctionnelle et scientifique V0.1 du 18 octobre 2026.

## Démarrage (Windows, macOS, Linux)

Prérequis : Node.js 20+ (aucune dépendance npm à installer).

```bash
npm start
# Ouvrir http://127.0.0.1:4173
```

Mode développement : `npm run dev` ; vérifications : `npm run check`.

Sous Windows PowerShell :

```powershell
cd human-first-think-first
npm start
```

## Fonctionnalités du lot B01–B02 et début B04

- Accueil mobile-first, interface en français, mission et limites clairement affichées.
- 20 exercices bilingues **de démonstration, non validés pour la recherche** (5 par domaine : logique, esprit critique, résolution de problèmes, compréhension et mémorisation). Filtres par domaine et par niveau, sans profilage.
- Démarrage 18+ et sans compte ; bouton « Quitter » à tout moment.
- Tentative libre ou passage volontaire.
- Question de guidage et deux indices, révélés progressivement par le serveur ; explication directe toujours accessible.
- Transfert sur un item distinct, sans accès serveur à ses solutions avant soumission.
- Bilan qualitatif et activité hors écran ; aucune note psychométrique.
- Session de démonstration dans un cookie chiffré et authentifié (AES-256-GCM), valable au maximum deux heures ; aucune session serveur persistante. Les textes de réflexion restent uniquement dans l’onglet du navigateur (`sessionStorage`), le temps de la démonstration.
- Aucun fournisseur IA externe ; les indices sont prédéfinis et nécessitent une connexion lors de leur révélation.
- Tests automatisés sur transitions, secrets non divulgués, langue, droits de session et en-têtes de sécurité.

## Ce qui n'est **pas** prêt

- **Pas une étude scientifique** : aucune attribution aléatoire, aucun consentement de recherche, aucune instrumentation expérimentale ni collecte de recherche.
- **Pas de preuve d'efficacité** : les exercices ne sont pas validés par des relecteurs pédagogiques indépendants ; les barèmes sont des questions d'auto-évaluation.
- Pas de bibliothèque de 20 à 24 exercices **approuvés par des experts** (les 20 défis actuels sont uniquement démonstratifs) ; pas de jeu A/B/C équivalent validé ; pas de tests différés.
- Pas d'authentification nominative, d'administration, de journal d'audit qualifié ou d'accès mineurs.
- Pas de mode IA générative, facturation, déploiement ou internationalisation des contenus approuvée.
- Le cookie cryptographique V0.2.1 fonctionne entre instances partageant la même clé de chiffrement. Il ne permet pas de révocation serveur d’un ancien cookie volé : **aucune donnée sensible, compte ou expérimentation scientifique ne doit être accueillie sur cette démo**.
- Vérifier l'accessibilité réelle avec technologies d'assistance ; ce prototype ne peut revendiquer une conformité WCAG vérifiée.

## Sécurité et vie privée

- Aucun cookie de suivi ; un seul cookie **HttpOnly**, **SameSite=Strict** pour les sessions, **Secure** en HTTPS (selon la terminaison TLS déclarée par le reverse proxy).
- Aucun CDN, traceur, appel externe, formulaire d'inscription ou journalisation des réponses.
- Requêtes POST protégées par en-tête personnalisé, contrôle d'origine et jeton de session imprévisible.
- API de transfert n'expose que la question, jamais sa réponse ni sa grille avant validation.
- Les textes saisis ne sont jamais mis dans le cookie ni persistés sur un serveur : l’onglet conserve seulement une copie temporaire via `sessionStorage` après soumission pour pouvoir afficher le bilan après actualisation. Elle est effacée par « Quitter »/« Terminer » et à l’expiration de la session ; une fermeture de l’onglet ou du navigateur peut également la faire disparaître.
- Héberger derrière HTTPS et un reverse proxy maîtrisé si l'on envisage une démo en ligne ; tests de sécurité et accessibilité supplémentaires obligatoires.

## Architecture

```text
public/          HTML, CSS, JavaScript natif (aucune dépendance)
server/          Serveur HTTP Node.js et banque d'exercices privée
  catalog.mjs    Exercices, solutions et transferts privés
  index.mjs      API et machine à états de session
  session-crypto.mjs Cookies de session chiffrés, sans persistance côté serveur
tests/           Tests automatisés Node.js
docs/            Correspondance avec la spécification et étapes futures
```

## Principes non négociables

Respect du droit à l'erreur, accès direct à l'explication, pas de système de rétention, pas de notation de QI, pas de diagnostic de dépendance, pas de profils d'élèves, pas d'affirmation scientifique non démontrée.

**Statut : prototype exécutable V0.3 — démonstration adulte, non qualifié pour étude ni commercialisation.**

## Évolutions V0.2

Choix de langue FR/EN sur l’accueil, contenus traduits, indices révélés côté serveur étape par étape, fiche de réflexion imprimable. Voir [docs/CHANGELOG_V0.2.md](docs/CHANGELOG_V0.2.md). Aucune production n’est déployée.

### Recette visuelle locale facultative

Si Python est installé :

```powershell
python -m pip install playwright
python -m playwright install chromium
python tests/visual_smoke.py
```

Captures dans `artifacts/visual/` (non versionnées). La recette visuelle doit être faite **sur la machine du testeur**. Pour Windows, aucun chemin `/mnt/data` ni `/usr/bin/chromium` n'est nécessaire.

## Lot V0.2.1 - compatibilité Vercel Preview

- Remplacement des sessions stockées en mémoire d’un processus par un **cookie de progression chiffré et authentifié**, utilisable entre plusieurs instances Vercel partageant la même clé.
- Réponses écrites conservées uniquement dans le navigateur (`sessionStorage`, jamais dans le cookie, Redis ou une base de données). Réponse éventuellement indisponible si l’onglet change ou si son stockage a été effacé.
- Correction des pages `/?lang=fr`, `/?lang=en` et des ressources avec paramètres d’URL.
- Expiration des sessions après deux heures. Attention, l’effacement du cookie ne révoque pas une copie qui aurait été dérobée avant expiration ; ce compromis est acceptable **uniquement pour la démo sans données sensibles**. Une base de sessions révocables est requise avant tout compte utilisateur ou pilote institutionnel.
- Variable obligatoire sur Vercel et en production : `HF_SESSION_SECRET` (type **Encrypted**, portée **Preview** pour cette version).
- Tests automatiques : reprise entre deux processus distincts, altération du cookie, absence du secret en production, parcours FR/EN et URL avec paramètres.

La PR reste en environnement **Preview**. Ne pas fusionner vers `main` ni annoncer un lancement public avant une recette humaine complète.


## Lot V0.3 - enrichissement pédagogique (19/10/2026)

- 20 exercices originaux avec question initiale, guidage, deux indices gradués, explication, problème de transfert **différent**, grille de relecture à trois critères, exemple de raisonnement et **activité hors écran contextualisée**.
- Quatre domaines de cinq exercices : logique, esprit critique, résolution de problèmes, compréhension et mémorisation ; trois niveaux pédagogiques de complexité à titre indicatif (pas une classification psychométrique).
- Catalogue et exercices bilingues français/anglais ; filtres locaux sans télémétrie ni profilage.
- Bouton facultatif de masquage de l'énoncé pendant la réflexion, utile notamment pour exercer la restitution volontaire sans avoir la définition sous les yeux.
- Protections préservées : aucun transfert, corrigé ou défi hors écran révélé avant l’étape appropriée ; aucun score automatique et aucun appel à un service externe d'IA.
- Voir [docs/PEDAGOGIE_V0.3.md](docs/PEDAGOGIE_V0.3.md) pour la matrice des exercices, les critères d'acceptation et les portes de validation scientifique.

### Démarrer la V0.3 localement

```powershell
git fetch origin
git switch feature/think-first-v0.3-curriculum
git pull --ff-only origin feature/think-first-v0.3-curriculum
npm run check
npm start
```

**Important** : PR empilée sur la V0.2.1, sans fusion dans `main` avant la recette fonctionnelle. Les modifications ne constituent pas une validation scientifique ni une autorisation d'ouvrir le service aux mineurs.

## Intégration V0.4 sur le programme V0.3 déjà fusionné
La PR #3 a livré **20 exercices** en `main`. La branche parallèle de la PR #4, basée sur neuf exercices, ne doit **pas** remplacer cette bibliothèque. Cette branche d'intégration conserve les 20 exercices, leurs filtres et défis papier et ajoute les parcours facultatifs, les restitutions J+1/J+7 et le coach socratique opt-in (désactivé en l'absence de configuration).

Tests : `npm run check`. Recette : filtres des domaines/niveaux, 20 cartes FR/EN, masquage de l'énoncé, indice, transfert, papier, révision, absence d'IA par défaut.


## V0.4.1 - Défis papier pour les 20 exercices

Les 20 exercices (FR/EN) proposent après la résolution un défi papier facultatif à trois étapes, accessible également à la fin d'un rappel autonome. Les brouillons de l'onglet sont isolés par session. Voir [documentation V0.4.1](docs/HF_V041_HORS_ECRAN_ET_CONFIDENTIALITE.md).


## FOCUS V0.5 - Deuxième pilier (alpha)

La page `/focus` contient six activités pédagogiques FR/EN facultatives à réaliser hors écran. Pas de compte, chronomètre, classement, requête externe ni conservation des notes. Le trajet THINK existant à **20 exercices** et les révisions V0.4.1 restent intacts. Cette branche réintégrée repart de `main` après la PR #12. Voir [spécification FOCUS](docs/FOCUS_V0.5_SPEC_RECETTE.md).


## LEARN V0.6 - Troisième pilier (alpha)

Accès : `/learn` en français et anglais. Six leçons originales, avec lecture, restitution sans aide, explication, transfert indépendant et activité hors écran. Cookie `hf_learn` chiffré distinct de celui de THINK, réponses libres non transmises au serveur. Calendrier local volontaire et effaçable. Les 20 exercices THINK ainsi que FOCUS sont préservés. Voir `docs/LEARN_V0.6_SPEC_RECETTE.md`.


## DECIDE V0.7 Alpha - Choix autonome et critique des recommandations

Nouveau quatrième espace `/decide` (FR/EN), avec six scénarios fictifs et un atelier libre. Cycle objectif et critères → alternatives et compromis → faits et incertitudes → remise en question d'une recommandation **IA fictive préécrite** → choix provisoire (ou décision différée). Aucun classement automatique, score, minuterie, IA active, traceur ou stockage des notes. Les champs restent en mémoire DOM, effacés en quittant, en terminant ou à l'actualisation. Impression d'une fiche vierge sans réponses. Aucun conseil médical, financier ou juridique. Voir [spécification DECIDE](docs/DECIDE_V0.7_SPEC_RECETTE.md). Les 20 défis THINK, six activités FOCUS et six leçons LEARN sont préservés.


## V0.8 - Noyau universel d'apprentissage tout au long de la vie

L'espace `/journey` propose un programme **déterministe, explicable et volontaire**. Le référentiel est organisé en packs versionnés de compétences avec prérequis acycliques, textes FR/EN et activités THINK / FOCUS / LEARN / DECIDE. Cette première démonstration comprend **4 packs, 12 compétences et 5 parcours** (fondamentaux, méthodes d'étude, compétences professionnelles, reconversion, autonomie au quotidien). Il ne prétend pas mesurer les capacités, certifier des diplômes, ni être adapté aux mineurs.

Les profils déclarés (études, âge adulte facultatif, métier, objectifs, familiarité) restent dans l'onglet, **sans compte ni envoi au serveur**. Un portfolio JSON avec auto-déclarations, jamais les réponses libres, peut être exporté/importé volontairement. De nouveaux référentiels sont ajoutés en respectant le schéma des packs sans réécrire le moteur. Lire : [Architecture universelle V0.8](docs/ARCHITECTURE_UNIVERSELLE_V0.8.md).
