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

## V0.4.1-alpha - Faire un exercice, puis quitter l'écran

Chaque exercice dispose désormais d'un mini-défi **FR/EN et imprimable** à effectuer avec une feuille ou un crayon, révélé uniquement après le transfert ou le rappel autonome. Les brouillons locaux sont liés à l'identifiant éphémère du parcours pour empêcher un affichage croisé entre onglets. Aucune mesure de performance ni collecte supplémentaire. Voir `docs/HF_V041_HORS_ECRAN_ET_CONFIDENTIALITE.md`.


## FOCUS V0.5-alpha - pratiquer puis quitter l’écran

Le deuxième pilier possède une page autonome : `/focus` et `/focus?lang=en`, également accessible depuis l’accueil THINK FIRST. Six activités bilingues (attention mono-tâche, lecture avec intention, observation/inférence, écoute volontaire, planification concrète, restitution sans aide) sont proposées sans chrono, classements, séries ou notifications. Un parcours très court laisse l’utilisateur noter **facultativement** une intention, quitter l’écran pour mener l’activité, puis réfléchir à son expérience s’il le souhaite.

La fonctionnalité FOCUS ne crée aucun compte et ne transmet ni ne stocke les textes saisis : ils restent dans les champs vivants de la page et sont effacés à la fin, à l’annulation, à l’actualisation ou à la fermeture. **Attention : le prestataire d’hébergement peut disposer de journaux techniques HTTP, distincts des textes saisis.** Tous les contenus sont des propositions pédagogiques non validées expérimentalement ; aucun bénéfice cognitif ou thérapeutique n’est revendiqué.

Voir [docs/FOCUS_V0.5_SPEC_RECETTE.md](docs/FOCUS_V0.5_SPEC_RECETTE.md). Exécuter `npm run check`, `npm start`, puis la recette visuelle, mobile, clavier et impression. Ne pas fusionner `main` avant validation.


## HUMAN FIRST LEARN - V0.6 Alpha (développement)

Le **troisième pilier LEARN** est disponible à `/learn` (ou `/learn?lang=en`). Six leçons originales FR/EN organisées en quatre domaines. Chaque leçon suit **lecture guidée → rappel sans support → confrontation à une explication → transfert sans indice → activité papier**. Les leçons et leurs corrections sont servies progressivement : aucune correction de transfert dans le catalogue public.

- Pas de connexion, publicité, appel IA, note, classement, minuteur ni collecte de texte côté serveur.
- Cookie `hf_learn` chiffré, distinct de `hf_session` utilisé par THINK, pour les étapes de démonstration adultes.
- Brouillons seulement dans l'onglet ; faculté d'enregistrer **une date** de rappel J+2 dans ce navigateur avec consentement local, puis d'effacer ce calendrier. Pas de notification.
- Tout est explicitement **une démonstration non évaluée scientifiquement**. Leçons non validées ; aucune mesure cognitive individuelle.

Tester depuis la branche Preview : `npm run check && npm start`, puis http://127.0.0.1:4173/learn . Si Playwright Python et Chromium sont installés, `python tests/learn_visual_smoke.py` réalise une recette d'interface et enregistre des captures locales non versionnées sous `artifacts/learn`.

Document complet : [docs/LEARN_V0.6_SPEC_RECETTE.md](docs/LEARN_V0.6_SPEC_RECETTE.md). Ne pas activer d'étude de terrain ni déployer sur `main` avant revue pédagogique, sécurité, accessibilité et acceptation de la recette.