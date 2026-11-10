# HUMAN FIRST - Design system commun (V1.4)

## Principe
La navigation est **un composant unique**, qui ne change jamais de logo, de position, de libellés, d'ordre ni de style lorsque l'on navigue entre les six pages. Les pages utilisent le **même HTML de navigation** et chargent le même CSS (`/ui/header.css`). Le code partagé (`/ui/header.mjs`) ne gère que la langue FR/EN, les liens localisés et l'état actif. Il **ne modifie aucune donnée pédagogique**.

### En-tête canonique
- Logo : monogramme HF vert foncé + mot-symbole HUMAN FIRST + « INITIATIVE INDÉPENDANTE ».
- Liens, dans cet ordre : **Notre méthode**, **FOCUS**, **LEARN**, **DECIDE**, **MON PARCOURS**, **STUDIO**, **Nos engagements**.
- À droite : bouton de langue **EN/FR**, de taille et de position identiques.
- Le logo ramène à THINK (accueil). Les liens de méthode et d'engagements vont aux ancres de la page d'accueil.
- L'élément actif est distingué par la couleur, la graisse et un fond accessible ; les éléments non actifs conservent leur place.
- Palette : blanc cassé chaleureux, vert forêt foncé et texte à contraste élevé. Sans néon, dégradé criard, pointillés de fond ni surcharge décorative.

### Petits écrans et accessibilité
Les liens restent accessibles au clavier et **ne disparaissent jamais sur mobile**. Sous 1100 px, le logo et le sélecteur de langue restent sur la première ligne ; le menu utilise une rangée horizontale défilante. La navigation ne coupe pas les libellés, propose des surfaces de sélection d'au moins 44 px et un focus bien visible. Les contrastes des couleurs et les noms accessibles doivent être vérifiés dans le navigateur pendant la recette finale.

### Règles permanentes
1. Ne pas créer un autre header dans THINK, FOCUS, LEARN, DECIDE, MON PARCOURS ou STUDIO.
2. Toute évolution de libellé, logo ou ordre doit être effectuée **simultanément sur les six pages**. Le test `tests/header.test.mjs` protège leur stricte égalité.
3. Ne pas ajouter de flèches décoratives dans les menus, boutons, cartes ou intitulés. Privilégier les verbes explicites (« Continuer », « Retour », « Explorer », « Fermer »).
4. L'interface FR/EN reste persistante entre les pages via `language.mjs`, sans traduire les données personnelles de l'apprenant ni ses notes.
5. Conserver un style sérieux et lisible, y compris sur mobile, zoom 200 %, impression et navigation clavier.
6. Ne pas forcer une publication avant la vérification des tests de non-régression et l'inspection de la Preview.

### Recette manuelle recommandée
- Contrôler les six pages à 1440, 1200, 768 et 375 px. Faire défiler la barre sur téléphone : chaque lien doit rester cliquable.
- Vérifier que le logo ne change pas, que le texte ne saute pas et que la barre ne provoque pas de débordement horizontal de la page.
- Sur chaque page, changer FR/EN puis naviguer vers un autre pilier et Studio ; les libellés et la langue doivent rester cohérents.
- Tester au clavier tous les liens et le bouton de langue, puis zoomer à 200 % ; aucun élément ne doit être caché ou superposé.
- Tester les boutons d'activité, les formulaires, l'import JSON et la recette complète des quatre piliers.
