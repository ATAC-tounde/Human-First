# V1.4 - Bibliothèques de connaissances en un clic

## Usage pour l'apprenant

Ouvrir **MON PARCOURS / JOURNEY**, puis la section **Bibliothèques prêtes à charger**. Les boutons **Charger la bibliothèque / Load library** ajoutent un pack de démonstration FR/EN validé techniquement. La sélection propose un nouveau parcours. Si l'accès adulte 18+ est confirmé, le parcours peut se générer immédiatement. Sinon, confirmer son âge puis choisir **Créer mon parcours**.

Les quatre bibliothèques sont **information numérique**, **lecture des données**, **lecture critique de l'information de santé** (sans diagnostic ni conseil médical) et **organisation de projet**. Il s'agit d'exemples pédagogiques originaux et non d'ouvrages de référence vérifiés par des experts. Ils ne confèrent aucune compétence certifiée. Les boutons désactivent la double-importation en indiquant **Bibliothèque chargée / Library loaded**.

Aucun appel réseau, téléchargement ou stockage du profil n'est déclenché par ce choix : les packs sont fournis avec l'application, puis validés en mémoire par le moteur `createRegistry`. Une actualisation de la page retire les packs ajoutés. Pour réutiliser un portfolio exporté, **recharger les mêmes bibliothèques dans le même ordre et avec les mêmes versions** avant d'importer le portfolio : le catalogue doit correspondre à `catalogVersion`. Si le fichier dépend d'un pack personnalisé, il faut aussi recharger ce pack. Une version différente nécessite une table d'équivalences explicite et vérifiée. Aucun contenu n'est abandonné silencieusement. L'import est refusé si la bibliothèque requise n'est pas disponible.

## Usage pour le rédacteur

Dans **STUDIO**, les mêmes bibliothèques s'ouvrent en cliquant sur **Utiliser comme modèle / Use as a template**. La création du document démarre au statut `draft`, sans reviewer ni publication, et le brouillon est entièrement modifiable. Un contenu déjà modifié fait l'objet d'une confirmation avant remplacement. Un modèle ne contourne ni les contrôles de licence ni la revue humaine indépendante.

## Format JSON à importer

Télécharger **`public/examples/knowledge-pack-template.json`**, modifiable dans un éditeur de texte ou dans Studio, puis importer le fichier depuis JOURNEY ou STUDIO. La racine doit contenir :

| Champ | Type | Fonction |
| --- | --- | --- |
| `id` | 2 à 40 caractères ; commence par une lettre minuscule, puis minuscules, chiffres et tirets | Namespace unique du pack |
| `version` | chaîne `X.Y.Z` | Version sémantique du pack |
| `title` | objet `{fr,en}` | Titre bilingue |
| `competencies` | tableau | Compétences et activités |
| `pathways` | tableau | Parcours sélectionnables |

Chaque compétence possède `id` namespacé (`pack.competence`), `title.fr/en`, `outcome.fr/en`, `tags[]`, `requires[]` et `activities.think/focus/learn/decide` avec leurs textes `fr` et `en`. Les `contexts` (situations) sont facultatifs, par exemple `work: {fr,en}`. Chaque parcours possède `id`, `title.fr/en`, `summary.fr/en`, `competencyIds[]`, et éventuellement `audiences[]`.

Les références croisées peuvent pointer vers les compétences du **pack en cours d'import**, celles des packs déjà chargés ou celles des packs installés. Le moteur refuse les cycles et les identifiants dupliqués (y compris une collision compétence/parcours). Les fichiers ne contiennent pas de JavaScript exécutable. Les packs sont limités à **150 kB** dans JOURNEY ; l'import dans Studio accepte jusqu'à **500 kB** (brouillons et packs). Les brouillons Studio complets `hf.studio.document.v1` sont destinés à Studio uniquement ; seuls les packs JSON bruts s'importent dans JOURNEY.


