# HUMAN FIRST — THINK FIRST 0.1

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
- Trois exercices **de démonstration non validés pour la recherche** : causalité, logique, moyenne.
- Démarrage 18+ et sans compte ; bouton « Quitter » à tout moment.
- Tentative libre ou passage volontaire.
- Question de guidage et deux indices, puis explication directe toujours accessible.
- Transfert sur un item distinct, sans accès serveur à ses solutions avant soumission.
- Bilan qualitatif et activité hors écran ; aucune note psychométrique.
- Données temporaires dans la mémoire du processus serveur, expirant en deux heures ou supprimées à la sortie.
- Aucun fournisseur IA externe ; les indices sont prédéfinis et accessibles même si le réseau tombe après le chargement de l'exercice.
- Tests automatisés sur transitions, fuite d'énoncés/corrections, droits de session et en-têtes de sécurité.

## Ce qui n'est **pas** prêt

- **Pas une étude scientifique** : aucune attribution aléatoire, aucun consentement de recherche, aucune instrumentation expérimentale ni collecte de recherche.
- **Pas de preuve d'efficacité** : les exercices ne sont pas validés par des relecteurs pédagogiques indépendants ; les barèmes sont des questions d'auto-évaluation.
- Pas de bibliothèque de 20 à 24 exercices approuvés ; pas de jeu A/B/C équivalent validé ; pas de tests différés.
- Pas d'authentification nominative, d'administration, de journal d'audit qualifié ou d'accès mineurs.
- Pas de mode IA générative, facturation, déploiement ou internationalisation des contenus approuvée.
- Le stockage en RAM est adapté à une démo locale mono-processus, **pas** à la production ni à une expérimentation sur plusieurs serveurs.
- Vérifier l'accessibilité réelle avec technologies d'assistance ; ce prototype ne peut revendiquer une conformité WCAG vérifiée.

## Sécurité et vie privée

- Aucun cookie de suivi ; un seul cookie **HttpOnly**, **SameSite=Strict** pour les sessions, **Secure** en HTTPS (selon la terminaison TLS déclarée par le reverse proxy).
- Aucun CDN, traceur, appel externe, formulaire d'inscription ou journalisation des réponses.
- Requêtes POST protégées par en-tête personnalisé, contrôle d'origine et jeton de session imprévisible.
- API de transfert n'expose que la question, jamais sa réponse ni sa grille avant validation.
- Les réponses ne sont stockées que temporairement en mémoire. Elles sont perdues au redémarrage du processus.
- Héberger derrière HTTPS et un reverse proxy maîtrisé si l'on envisage une démo en ligne ; tests de sécurité et accessibilité supplémentaires obligatoires.

## Architecture

```text
public/          HTML, CSS, JavaScript natif (aucune dépendance)
server/          Serveur HTTP Node.js et banque d'exercices privée
  catalog.mjs    Exercices, solutions et transferts privés
  index.mjs      API et machine à états de session
tests/           Tests automatisés Node.js
docs/            Correspondance avec la spécification et étapes futures
```

## Principes non négociables

Respect du droit à l'erreur, accès direct à l'explication, pas de système de rétention, pas de notation de QI, pas de diagnostic de dépendance, pas de profils d'élèves, pas d'affirmation scientifique non démontrée.

**Statut : prototype exécutable V0.1 — démonstration adulte, non qualifié pour étude ni commercialisation.**
