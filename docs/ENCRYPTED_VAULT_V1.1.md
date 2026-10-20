# HUMAN FIRST V1.1 alpha - Le coffre d'apprentissage chiffré

## Finalité
Permettre à une personne majeure de reprendre son apprentissage dans le temps **sans créer de compte et sans confier son profil à un serveur**. L'apprenant garde le contrôle de son historique et de ses sauvegardes. Ce travail n'active **aucune** authentification nominative, aucun serveur multi-organisations et aucun système de synchronisation.

## Modèle de confidentialité
Le portfolio existant `hf.portfolio.v1` contient le contexte facultatif de l'apprenant, son choix de parcours et des métadonnées d'auto-réflexion. Il **ne** contient jamais de texte libre provenant des ateliers formatifs. En V1.1, deux sauvegardes privées et explicites :
1. Fichier `.hfvault` : portefeuille chiffré téléchargé. Un fichier externe indépendant du navigateur est nécessaire pour pouvoir le reprendre plus tard ou sur un autre appareil.
2. Coffre local facultatif : `IndexedDB` enregistre un **unique fichier chiffré** sur cet appareil et cette origine. Il ne conserve ni mot de passe, ni texte non chiffré, ni clé cryptographique. Le bouton de suppression efface cet enregistrement.

L'ancien export JSON **non chiffré** est conservé pour compatibilité, mais ses données personnelles peuvent être lues si le fichier est partagé : privilégier les nouvelles sauvegardes chiffrées.

## Cryptographie
- Schéma `hf.encrypted-portfolio.v1`, strict et versionné ; valeurs inconnues refusées.
- Dérivation `PBKDF2-HMAC-SHA-256`, **310 000 itérations minimum**, sel aléatoire de 16 octets, clé de 256 bits.
- Chiffrement authentifié `AES-256-GCM`, nonce aléatoire de 12 octets, tag 128 bits ; l'en-tête non secret est également authentifié (AAD).
- Limites avant dérivation : fichier 135 ko, texte 80 ko, coût PBKDF2 entre 310 000 et 1 000 000 itérations, tailles de nonce/sel/ciphertext strictes.
- La phrase secrète a au moins 12 caractères et n'est jamais persistée volontairement. Elle est effacée du champ après chaque opération et n'apparaît pas dans le JSON.
- Toutes les opérations utilisent **Web Crypto natif**, uniquement sur origine sécurisée (HTTPS ou localhost) ; aucune dépendance npm, appel IA ni API réseau.
- Toute manipulation du fichier ou phrase secrète erronée provoque le rejet de l'ouverture, sans remplacer le parcours existant.

### Menaces non résolues par ce chiffrement
Un navigateur compromis, une extension malveillante ou du JavaScript injecté peut accéder au profil en mémoire ou au mot de passe au moment de la saisie. La sécurité des fichiers dépend de l'entropie de la phrase secrète : le chiffrement **ne** protège pas suffisamment contre une phrase trop prévisible et n'offre aucun service de récupération. IndexedDB est lié à l'origine exacte et peut être supprimé (mode privé, nettoyage du navigateur, politique système, quota). Le chiffrement ne constitue pas une preuve scientifique de maîtrise ou une certification, ne garantit pas de sauvegarde distante, et ne remplace pas un audit indépendant.

**Recommandation d'utilisation** : choisir une phrase longue et unique dans un gestionnaire de mots de passe ; créer régulièrement un fichier chiffré externe en plus du stockage local ; garder la phrase secrète séparément.

## Comportement UI
- Le chiffrement et l'enregistrement demandent un acte volontaire ; il n'existe **aucune** sauvegarde automatique, inscription ou notification.
- `/journey` reste libre d'accès pour les 18+. Un profil peut être créé sans utiliser le coffre.
- L'import/chiffrement refuse les fichiers non `hf.portfolio.v1` et contrôle le schéma après déchiffrement.
- **À l'import dans JOURNEY**, `restorePortablePortfolio` exige que `catalogVersion` corresponde exactement au référentiel chargé. Toute autre version est refusée sans une table explicite `hf.portfolio.aliases.v1` compatible. Même à version identique, un identifiant de familiarité inconnu est refusé plutôt que supprimé silencieusement. Une table devenue obsolète est ignorée pour un portfolio de version courante ; après une restauration réussie, la table temporaire est déchargée.
- Une restauration d'un ancien portefeuille demande confirmation si un autre parcours est déjà ouvert ; une annulation conserve le parcours courant.
- En cas de manque de données (pack externe non chargé, version de tâche non correspondante, passphrase oubliée), **aucune** restauration destructive et pas de correspondance déduite automatiquement.

## Recette avant fusion
`npm run check` doit passer en CI. Sur un navigateur HTTPS ou `localhost` : créer un parcours et au moins une observation, exporter le fichier chiffré, fermer l'onglet, réouvrir `/journey`, saisir la phrase et restaurer le fichier. Vérifier que la phrase secrète et les données de profil ne figurent pas dans le fichier ; tester une phrase fausse, un fichier corrompu, des champs supplémentaires ; confirmer le respect du refus. Tester également sauvegarde/appareil, actualisation, restauration, suppression, autre navigateur, FR/EN, lecteur d'écran, navigation au clavier et 200 % de zoom. Vérifier l'absence d'appel réseau portant des données personnelles.

## Hors périmètre
Authentification nominative, sauvegarde cloud multi-appareils, gestion des droits d'organisations, clés de récupération, extension aux moins de 18 ans, certificats de compétences, conformité réglementaire auditée. La migration PostgreSQL V0.9 reste non appliquée et nécessite une revue de sécurité dédiée.

Vercel : les builds Container Registry de la Preview ont précédemment été rejetés ; GitHub Actions ne valide pas une Preview bloquée. La production ne doit pas être modifiée avant recette.


## Revue de code V1.1

Contrôles supplémentaires : import de versions anciennes sans perte silencieuse, manifeste d'équivalences périmé, mise à niveau IndexedDB avec création du magasin, échecs d'ouverture et blocages d'onglets, navigation clavier sans double arrêt sur l'input masqué, champs mot de passe visuellement cohérents, messages de progression adaptés à l'opération. Ces assertions complètent les tests Node : un test navigateur réel et une revue externe restent requis avant diffusion.
