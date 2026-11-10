# HUMAN FIRST - Règles d'interface communes

## Identité, lisibilité et contraste

HUMAN FIRST utilise une esthétique claire, professionnelle et chaleureuse : fond ivoire, encre vert foncé, contours sobres et accents terre. Aucun néon, dégradé voyant ni décoration parasite dans la navigation. Le logo est **toujours le monogramme HF dans un carré vert** et le nom est **HUMAN FIRST**. La ligne « INITIATIVE INDÉPENDANTE » (EN : « INDEPENDENT INITIATIVE ») ne doit jamais changer selon le pilier consulté.

Couleurs du bandeau : voir les variables `--hf-*` de `public/ui/header.css`. Les textes normaux doivent maintenir un contraste au moins **4,5:1**, les éléments interactifs un focus clavier visible. Le bandeau reste en place au défilement ; les ancres internes réservent suffisamment d'espace pour que les titres ne soient pas masqués. Les boutons et liens ont une zone de contact d'au moins 44 px.

## Un seul bandeau pour les six pages

Le module `public/ui/header.mjs` est la **source unique** de structure, logo, ordre des liens, noms et routes. Les six pages utilisent le même élément `<header class="hf-header" data-hf-header>` et chargent `/ui/header.css`.

Ordre invariant : **THINK, FOCUS, LEARN, DECIDE, MON PARCOURS, STUDIO, Notre méthode, Nos engagements**. En anglais : **THINK, FOCUS, LEARN, DECIDE, MY JOURNEY, STUDIO, Our method, Our commitments**. L'élément actif est identifié par `aria-current="page"` ; sélectionner ce lien ne réinitialise pas le travail en cours.

Chaque HTML possède un **bandeau de secours identique** et immédiatement navigable avant JavaScript. Le JS le transforme avec `mountHeader(page,locale)`. Le composant conserve les anciens identifiants utilisés par chaque application et expose `refreshHeaderLanguage(locale)`. La traduction des contenus du pilier ne doit pas dicter celle du bandeau lorsqu'un exercice conserve une langue verrouillée.

**Toute nouvelle page** doit reprendre ce composant et ajouter son type à `headerModel` ainsi qu'aux tests ; aucune barre artisanale ne doit être créée par page.

## Langue, menu mobile et vie privée

Les pages continuent de contrôler la langue utilisateur via `initialLanguage()` et `syncLanguage(locale)` ; elles appellent ensuite explicitement `refreshHeaderLanguage(locale)`. Seule la préférence d'interface FR/EN est persistée : ni navigation ni bandeau n'enregistrent le contenu pédagogique ou les réponses.

Sous 1030 px, le menu devient un panneau accessible. Le bouton **Menu / Close menu** gère `aria-expanded`, déplace le focus sur le premier lien à l'ouverture, se ferme avec **Échap** et rend le focus au bouton. Sans JS, le menu reste affiché sous forme de grille de liens. À 320 px, le monogramme et les contrôles doivent rester visibles sans défilement horizontal.

## Libellés et symboles

Un intitulé désigne **toujours la même action** sur toutes les pages. Pas de variantes opportunistes pour les mêmes rubriques et pas de texte non traduit. Les flèches décoratives (`↗`, `→`, `←`, etc.) sont supprimées des boutons, des cartes, des liens et des illustrations. Privilégier des verbes directs : **Ouvrir, Choisir, Revenir, Continuer, Vérifier, Terminer, Importer, Exporter**. Les étapes d'un processus peuvent être séparées par des mots ou des points, jamais par une succession de flèches.

## Recette obligatoire

- `npm run check`, avec `tests/header.test.mjs` et les tests d'intégration FOCUS, LEARN, DECIDE et JOURNEY.
- Vérifier les **six espaces** : logo, ordre, hauteur, couleurs, intitulés, version en français et en anglais.
- Contrôler l'accessibilité du menu au clavier, du lien d'accès rapide et des ancres `#method` et `#ethics`.
- Vérifier à **320, 375, 768, 1024 et 1440 px**, puis à 200 % de zoom, avec et sans JavaScript.
- Confirmer que les activités, imports, exports, sauvegardes locales et changements de langue ne régressent pas.
- L'état `READY` de Vercel ne dispense pas d'une recette visuelle et fonctionnelle dans un navigateur.

Ce guide est une règle de maintenance durable, pas une autorisation d'effacer les spécificités pédagogiques de chaque pilier.
