# HUMAN FIRST V1.2 Alpha - Pilote de sauvegarde distante chiffrée

## Finalité et statut réel

Cette PR offre une **copie distante manuelle et facultative** du coffre V1.1 : un apprenant majeur peut transférer vers son propre serveur Node configuré un fichier `hf.encrypted-portfolio.v1` déjà chiffré sur son appareil. Le client officiel chiffre localement et n’envoie **ni phrase secrète, ni profil ou réponses en clair**. L’API vérifie la structure de l’enveloppe, mais ne peut pas prouver son chiffrement AES-GCM : un client modifié pourrait lui envoyer des octets arbitraires déguisés en enveloppe.

Ceci n'est pas un système de comptes, un cloud de production, un service multi-établissements ou un système certifié. Le pilote utilise un unique processus Node et un répertoire durable explicite. **Sur Vercel, il est toujours désactivé** en raison de la nature éphémère du système de fichiers des fonctions. La PR ne modifie ni les bases de production, ni les comptes, ni la configuration de déploiement existante.

## Principes de sécurité

- **Deux secrets distincts**. (1) Le code de jumelage `hfs1_` suivi de 43 caractères base64url, généré aléatoirement à partir de 32 octets Web Crypto, est une **capacité d'accès**. Toute personne détenant ce code peut lire/écraser/supprimer la sauvegarde chiffrée à laquelle il correspond. (2) La phrase secrète du coffre sert à dériver la clé de chiffrement AES-256-GCM avec PBKDF2-SHA256. Le serveur ne connaît pas cette phrase.
- Le code n'est pas ajouté à une URL, enregistré par HUMAN FIRST ou envoyé à un autre domaine. Il est saisi dans un champ de l'onglet, puis envoyé à la même origine dans un **en-tête privé**. Conserve-le séparément et protège-le comme un mot de passe. Les extensions, outils développeur et un navigateur compromis peuvent toujours l'observer en mémoire.
- Les noms de fichiers utilisent le hachage SHA-256 d'une valeur dérivée du code avec séparation de domaine, jamais le code lui-même. Le serveur vérifie le format des enveloppes avant stockage : un JSON de profil brut, un format invalide ou un fichier trop volumineux est rejeté. Sans la phrase secrète, il ne peut pas authentifier que les octets de l'enveloppe sont réellement chiffrés ; seule l'interface officielle impose le chiffrement avant envoi.
- **Transport HTTPS requis** à l'exception de loopback (`localhost`, `127.0.0.1`, `[::1]`) utilisé pour la recette. Si un proxy termine TLS, n'activer `TRUST_PROXY=1` que derrière un réseau de confiance filtrant l'en-tête `X-Forwarded-Proto`. La route de synchronisation n'accepte cet en-tête que lorsque la connexion vient de loopback ou de l'adresse configurée précisément par `HF_SYNC_TRUSTED_PROXY_ADDRESS`. Une valeur `Host: localhost` envoyée par un client extérieur ne suffit jamais à autoriser HTTP.
- Les opérations sur un même coffre sont sérialisées **dans un seul processus Node**, sans verrou persistant après un arrêt brutal. Sur systèmes compatibles, les fichiers et le répertoire sont synchronisés sur disque avant confirmation (la synchronisation du répertoire n'est pas toujours disponible sous Windows). Ce pilote ne prend pas en charge plusieurs processus écrivant dans le même dossier. Les écritures sont atomiques et **conditionnelles** : création seulement si aucun coffre n'existe (`If-None-Match: *`), modification seulement à partir de la révision ETag exacte (`If-Match`). Les suppressions exigent aussi l'ETag exact. Chaque écriture reçoit une **nouvelle révision cryptographiquement aléatoire** (y compris si le ciphertext est identique à une version antérieure), empêchant le retour d'une ancienne révision de type ABA. Les collisions produisent un refus HTTP 412 : **aucun écrasement silencieux** ni fusion magique.
- Pas de stockage de clé locale, de révision ou de mot de passe persistant. Chaque opération est déclenchée par l'utilisateur. Les réponses d'API ont `Cache-Control: no-store`, pas de cookie, et aucun journal d'activité des apprenants n'est introduit par ce lot.

### Limites explicites

Le partage du code de jumelage permet la lecture, le remplacement ou la suppression de la copie chiffrée. Perdre le code empêche de retrouver ou d'effacer cette copie par l'interface. Perdre la phrase secrète empêche son déchiffrement. Les deux sont indépendants. Aucun système de récupération, révocation de clé, rotation des capacités, identité certifiée, quotas par apprenant, politique de rétention RGPD, instrumentation anti-abus, restauration après catastrophe ou conformité à un référentiel d'audit n'est encore fourni.

Un serveur compromis peut copier, supprimer ou rejouer un ancien ciphertext sans que le pilote puisse toujours le détecter à partir d'un autre appareil. Les ETags protègent les conflits d'écriture contemporains, **pas** contre un administrateur malveillant ou un stockage rollbacké. L'encodage PBKDF2 protège contre certains essais hors ligne mais une phrase secrète faible reste vulnérable.

**Ne pas utiliser comme système de sauvegarde unique ou pour des données réglementées. Ne pas activer en production publique sans audit externe, limitation des abus, stockage durable sauvegardé, journalisation sécurisée côté infrastructure et gouvernance.**

## Configuration du pilote sur ordinateur ou serveur isolé

Prérequis : Node.js >=20, volume persistant contrôlé par l'administrateur, exposition publique **désactivée par défaut**.

Depuis la racine du dépôt déjà cloné, dans PowerShell (exemple Windows local) :

```powershell
$env:HF_SYNC_ENABLED = "1"
$env:HF_SYNC_STORAGE_DIR = (Join-Path $HOME "hf-private-sync-pilot")
npm run check
npm start
```

Ouvre `http://127.0.0.1:4173/journey`, crée un parcours, puis dans « Une copie distante », génère et conserve le code de jumelage, définis une phrase secrète (avec confirmation) dans le coffre existant, et active volontairement « Envoyer une copie chiffrée ».

À la fin, retirer les variables pour rétablir le comportement antérieur :

```powershell
Remove-Item Env:\HF_SYNC_ENABLED -ErrorAction SilentlyContinue
Remove-Item Env:\HF_SYNC_STORAGE_DIR -ErrorAction SilentlyContinue
```

Sur serveur distant, configure TLS, stockage et sauvegardes durables selon les politiques de ton hébergeur. **Le fichier de stockage est seulement une adaptation pilote mono-serveur.** Il n'est pas sûr de partager un disque éphémère entre plusieurs fonctions cloud. À l'avenir, un adaptateur Postgres/RLS ou stockage objet avec autorisation forte sera requis, avec contrôles de conformité.

## API

- `GET /api/sync/config` : état d'activation public, sans secret, même lorsque la synchronisation est désactivée.
- `GET /api/sync/v1` : en-tête `x-hf-sync-key`, renvoie l'enveloppe chiffrée et son ETag, ou 404.
- `PUT /api/sync/v1` : `x-hf-sync-key`, `x-think-first: 1`, `Content-Type: application/json`, `If-None-Match: *` pour créer, ou `If-Match: "<revision_opaque>"` pour remplacer, en réutilisant exactement l'ETag retourné par le dernier GET. Le client officiel n'envoie jamais le JSON apprenant en clair.
- `DELETE /api/sync/v1` : `x-hf-sync-key` et `If-Match` précis, suppression irréversible.
- Codes importants : 401 capacité invalide ; 403 origine non sûre/interdite ; 404 absent ; 412 conflit ; 413 taille dépassée ; 428 précondition obligatoire ; 503 désactivé ou indisponible.

Le client officiel transmet et récupère une enveloppe chiffrée avec une révision **opaque et aléatoire**. L'API accepte uniquement la structure attendue ; elle ne peut pas en vérifier l'authenticité cryptographique sans la phrase secrète. L'API ne connaît pas les compétences du parcours.

## Protocole de recette

1. Sans variables d'environnement, vérifier `enabled:false` et toutes les actions de synchronisation désactivées dans JOURNEY ; les quatre piliers et le Studio fonctionnent sans changement.
2. Activer localement, créer un code de jumelage et le copier en dehors de HUMAN FIRST. Générer un portfolio adulte et définir une phrase secrète indépendante.
3. Envoyer la copie chiffrée. Inspecter le répertoire configuré : **aucun profil en clair** et aucun code de jumelage visible dans le nom des fichiers.
4. Fermer l'onglet et rouvrir avec les deux secrets. Télécharger puis restaurer la copie ; vérifier les compétences, l'absence de texte libre exporté, le passage FR/EN.
5. Simuler deux appareils avec le même code. Faire deux GET, modifier entre les deux et tenter un PUT avec ETag dépassé : HTTP 412, aucune donnée perdue.
6. Vérifier les erreurs : code faux, phrase secrète fausse, requête depuis un autre domaine, contenu non chiffré, tentative d'effacement sans ETag, suppression annulée et suppression confirmée.
7. Faire les tests `npm run check`, tester navigateur réel (Firefox/Chromium), clavier, écran mobile, lecteurs d'écran et zoom 200 % avant toute fusion.

## Prochaine phase avant comptes institutionnels

Concevoir la gestion d'identités vérifiées, des sessions révocables, des autorisations organisationnelles, du consentement et de la suppression, le chiffrement avec rotation/récupération des clés, le contrôle de quotas et un fournisseur persistant multi-instance. Ce pilote n'est pas un raccourci pour passer directement à une offre scolaire ou médicale.
