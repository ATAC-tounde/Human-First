# HUMAN FIRST · DECIDE V0.7 Alpha - Spécification et recette

**Statut : démonstration pédagogique pour adultes, non validée scientifiquement. Aucun conseil professionnel ou outil d'aide à la décision réglementé.**

## Intention produit
Le pilier DECIDE prolonge THINK (20 exercices), FOCUS (6 pratiques) et LEARN (6 leçons). Il ne cherche pas à choisir à la place de l'utilisateur. Il encourage une **autonomie réfléchie** dans les décisions quotidiennes **à faible enjeu**.

## Contenu éditorial et limites
Sept ateliers bilingues originaux (six scénarios fictifs + une situation libre) : choix d'un outil numérique, apprentissage, collaboration, vérification d'une affirmation, organisation, classement fourni par une IA, décision personnelle non sensible. Chaque situation offre deux options modifiables, des questions de vérification, une recommandation fictive volontairement simpliste à analyser, une remise en question et une activité hors écran. Les 7 scénarios **ne constituent pas** une mesure validée de compétence décisionnelle et ne doivent pas être utilisés pour le diagnostic, l'orientation de santé, la finance, le droit ou la psychologie.

## Parcours fonctionnel
1. `D-01` L'utilisateur choisit un des sept ateliers (18+ auto-déclaré). Aucun nom, compte ou identification n'est requis.
2. `D-02` Il définit librement son objectif et jusqu'à trois critères. Pas de score, poids imposé ni classement des critères.
3. `D-03` Il compare deux options modifiables, leurs compromis et éventuellement une troisième piste.
4. `D-04` Il distingue information vérifiable, hypothèse et parties potentiellement concernées.
5. `D-05` Il examine une **recommandation d'IA fictive pré-écrite**, jamais une sortie IA en direct ; l'exemple n'apparaît à l'écran qu'après les étapes précédentes, mais le texte public du fichier JavaScript n'est pas une protection cryptographique.
6. `D-06` Il formule un choix provisoire, ou décide de différer, puis détermine les conditions de révision et une activité hors écran.
7. `D-07` Tous les champs sont facultatifs : avancer, revenir et quitter sont autorisés sans justification. Une action « terminer et effacer » efface les saisies.
8. `D-08` Une fiche **vierge** est imprimable sans les réponses personnelles, qui ne sont jamais intégrées au DOM de la fiche d'impression.
9. `D-09` La navigation THINK/FOCUS/LEARN/DECIDE préserve la langue FR/EN dans l'URL, sans localStorage, cookies créés par DECIDE ni transfert de réponses.

## Confidentialité et sécurité
- DECIDE est un outil **100 % local dans le navigateur après chargement des ressources statiques**. Pas de `fetch`, XHR, WebSocket, appels IA, télémétrie, analytics, timers, notifications, localStorage ou sessionStorage dans `decide.js`.
- Les saisies restent dans les champs DOM de l'onglet actif. Elles sont effacées lors de « quitter », « terminer » et lors d'une actualisation/navigation. Le navigateur, le système d'exploitation, un gestionnaire de mots de passe ou des extensions peuvent néanmoins appliquer leurs propres mécanismes : ne jamais promettre le secret absolu.
- Les fichiers statiques et le serveur d'hébergement peuvent produire des **journaux techniques standard** lors du chargement des ressources ; « aucun suivi analytique par DECIDE » ne signifie pas absence totale de métadonnées de connexion.
- Le modèle d'apprentissage ne calcule aucun classement, aucun niveau psychométrique, aucune réponse « correcte ». L'IA active de THINK V0.4 reste désactivée par défaut.
- Il faut informer les adultes de ne pas saisir de données privées ou décisions médicales, financières, juridiques ou de sécurité.

## Tests automatisés
`npm run check` doit inclure `node --check public/decide-data.mjs && node --check public/decide.js` et `tests/decide.test.mjs` via `node --test tests/*.test.mjs`.

- Unicité des 7 IDs et contenu complet FR/EN, 5 étapes, 4 questions de recul.
- Absence d'appels de stockage, réseau ou chronomètre dans DECIDE.
- Routage statique `/decide`, `/decide?lang=en`, `/decide.html`, `/decide.js`, `/decide-data.mjs`, `/decide.css` ; en-têtes de sécurité et absence de cookies.
- Non-régression des 20 exercices THINK, des routes FOCUS et LEARN (6 leçons).
- Impression d'une fiche vierge sans les champs saisis.

## Recette visuelle et accessibilité manuelle obligatoire
- Desktop et smartphone, 200 % de zoom, navigation clavier, lecteur d'écran ; vérifier le focus après la sélection, les étapes et le retour.
- En FR et EN : ouvrir les sept situations ; vérifier les traductions et la langue des liens de retour.
- Saisir un texte **fictif**, naviguer en arrière puis en avant ; confirmer que la saisie reste uniquement pendant l'atelier. Quitter et recommencer : les champs doivent être vides.
- Passer toutes les étapes sans répondre ; aucun blocage, classement, notification ni stigmatisation.
- Utiliser les outils développeur Network : ressources statiques uniquement, aucune requête POST ou transmission du texte.
- Prévisualiser l'impression : seulement les cinq rubriques vierges, **aucun texte personnel**.
- Tester le retour vers THINK, FOCUS et LEARN ; vérifier les 20 exercices et six leçons existants.
- Vérifier que les recommandations fictives d'IA ne sont **pas** présentées comme des résultats générés ou approuvés par un modèle.
- Ne pas publier des promesses d'efficacité. Pas d'expérimentation avec des participants sans revue éthique, légale et protection des données.

## Déploiement
PR dédiée partant de `main` après fusion de LEARN #14. Le build Vercel rencontre actuellement une erreur externe de refus d'écriture du registre d'images Docker `vcr.vercel.com` ; cet échec est indépendant des tests Node et nécessite une résolution du registre/autorisation avant une recette Preview fiable. Pas de fusion automatique en production.