## Parcourir et pratiquer sans chercher partout

Une fois le parcours créé, le panneau **Retrouver mon fil d'apprentissage** indique uniquement le nombre de compétences du parcours et celles pour lesquelles une étape personnelle a été déclarée : **ce n'est ni un score ni une progression certifiante**.

- **Commencer ma prochaine activité / Start my next activity** ouvre la consigne bilingue correspondant à la compétence et au pilier suggérés par la Boussole. L'apprenant peut changer de pilier directement entre THINK, FOCUS, LEARN et DECIDE.
- Les cartes et la Boussole proposent également **Voir la consigne / Read the instruction** en un clic. Il s'agit **du texte d'activité du pack chargé**, pas d'un lien automatique à un exercice noté du catalogue général. Un lien séparé propose d'explorer le pilier entier.
- La pratique guidée propose trois marqueurs **J'ai exploré / I explored this**, **J'ai pratiqué / I practiced this**, **À revoir / Review later** ; seule la dernière étape déclarée pour une compétence est affichée. Aucune réponse libre n'est envoyée ni conservée.
- La barre **Rechercher une compétence / Find a skill** accepte les titres, sujets, mots-clés ou identifiants, sans tenir compte des accents et de la casse ; les filtres permettent de retrouver les compétences **sans étape**, **explorées**, **pratiquées** ou **à revoir**.
- **Compétence suivante / Next skill** passe à la compétence suivante de la liste, sans imposer un ordre obligatoire. La navigation au clavier, le retour de focus et la traduction des noms accessibles sont pris en charge.
- Une bibliothèque déjà chargée affiche maintenant **Ouvrir le parcours / Open this pathway**, permettant de la retrouver en un clic dans le même onglet. Un identifiant déjà utilisé par un autre pack est signalé, sans le remplacer silencieusement.

Les marqueurs sont exportés dans le portfolio JSON et les sauvegardes chiffrées **sur action volontaire uniquement** ; en revenant après fermeture, l'apprenant doit recharger les bibliothèques qui avaient été utilisées avant d'importer son portfolio. La recherche, le filtre et l'activité actuellement ouverte sont des préférences d'interface éphémères et ne sont pas exportés. La langue choisie reste persistante lors de la navigation.

## Qualité, accessibilité, langues et limites

- Les libellés des bibliothèques sont communs à JOURNEY et STUDIO, en français ou anglais, même après un changement de page.
- Les nouvelles actions ont au moins **44 px** de hauteur, un focus clavier visible, un nom de compétence propre pour les lecteurs d'écran, et un retour `aria-live` en cas de chargement.
- Le changement de langue n'altère pas les libellés édités par les contributeurs : seuls les contenus `fr/en` sont sélectionnés.
- Aucun suivi, profilage, certification, recommandations médicales individuelles ni activation pour mineurs.
- Aucune publication automatique et aucun nouveau stockage ou endpoint privé.

## Recette

1. Lancer `npm run check`, y compris `tests/libraries.test.mjs`.
2. Dans JOURNEY, ajouter une bibliothèque, constater qu'un seul clic suffit et que le parcours proposé est sélectionné ; répéter pour les quatre.
3. Confirmer 18+, construire un parcours, changer de bibliothèque, vérifier que les déclarations restent intactes et que le programme est actualisé.
4. Basculer EN/FR et naviguer entre JOURNEY et STUDIO sans réinitialisation de la langue ; vérifier le nom accessible de chaque bouton.
5. Dans STUDIO, ouvrir un modèle, modifier, exporter un brouillon ; confirmer qu'un changement de modèle après modification nécessite une confirmation.
6. Télécharger le modèle JSON, l'importer dans les deux pages et vérifier la structure et les refus de doublons ; vérifier l'absence d'envoi de texte au serveur.
7. Tester la navigation au clavier, le zoom 200 %, les cartes mobiles, puis vérifier la Preview Vercel avant fusion.
