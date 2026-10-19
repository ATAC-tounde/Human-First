# HUMAN FIRST - LEARN V0.6 Alpha

**Statut : prototype pédagogique 18+, non évalué scientifiquement, non adapté à la recherche avec participants.**

## 1. Intention et périmètre

Troisième pilier distinct de THINK et FOCUS. LEARN permet d'expérimenter le cycle **étudier → restituer sans source → confronter à une référence → transférer à un problème nouveau → activité hors écran**. Aucune note, classement, série, minuteur ni dispositif de notification. Tous les parcours restent libres. La réussite ne se mesure pas au nombre d'heures passées dans l'application.

## 2. Contenu livré

Six séquences FR/EN originales, couvrant : preuve et opinion, causalité, moyennes, taux de base, restitution active et choix autonome. Chaque séquence a : ID stable/version, domaine, difficulté indicative, prérequis conseillés, objectif observable, 3 passages courts, question de rappel, explication de référence, 3 points d'autoévaluation, nouveau problème de transfert, approche possible et mission hors écran. Les contenus exigent une revue pédagogique humaine avant toute étude.

| ID | Compétence | Niveau indicatif | Pré-requis conseillé |
| --- | --- | --- | --- |
| evidence | Source et preuve | 1/3 | Aucun |
| causality | Raisonnement causal | 2/3 | evidence |
| averages | Interprétation de moyenne | 1/3 | Aucun |
| base-rate | Taux de base et fausses alertes | 3/3 | averages |
| retrieve | Restitution autonome | 1/3 | Aucun |
| choices | Critères, compromis, autonomie | 2/3 | evidence |

Les niveaux **ne sont pas une mesure des capacités**. La lecture des prérequis n'est jamais obligatoire.

## 3. Interfaces

- `/learn` et `/learn.html` : page LEARN distincte, responsive et bilingue avec syllabus filtrable, entrée 18+, dates de révision volontaire.
- Flux `study`, `recall`, `feedback`, `apply`, `finished` : 5 étapes dont la progression est affichée sans score.
- « Réviser » : permet de commencer directement par le rappel, sans revoir les trois passages. L'entrée n'est proposée dans le calendrier que lorsque la date sélectionnée est arrivée ; l'API demeure utilisable pour des tests adultes.
- Les notes ne sont ni transférées au serveur, ni enregistrées dans la base ni mises dans les cookies ; elles demeurent dans `sessionStorage` propre à l'onglet. La session s'efface à la sortie ; les données éventuelles disparaissent aussi à la fermeture définitive de l'onglet.
- Le calendrier **opt-in** stocke uniquement `{lessonId, due, lang}` dans `localStorage`. Pas de rappel programmé automatique, notifications ou email. Effacement global depuis l'interface.

## 4. Sécurité par étape

Cookie `hf_learn`, séparé de `hf_session` utilisé par THINK. AES-256-GCM et secret `HF_SESSION_SECRET` partagé avec les instances Vercel Preview, durée maximale 2h. Aucune réponse dans le cookie chiffré. Les transitions sont contrôlées par le serveur et de nouvelles versions du cookie sont émises à chaque étape. Une ancienne copie du cookie peut être rejouée avant expiration : cette propriété inhérente au prototype *stateless* est **une limite connue**. Pas de garantie de révocation centralisée ni de tentative unique inviolable. Ne pas utiliser comme outil de recherche ou évaluation certificative.

| Route | Moment où elle est autorisée | Données renvoyées |
| --- | --- | --- |
| `GET /api/learn/catalog?lang=fr/en` | Toujours | Métadonnées seulement |
| `POST /api/learn/start` | Déclaration 18+, leçon valide | Passages d'étude, ou question de rappel en `mode=review` |
| `POST /api/learn/study-done` | Après étude | Question de rappel, sans référence |
| `POST /api/learn/recall-done` | Après rappel | Explication et 3 points de réflexion ; **aucun texte accepté** |
| `POST /api/learn/apply` | Après feedback | Transfert nouveau, sans solution |
| `POST /api/learn/finish` | Après transfert | Exemple d'approche et activité papier ; **aucun texte accepté** |
| `POST /api/learn/reset` | À tout moment | Expiration du cookie LEARN |

