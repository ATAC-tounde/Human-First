# HUMAN FIRST - Déploiement Vercel (Node.js natif)

## Diagnostic du 23 octobre 2026
Le projet Vercel **human-first** avait le préréglage **container**. Les déploiements de `main` échouaient pendant la publication d'une image sur `vcr.vercel.com` (« push denied »), avant de pouvoir servir l'application. Le succès des tests GitHub Actions ne suffit pas à établir la disponibilité en ligne.

## Architecture corrigée
- `vercel.json` définit le framework **Other** (`null`), `public/` comme répertoire statique et des réécritures pour les URL propres `/focus`, `/learn`, `/decide`, `/journey`, `/studio`.
- `api/index.mjs` reçoit les requêtes `/api/*` en Node.js Function. Le chemin API d'origine est transmis par la réécriture et reconstitué avant de réutiliser le même gestionnaire `handleRequest(req,res)` qu'en local.
- `server/index.mjs` garde `npm start` pour un serveur classique, mais **n'ouvre aucun port lorsque `VERCEL=1`**.
- Le `Dockerfile` reste utilisable dans un hébergement de conteneur distinct ; Vercel ne doit plus choisir le mode Container Registry.
- Aucun stockage de fichiers distant ne doit être activé sur Vercel : `HF_SYNC_ENABLED` doit rester désactivé et `/api/sync/config` doit indiquer `enabled:false`.

## Secrets et sécurité
`HF_SESSION_SECRET` doit être défini dans les variables d'environnement chiffrées Vercel, pour les environnements pertinents. Utiliser une valeur cryptographiquement aléatoire et stable pour les sessions, **sans** la committer ni la partager. Le gestionnaire renvoie `503` si elle manque. En Preview, les URLs peuvent être protégées par Vercel Authentication ; ne pas désactiver la protection pour faciliter la recette.

## Procédure contrôlée
1. Garder la branche de réparation en PR ; `npm run check` doit passer.
2. Vérifier dans Vercel que **Framework Preset = Other** et non Container ; la configuration versionnée devrait prendre le dessus.
3. Déployer la branche en **Preview** puis vérifier `/`, `/journey`, `/studio`, `/api/health`, `/api/catalog?lang=en`, `/api/paths`, `/api/sync/config`.
4. Vérifier un exercice THINK complet en session : `POST /api/session/start` avec l'en-tête attendu, puis progression, relecture et cookie sécurisé. Ne tester qu'avec une clé de session d'environnement propre.
5. Après revue et tests de Preview, fusionner la PR vers `main` pour déclencher une nouvelle construction **Production**. Vérifier un déploiement `READY`, le commit exact, l'assignation de domaine, puis tester les URL publiques et les erreurs d'exécution.
6. Éviter de déclencher un déploiement à chaque fichier : la fréquence excessive peut provoquer des limites de construction sur les comptes Hobby.

## Séparation des domaines et mise en production automatique

**État vérifié le 23 octobre 2026** : les deux domaines `atac-academy.site` et `www.atac-academy.site` ont été retirés de la configuration de domaines du projet Vercel `human-first`. Le **seul domaine de projet personnalisé restant** est `human-first-alpha.vercel.app`. L'attribution automatique des domaines aux nouveaux déploiements de production a été réactivée **après cette vérification**.

| Produit | Dépôt source | Plateforme de production | Domaine |
| --- | --- | --- | --- |
| HUMAN FIRST | `ATAC-tounde/Human-First` | Vercel `human-first` | `human-first-alpha.vercel.app` |
| ATAC Academy | `ATAC-tounde/istqb-certification-academy` | Cloudflare Workers + D1 | `atac-academy.site` |

Les futures fusions de la branche `main` de HUMAN FIRST déclenchent la construction Vercel native. Le domaine HUMAN FIRST doit être automatiquement associé au nouveau déploiement `READY`; une PR doit d'abord passer ses contrôles GitHub Actions et la recette nécessaire. Le CI/CD ATAC Academy est **indépendant** et utilise Cloudflare Workers Builds.

**Invariants de sécurité à contrôler avant chaque mise en production** :
- Les domaines ATAC Academy ne doivent **jamais** réapparaître dans `Settings > Domains` du projet Vercel `human-first`.
- Ne pas créer d'alias Vercel `atac-academy.site` ni rediriger le DNS Cloudflare d'ATAC Academy vers HUMAN FIRST.
- Vérifier le commit de la nouvelle production sur `human-first-alpha.vercel.app` après chaque fusion.
- Le statut `READY` signifie déploiement construit, **pas** recette HTTP/applicative complète.
- Ne pas activer le service expérimental de synchronisation distante sur un stockage éphémère.

**Historique** : avant la séparation, les anciennes associations Vercel ATAC Academy pointaient vers le déploiement HUMAN FIRST historique `ccd106e5b671`. Ce lien ne doit pas servir de base à une restauration d'ATAC Academy. Sa source de vérité est Cloudflare Workers, pas Vercel.

## Retour arrière
Si le déploiement natif pose problème, utiliser l'historique de Vercel pour revenir au dernier déploiement fonctionnel. Une rétrogradation Git sans déploiement fonctionnel n'est pas suffisante. Ne pas déclencher de promotion d'une Preview non recettée.
