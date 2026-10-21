# HUMAN FIRST V1.3 Alpha - Boussole pédagogique facultative

## Objectif
Faire passer le parcours universel de la simple liste de compétences à une proposition de **prochaine pratique réellement exploitable** dans JOURNEY. La boussole ne remplace pas le choix de l'apprenant, ne délivre ni score ni diagnostic, et n'impose pas d'ordre obligatoire.

## Contrat déterministe
Module : `public/journey/compass.mjs`, fonction pure `suggestPractice(journey,evidence,{limit})`.

- Entrées : plan déjà construit par `buildJourney` et événements existants `explored`, `practiced`, `review-later` (la dernière déclaration pour une compétence prévaut).
- Sortie : jusqu'à trois idées par défaut (maximum cinq sur appel explicite) : compétence, modalité parmi THINK/FOCUS/LEARN/DECIDE, activité issue du pack, contexte existant, raison explicable et lien vers la compétence entière.
- Règles : `review-later` -> **LEARN** (se rappeler / réviser), aucune étape -> **THINK** (questionner), `explored` -> **FOCUS** (appliquer), `practiced` -> **DECIDE** (transférer). Si plusieurs compétences ont la même priorité, l'ordre topologique du parcours prévaut.
- Ces états indiquent ce que l'apprenant **a déclaré**, pas ce qu'il sait réellement faire. Une compétence déjà pratiquée n'est jamais retirée du programme, ni certifiée ou verrouillée.
- La préférence linguistique s'applique aux textes, aux activités et aux liens FR/EN. Diplôme, âge, métier, identité et texte libre ne servent pas à classer ou discriminer les personnes.

## Vérité de l'interface
Une activité de la boussole est l'instruction pédagogique du **pack**, pas un exercice déjà sélectionné dans les catalogues des piliers. Les liens THINK, FOCUS, LEARN et DECIDE ouvrent volontairement les **espaces généraux**. Un lien distinct mène à la fiche détaillée de la compétence et de ses quatre pistes. La boussole n'annonce ni validation ni transfert d'étape automatique.

## Confidentialité et continuité
Aucune nouvelle API, base de données, analyse comportementale, session, cookie, requête de suivi, champ personnel ou stockage. La boussole recalcule ses suggestions **uniquement dans l'onglet** à partir du portfolio déjà détenu. Les déclarations restent facultatives et exportables avec le mécanisme V1.0/V1.1 existant, sans texte rédigé. Le coffre V1.1 et le pilote V1.2 restent opt-in. Prototype 18+ uniquement.

## Recette
1. Faire `npm run check`. Les tests `tests/compass.test.mjs` vérifient la sélection stable, le rôle des quatre modalités, la langue, la non-discrimination par âge/diplôme/métier et les états de retour.
2. Dans `/journey`, confirmer l'accès majeur, choisir un parcours et générer. La boussole présente trois suggestions; toutes les compétences restent visibles plus bas.
3. Marquer volontairement une compétence « À revoir », une autre « Exploré », une troisième « Exercé ». Vérifier que les raisons et modalités se mettent à jour sans perdre les déclarations.
4. Basculer EN puis FR. Vérifier les liens, consignes et explications, sans réinitialiser l'historique.
5. Exporter puis importer un portfolio, répéter les observations; vérifier qu'aucun texte libre n'est transmis ou conservé.
6. Vérifier au clavier et à 200 % de zoom le panneau, les liens internes de compétence, puis les pages générales des quatre piliers et l'impression papier.

## Étapes futures
Avant des parcours complets adaptés à un niveau de classe ou métier : lier chaque activité à des exercices réellement catalogués avec **références versionnées** et contrôle éditorial, produire des progressions contextualisées, permettre une revue humaine et définir des garanties spécifiques pour les mineurs. Ne pas prétendre qu'une simple relation texte libre est un exercice évalué.
