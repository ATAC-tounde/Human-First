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


## Content Studio V0.9 - référentiels universels et versionnés

Ouvrir `/studio` (atelier 18+ en français, contenus FR/EN) pour créer ou modifier un référentiel de compétences, ses savoir-faire, activités THINK/FOCUS/LEARN/DECIDE, prérequis, parcours, contextes métiers, provenance et licences. Enregistrer un brouillon, valider ses liens et traductions, demander une revue éditoriale, documenter une approbation **déclarative** et exporter un pack JSON versionné. Ce fichier peut être importé dans `/journey`. La publication est **locale seulement**, pas une mise en ligne ni une certification.

Le Studio n'a pas de compte, ne transmet pas les données de travail et ne les sauvegarde pas automatiquement. **Exporter le document Studio** avant de fermer la page. Il n'offre pas encore de véritable collaboration/authentification/stockage durable. Le schéma PostgreSQL `migrations/0001_lifelong_learning.sql` décrit une architecture cible multi-organisations et **n'est pas exécuté** par le serveur de démonstration. Voir `docs/CONTENT_STUDIO_V0.9_ARCHITECTURE.md` pour la gouvernance, le RGPD, les limites du prototype, les tests et les étapes de production.


## HUMAN FIRST V1.0 alpha - pratique formative et portfolio de réflexion

La page `/journey` propose désormais des **tâches formatives facultatives** pour les compétences qui disposent d'un scénario bilingue et de critères de relecture rédigés. Après sa tentative (conservée uniquement en mémoire de l'onglet), l'apprenant peut afficher la grille qualitative et noter les critères qu'il pense avoir pris en compte. Le portfolio exporté contient seulement les métadonnées d'auto-réflexion et **jamais** le texte de la réponse. Aucun score, diplôme, diagnostic de capacité ou automatisation de décision n'est calculé. Les exports V0.8/V0.9 dépourvus d'observations formatives sont toujours importables.

Le Studio `/studio` permet aux auteurs de joindre une **évaluation formative bilingue structurée**, facultative, à chaque compétence et d'inclure sa grille dans les packs de contenu. Le noyau rejette les schémas incomplets, les critères doublons et les tâches mal traduites. Quatre démonstrateurs originaux sont proposés pour commencer. Ces ateliers restent des aides à l'apprentissage : comme leurs grilles résident dans des modules JS publics, ils **ne sont pas des examens sécurisés**. Voir [conception et recette V1.0](docs/FORMATIVE_EVIDENCE_V1.0.md).

Les profils JOURNEY et les textes de réponse ne sont pas transmis au serveur. Le blocage de déploiement Container Registry Vercel est indépendant et doit être corrigé avant toute validation en Preview. La production n'est pas modifiée par cette branche.

**Continuité V1.0 :** JOURNEY accepte facultativement une table JSON explicite d'équivalences entre anciens et nouveaux identifiants de compétences/parcours. Une migration non résolue est refusée, sans perte silencieuse de données. Aucune équivalence n'est inventée par le moteur. Voir la documentation formative et continuité V1.0.


## V1.1 Alpha - Coffre personnel chiffré sans compte

Dans `/journey`, l'apprenant peut **volontairement** chiffrer son portfolio avec une phrase secrète (12 caractères minimum), télécharger un fichier de sauvegarde `.hfvault`, ou enregistrer la **seule forme chiffrée** dans IndexedDB sur son appareil. À l'ouverture, la phrase secrète est demandée à nouveau et n'est jamais enregistrée. Schéma versionné `hf.encrypted-portfolio.v1`, PBKDF2-SHA256 (310 000 itérations), clé AES-256-GCM, sel et nonce aléatoires, métadonnées liées par AAD. Aucun compte, serveur de synchronisation ou dépendance npm.

**Ne pas oublier la phrase secrète : il n'existe aucune récupération.** Les fichiers JSON *non chiffrés* de V1.0 restent pris en charge, mais doivent être gardés privés. IndexedDB peut être supprimé automatiquement par le navigateur ; créer aussi un fichier externe de sauvegarde. Lire `docs/ENCRYPTED_VAULT_V1.1.md` pour la menace et les limites de sécurité. Les réponses libres de l'atelier formatif ne sont incluses dans aucun portfolio.


## Préférence linguistique unifiée FR/EN (v1.1.1)

Les espaces THINK, FOCUS, LEARN, DECIDE, JOURNEY et le Studio pédagogique partagent désormais une seule préférence `fr` ou `en`. La langue choisie dans un espace reste active au passage d'un pilier à un autre, vers `/studio`, après retour et après rechargement. Le paramètre explicite `?lang=fr` ou `?lang=en` prévaut sur la préférence enregistrée. **Seul ce code langue non personnel** est mémorisé dans `localStorage`, sans profil, exercice, réponse, suivi ou requête réseau. Lorsque le stockage est bloqué, la langue reste transmise par les liens. Le Studio traduit ses menus, commandes, formulaires et contrôles qualité tout en conservant intacts les contenus pédagogiques saisis en FR et EN.
