# HUMAN FIRST — THINK FIRST 0.2.1

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
- Trois exercices **de démonstration non validés pour la recherche** : causalité, logique, moyenne ; traductions EN disponibles.
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
- Pas de bibliothèque de 20 à 24 exercices approuvés ; pas de jeu A/B/C équivalent validé ; pas de tests différés.
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

**Statut : prototype exécutable V0.2 — démonstration adulte, non qualifié pour étude ni commercialisation.**

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

## Nouveautés V0.3 - Enrichissement pédagogique (branche de recette)

Neuf exercices de **démonstration** au total, dont six nouveaux en français et en anglais : vérifier une affirmation virale, planifier une stratégie de travail, réfuter une généralisation, interpréter les faux positifs et les taux de base, restituer une notion sans relecture, et décider sans suivre aveuglément un classement IA.

Le même parcours non culpabilisant est conservé pour tous : tentative personnelle facultative, trois aides révélées progressivement, explication explicite, **nouveau problème de transfert sans aide**, bilan de relecture et activité hors écran.

Les exercices nouveaux sont des prototypes éditoriaux, **non validés scientifiquement**. Ni un résultat sur un exercice, ni une autoévaluation ne permettent de conclure que la mémoire, l'attention ou l'autonomie d'une personne s'est améliorée. Pas de collecte de recherche, pas de classement, pas de diagnostic.

### Recette V0.3

```bash
npm run check
npm start
```

Contrôler particulièrement les neuf cartes en FR/EN, l'absence de correction avant le transfert, la conservation de la session en Preview, le refus des étapes hors séquence, les calculs de l'exercice « pourcentages » et la navigation clavier/mobile. `tests/pedagogy.test.mjs` vérifie la complétude et la non-divulgation des contenus : exécuter les tests ne remplace pas une revue pédagogique indépendante.

## V0.3.1 / V0.3.2 / V0.4-alpha — Trois nouveaux axes (branche de démonstration)
- **Progression libre** : quatre parcours (raisonnement, données, apprentissage, décision), niveaux éditoriaux indicatifs, suggestion optionnelle du prochain défi ; aucun score ni exercice verrouillé.
- **Restitution différée** : révision sans indice à J+1, puis possibilité d'une autre à J+7. Opt-in explicite dans l'interface. Seules les dates et identifiants d'exercice sont stockés localement ; aucun texte n'est stocké dans ce calendrier. Bouton d'effacement. Les textes de restitution restent dans l'onglet et **ne sont pas transmis au serveur**.
- **IA socratique facultative** : intégration Groq **désactivée par défaut** ; uniquement après tentative personnelle et accord explicite par requête. Le fournisseur ne reçoit ni correction ni item de transfert. Deux questions au maximum par session chiffrée, mais cela ne remplace pas un vrai dispositif anti-abus. Les sorties sont contrôlées et un guidage prédéfini reste disponible si l'IA est désactivée.
- **Statut expérimental** : 18+, aucun score de capacité cognitive, aucun protocole de recherche ni effet pédagogique prouvé. Ne pas activer le fournisseur IA au public sans une revue de protection des données, quotas/cap et tests adversariaux.

Documentation : [docs/PROGRESSION_RAPPEL_IA_V0.4_ALPHA.md](docs/PROGRESSION_RAPPEL_IA_V0.4_ALPHA.md). Test local : `npm run check` puis `npm start` (sans clé IA). La recette visuelle reste à réaliser sur navigateur.