Les routes de mutation nécessitent `X-Think-First: 1`, JSON et contrôle d'origine. Le contenu sensible des leçons est dans `server/learn-catalog.mjs`, non servi par les routes statiques. Aucun appel externe. Les solutions restent privées côté serveur jusqu'à l'étape correspondante ; l'analyse locale est volontairement qualitative et **non notée**.

## 5. Critères de recette et tests

1. Le catalogue FR et EN contient 6 leçons ; filtrer les quatre domaines sans modifier le contenu des leçons.
2. Vérifier chaque écran au clavier, avec Tab, Shift+Tab, focus, Escape (pour retour navigateur éventuel), zoom 200 %, Chrome/Firefox et mobile 375px.
3. Après « Fermer le cours » : pas de référence, grille, énoncé de transfert ni solution dans la réponse API ou HTML.
4. Impossible d'accéder à la correction avant soumission de la restitution. Un `POST` avec `answer` ou `text` doit renvoyer HTTP 400.
5. Après feedback, nouvel item de transfert sans réponse préchargée. Essai sans aide ou passage volontaire.
6. Le bilan montre uniquement après soumission l'exemple de transfert, l'activité papier et la possibilité de quitter.
7. `hf_session` THINK et `hf_learn` LEARN indépendants ; possibilité d'avoir chaque espace ouvert sans conflit d'authentification de démonstration.
8. Cookie manipulé et appel sans en-tête CSRF : refus ; cookie expiré → session vide.
9. Fermeture/actualisation puis reprise : étape retrouvée pendant 2h et brouillon seulement dans l'onglet initial.
10. Essayer le calendrier : aucun stockage avant accord. Vérifier suppression explicite, pas de notification ou déclenchement en arrière-plan.
11. Vérifier l'impression du bilan et l'absence d'affichage prématuré du transfert.
12. Déclencher le test automatisé local : `npm run check` (Node.js 20+). L'option `python tests/learn_visual_smoke.py` dépend de Playwright Python et Chromium installés localement.

## 6. Limites scientifiques, éthiques et techniques

- Les textes pédagogiques et leur traduction n'ont pas été évalués par un comité pédagogique ni par des participants.
- La répétition espacée à deux jours est une **proposition de prototype** et n'est pas un protocole optimal universel.
- Aucun score de mémoire, intelligence ou concentration ; l'outil ne fait pas d'estimation de gain cognitif.
- Aucun recrutement, consentement de recherche, anonymisation expérimentale, registre de résultats ou randomisation.
- La garde des textes en `sessionStorage` n'est **pas** du chiffrement de bout en bout et n'est pas appropriée pour des informations sensibles. Ne pas entrer de données de santé, identifiants ou secrets.
- Démonstration sans compte, accès réservé aux adultes sur déclaration ; vérification d'âge indépendante absente.
- L'absence de divulgation des solutions se limite au parcours API courant ; des cookies chiffrés anciens peuvent être rejoués dans une architecture stateless. Une étude rigoureuse demanderait des tests versionnés immuables et un stockage serveur de progression.
- Avant toute publication large : audit WCAG 2.2 AA, revue juridique/RGPD, tests multi-navigateurs, validation scientifique du contenu, recette sécurité et politique de ressources.

## 7. Lot suivant proposé

DECIDE V0.7 : atelier de décisions guidées avec critères explicites, risques, options et vérification indépendante, sans modèle de scoring de personnes, puis chantier d'outillage de revue pédagogique (auteurs/relecteurs, publications versionnées et double revue).

## Intégration sur main actualisé après FOCUS PR #13
Cette branche est basée directement sur main intégrant 20 exercices THINK, les révisions V0.4, les cartes hors écran V0.4.1 et FOCUS V0.5. Les fichiers de catalogue et de tests THINK existants ne sont pas remplacés. Les six leçons LEARN utilisent les routes `/api/learn/*` et un cookie distinct `hf_learn`. La bibliothèque et les filtres THINK sont conservés. Vérifier les liens FR/EN entre les trois piliers avant la fusion dans main.
