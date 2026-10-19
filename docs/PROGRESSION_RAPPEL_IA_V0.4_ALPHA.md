# HUMAN FIRST — Développement pédagogique V0.3.1, V0.3.2 et V0.4-alpha

Date : 19 octobre 2026 · statut : **démonstration, non validée pour une étude clinique/scientifique, 18+**.

## V0.3.1 — Parcours recommandés (sans verrouillage)

- `Penser avec rigueur` : déduction, contre-exemple, causalité, vérification des affirmations.
- `Lire les données` : moyenne et taux de base.
- `Apprendre durablement` : planification et rappel actif.
- `Décider librement` : jugement indépendant et vérification des affirmations.

Les filtres ne calculent **aucune note** et ne verrouillent aucun exercice. L'utilisateur peut choisir librement. Trois niveaux `1/3`, `2/3`, `3/3` indiquent une *difficulté éditoriale indicative*, pas une aptitude psychométrique. Les suggestions de prochains exercices sont facultatives. Les neuf contenus bilingues proviennent du lot V0.3 et requièrent une validation externe.

`GET /api/paths?lang=fr|en` retourne les quatre parcours, limités aux exercices réellement présents. `GET /api/catalog` fournit uniquement des métadonnées, sans réponse, sans indices cachés ni item de transfert.

## V0.3.2 — Restitution différée, sans automatisme de rétention

En fin d'exercice, le participant majeur peut **opter explicitement** pour une date de révision dans un jour. Le navigateur conserve localement et seulement après ce choix l'ID du défi et une date d'échéance (clé `human-first:think-first:review-dates-v1`). Aucune réponse, identité, e-mail ou score n'y est conservé. La liste n'active aucune notification, relance ni série de connexion.

Quand la date est atteinte, l'utilisateur peut lancer une révision sans indice. Un nouvel item de restitution est proposé par `POST /api/session/recall/start`; la réponse de référence n'est jamais envoyée par l'API avant l'appel `POST /api/session/recall/answer`. Cette dernière ne reçoit **pas** le texte : seulement `hasAnswer: true` ou `skip: true`. Le texte reste dans `sessionStorage` de l'onglet, qui peut être effacé en quittant la séance. Une autre date à 7 jours est proposée à l'issue de la révision ; elle reste optionnelle. L'utilisateur peut effacer toutes les dates via un bouton visible sur l'accueil.

**Limites** : une programmation est locale à un navigateur ; un nettoyage du stockage local efface les dates. Il n'y a pas de notification. L'utilisation d'un autre appareil ne permet pas de les récupérer. Le résultat ne doit pas être interprété comme une mesure validée de mémoire ou un apprentissage prouvé ; l'utilisateur peut également choisir « Passer ».

## V0.4-alpha — Assistance socratique IA sous drapeau de fonctionnalité

Par défaut : `HF_AI_ENABLED` **non défini** et aucune transmission à un prestataire externe. Le parcours prédéfini (question de guidage + deux indices humains) reste complet et prioritaire.

Pour un test de développement **uniquement**, renseigner côté serveur :

```ini
HF_AI_ENABLED=1
GROQ_API_KEY=<valeur_secrete_a_definir_hors_de_Git>
```

**Ne jamais committer la clé**. Toute activation sur une démo publique exige une revue juridique et confidentialité (information sur prestataire, transferts éventuels, durées de conservation et conditions d'utilisation), un plafond de requêtes côté fournisseur, et un dispositif de limitation d'abus **hors cookie**. La V0.4-alpha ne comporte aucun de ces contrôles de production. Ne pas activer sur Vercel Production ; laisser désactivé en Preview sauf test très encadré.

API du prototype : `GET /api/coach/config` expose seulement disponibilité + prestataire + nombre maximal de tours, pas de secret. L'API `POST /api/session/coach` nécessite : une session adulte, une tentative personnelle valide, un accord explicite **sur chaque appel**, un brouillon d'au moins 15 caractères et moins de deux questions déjà émises. Le serveur envoie au prestataire seulement l'énoncé initial et jusqu'à 800 caractères de la réponse initiale, sans correction, transferts indépendants, grille ni identité. Réponse attendue : une seule question courte JSON. Les sorties non conformes, indisponibilités et erreurs du fournisseur retombent sur une question de guidage prédéfinie (pas une correction). Le modèle pouvant malgré tout se tromper, aucune évaluation automatique n'est faite.

Un cookie chiffré ne suffit pas à contrôler le volume de requêtes entre créations de sessions. L'exposition publique du fournisseur nécessite quotas, contrôles de coûts et anti-abus externes. La solution **n'interdit pas** un modèle de proposer malencontreusement une réponse ; une validation pédagogique et des essais adversariaux sont obligatoires avant activation.

Les réponses saisies dans les autres étapes suivent les règles du prototype antérieur : 2 000 caractères maximum, réponse non insérée dans le cookie AES-GCM, aucun enregistrement durable côté serveur.

## Critères de recette prioritaires

1. `npm run check` passe sans clé IA, sans réseau externe et sans base de données.
2. Neuf exercices FR/EN après empilement sur la PR #4, avec niveaux et quatre parcours.
3. Les filtres ne verrouillent aucun exercice : l'onglet « Tous » permet toujours de choisir librement.
4. La révision est impossible pour les moins de 18 ans ; la réponse de référence n'est révélée qu'après la réponse ou le choix de passer.
5. `GET /api/catalog`, `GET /api/paths` et l'item de rappel ne divulguent ni solutions ni réponses de transfert.
6. L'enregistrement local de dates demande une case cochée, aucune transmission de texte de restitution, effacement par un bouton explicite.
7. Sans clé IA, le service de coaching est désactivé (`503`) et le parcours prédéfini reste fonctionnel.
8. Avec un fournisseur simulé, le coach accepte une unique question courte et refuse les réponses longues ou chiffrées.
9. Navigation clavier, zoom à 200 %, Chrome/Firefox, 360px/768px/1440px, FR/EN : **recette manuelle à effectuer**.
10. Contrôles GDPR, sécurité, accessibilité et revue externe des exercices : **pas encore qualifiés**.

## Références techniques

- Groq chat completions : https://console.groq.com/docs/api-reference
- Vercel conteneurs stateless : https://vercel.com/kb/guide/does-vercel-support-docker-deployments
- Cadre de compétences IA UNESCO : https://www.unesco.org/en/articles/ai-competency-framework-students