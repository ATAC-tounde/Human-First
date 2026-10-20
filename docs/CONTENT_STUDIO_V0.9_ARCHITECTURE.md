# HUMAN FIRST - Architecture universelle, Studio pédagogique et trajectoire de production

**Version 0.9-alpha · 20 octobre 2026 · Statut : démonstration fonctionnelle pour adultes (18+)**

## 1. Pourquoi cette architecture est universelle

Une compétence, et non un diplôme, un âge ou un métier, est l'unité pédagogique fondamentale. Les compétences forment un graphe acyclique de prérequis ; les parcours sont des objectifs choisis ; les piliers THINK, FOCUS, LEARN et DECIDE sont des modalités de travail, jamais des niveaux de personne. L'apprenant peut ignorer, changer ou contester toute suggestion. La familiarité auto-déclarée ne vaut pas preuve d'acquisition et aucun score d'intelligence n'est inféré.

L'architecture **n'encode aucune liste finie de métiers, pays, diplômes ou matières**. Les packs apportent leurs compétences, textes multilingues, objectifs et liens. Elle reste finie en ressources informatiques : validation, tailles maximales de fichiers et nombre d'éléments bornés dans ce démonstrateur pour protéger le navigateur.

```
  SOURCES ET RÉFÉRENTIELS (licences + provenance)
                         |
                    CONTENT STUDIO
         auteurs -> brouillon -> revue -> approbation
                         |             (déclarative dans V0.9)
              release pack JSON versionné
                         |
               REGISTRY VALIDÉ V0.8
     identifiants / FR-EN / dépendances / graphes / cycles
                         |
         CONNAISSANCES + SAVOIR-FAIRE + OBJECTIFS
                         |
      moteur déterministe / objectifs choisis / explicabilité
                         |
        THINK ---- FOCUS ---- LEARN ---- DECIDE
                         |
            PORTFOLIO UTILISATEUR (opt-in)
                  export/import locaux

      PRODUCTION CIBLE, SÉPARÉE DU DÉMONSTRATEUR :
   Identité + RBAC + tenants + API + PostgreSQL + audit
           + chiffrement + RGPD + sauvegardes
```

## 2. Livrables réellement développés V0.9

- `/studio` : atelier de conception pédagogique autonome dans le navigateur, responsive, accessible au clavier.
- `public/studio/model.mjs` : **moteur éditorial pur** : création, renommage, modification, contrôle, revue, approbation déclarée, export et création de nouvelles versions.
- `public/studio/app.mjs` : interface de création et modification de **packs, compétences et parcours** ; deux langues, quatre piliers par compétence, prérequis, contextes professionnels, tags de métiers et qualifications, droits et provenance.
- `public/studio/studio.css` : mise en page de travail, panneaux de contenu / propriétés / revue ; aucun framework, aucune API tierce.
- **Statuts gérés** : `draft` → `in-review` → `approved` → `published` (export local). Réouverture avant publication, révision SemVer après publication.
- **Gates de publication** : validations structurelles par le **même registre** que l'apprenant (`createRegistry`), aucun cycle, traductions FR/EN, licence reconnue, auteur, relecteur différent, six rubriques de revue.
- **Portabilité** : fichier de travail `hf.studio.document.v1` ; pack JSON runtime `hf.studio.release.v1` compatible avec l'import de `/journey` ; avis explicite `local-only`, `reviewerIdentityVerified:false`, `certification:none`.
- **Aperçu déterministe** : le studio utilise `buildJourney` du moteur V0.8 pour vérifier le premier parcours et ses prérequis.
- **PostgreSQL prévu, non activé** : migration de conception `migrations/0001_lifelong_learning.sql`, avec organisations, membres, taxonomies, versions de packs, relectures, graphe d'index de compétences, profils, consentements et événements de portfolio ; isolation RLS tenant préparée. **Le fichier SQL n'est ni appliqué à une base réelle ni utilisé par l'application actuelle.**
- **Tests** : transitions, validation des graphes, licences, absence de publication silencieuse, statut de revue, import de fichiers non fiables, non-régressions.

## 3. Contrat de données, éditorial et stabilité

### Pack runtime (exemple minimal)

```json
{
  "id": "hospitalite",
  "version": "1.0.0",
  "title": {"fr": "Accueil et communication", "en": "Hospitality and communication"},
  "competencies": [{
    "id": "hospitalite.clarifier",
    "title": {"fr": "Clarifier une demande", "en": "Clarify a request"},
    "outcome": {"fr": "Reformuler une consigne de travail.", "en": "Restate a workplace instruction."},
    "tags": ["service"],
    "requires": ["core.evidence"],
    "activities": {
      "think": {"fr": "Identifier les ambiguïtés d'une demande.", "en": "Identify ambiguities in a request."},
      "focus": {"fr": "Observer avant de répondre.", "en": "Observe carefully before responding."},
      "learn": {"fr": "Restituer les critères sans notes.", "en": "Recall the criteria without notes."},
      "decide": {"fr": "Choisir une option selon ces critères.", "en": "Choose an option using those criteria."}
    }
  }],
  "pathways": [{
    "id": "hospitalite.accueil",
    "title": {"fr": "Communication professionnelle", "en": "Professional communication"},
    "summary": {"fr": "Communiquer clairement.", "en": "Communicate clearly."},
    "competencyIds": ["hospitalite.clarifier"],
    "audiences": ["work", "transition"]
  }]
}
```

Le Studio y ajoute une section `hfStudio` lors de l'**export publié** pour documenter les droits, la source, le relecteur déclaré et le statut de démonstration. Le registre V0.8 peut charger le pack sans prendre ce marqueur pour une certification. Une information de provenance n'est pas une signature d'intégrité. Les contenus importés depuis un fichier redeviennent systématiquement des **brouillons non approuvés**.

### Versionnement et migrations

Les identifiants globaux restent stables. Les *renommages* de packs via le Studio réécrivent les références internes. Chaque changement majeur compatible/incompatible est décrit par SemVer. La publication d'une nouvelle version **ne réécrit jamais** l'ancienne snapshot dans la session ; une nouvelle révision repart d'une copie du pack précédent. Le migrateur des anciens portfolios devrait utiliser une table explicite d'aliases validés, des règles de conflit et un récapitulatif donné au propriétaire avant import ; ce mécanisme est **à implémenter** dans le futur service de migration, non promis par la V0.9.

## 4. Cycle de vie éditorial et gouvernance

1. **Créer** le pack avec son identifiant et son auteur.
2. **Décrire** les compétences, leurs résultats observables et activités par pilier, en français et en anglais ; lier des prérequis à d'autres packs du registre.
3. **Documenter** la provenance, les autorisations de réutilisation, le territoire et les contextes. Ne pas stocker de données personnelles dans les exercices.
4. **Contrôler** le contrat au moyen du registre. Les fautes de structure empêchent la soumission.
5. **Soumettre** à une revue. Le brouillon devient non modifiable jusqu'à réouverture.
6. **Examiner** exactitude, pertinence pédagogique, accessibilité, droits, confidentialité, traduction. Le relecteur est distinct de l'auteur **déclaré**.
7. **Approuver** et **exporter** une version locale. Il n'existe pas encore de mécanisme serveur vérifiant l'identité des relecteurs. Une approbation locale ne vaut pas validation indépendante formelle.
8. **Réviser** par un nouveau brouillon à version supérieure ; enregistrer une nouvelle revue.

Pour une distribution publique, un véritable service éditorial devra ajouter authentification, RBAC, double contrôle, horodatage fiable, intégrité cryptographique, droits des contributeurs, licence et gestion des signalements.

## 5. RGPD, apprenants mineurs et sécurité

### Réalité V0.9

- L'atelier est **réservé aux 18+**. Aucune interface mineur n'est activée.
- Aucune transmission des champs de Studio au serveur ; `fetch`, compte, tracking, IA et stockage persistant n'existent pas dans l'atelier.
- Fichier importé : **500 ko maximum**. Le JSON est traité en tant que données, sans `eval` ni exécution d'un module externe ; les textes s'affichent par `textContent` et valeurs de champs.
- L'export contient éventuellement le nom, le métier ou la provenance déclarés. L'utilisateur en assure la conservation ; un fichier JSON téléchargé peut être lu par quiconque y accède.
- Les journaux techniques éventuels de l'hébergeur peuvent subsister lors du chargement des fichiers statiques.
- Les examens, certifications et recommandations professionnelles ne sont pas reconnues automatiquement.

### Conditions indispensables avant ouverture aux mineurs

Un produit scolaire doit disposer d'un volet distinct : revue de l'intérêt supérieur de l'enfant, âge adapté, vérification de l'établissement ou du responsable, information et consentement lorsque requis, minimisation stricte, pas de publicité ciblée/profilage, mécanismes anti-stigmatisation, possibilité de contester les évaluations, audit de biais et contrôle pédagogique humain. Le simple ajout d'un champ « classe » **n'est pas suffisant**. Toute intégration scolaire implique une analyse juridique du pays et des obligations de protection des données.

### Production et modèle de menace

La migration SQL contient des structures **de conception**, pas un backend sécurisé opérationnel. Le stockage durable multitenant n'est pas implémenté aujourd'hui. Le futur backend doit imposer :

- SSO/OIDC ou authentification éprouvée, session HttpOnly, vérification d'appartenance organisation, RBAC par opération, publication réservée aux relecteurs habilités et séparation des tâches.
- Tenant contrôlé uniquement par un backend **de confiance** ; la variable SQL `hf.tenant_id` ne doit jamais être paramétrable par un client. RLS protège le *tenant* mais ne remplace ni les contrôles de rôle ni la propriété du profil individuel.
- Conservation limitée selon finalité, chiffrement des notes/personnalisation sensibles, gestion et rotation des clés, opt-in, export, effacement, sauvegarde et effacement dans les sauvegardes selon politique approuvée.
- Audit résistant à la modification (WORM ou chaîne de hachage), migrations testées, revue de sécurité, tests d'isolement multi-organisations, protection contre abus et sécurité des importations.
- Accessibilité WCAG, versions des référentiels sourcées et vérification par un responsable métier/enseignant.

## 6. Roadmap technique de production, sans confondre étapes et réalisations

| Étape | Livrable | État |
| --- | --- | --- |
| V0.8 | Registre et moteur de parcours auto-dirigé | **Implémenté**, prototype local |
| V0.9 | Content Studio : CRUD, revue locale, versions, export, import | **Implémenté**, prototype local |
| V0.9 | Modèle Postgres + RLS : fichier migration de conception | **Écrit, non exécuté** |
| V1.0 | API authentifiée multi-tenant, stockage versionné, vraie revue sous rôles | **À développer** |
| V1.1 | Portfolios chiffrés et consentis, export/effacement de données | **À développer** |
| V1.2 | Taxonomies sourcées pays/métiers/diplômes, référentiels publics et studio de qualité institutionnelle | **À développer** |
| Mineurs | Expérience classe/âge séparée + dispositifs de protection légale et pédagogique | **Hors périmètre** |

## 7. Recette

Exécuter `npm run check`, `npm start`, puis `/studio` et `/journey`.

1. Contrôler la déclaration 18+, créer un nouveau pack, éditer le titre FR/EN, la licence, le territoire, la provenance.
2. Ajouter une compétence avec quatre exercices FR/EN, un prérequis `core.evidence`, puis un parcours qui la cible.
3. Tester des erreurs : doublon, prérequis absent, cycle, traduction vide, licence inconnue, version invalide. Le bouton « soumettre » doit refuser les données invalides.
4. Soumettre et constater les champs gelés. Essayer un relecteur de même nom, ou une revue partielle : l'approbation doit échouer.
5. Enregistrer un relecteur différent et les six contrôles. Publier : obtenir un `.json` compatible avec `/journey`, contenant `hfStudio.publication=local-only`.
6. Réimporter ce `.json` dans le Studio : il doit redevenir un **brouillon**, avec approbation vide ; le publier automatiquement est interdit.
7. Créer la version supérieure 1.0.1, vérifier la non-mutation de la version précédente.
8. Importer le pack dans `/journey` et générer un parcours. Contrôler l'absence de POST de données privées (onglet Network).
9. Tester sur mobile et zoom 200 %, lecteur d'écran, tabulation, impression et des chaînes longues.
10. Vérifier les quatre piliers existants (20 THINK, 6 FOCUS, 6 LEARN, 7 DECIDE). Aucune régression attendue.

## 8. Déploiement et accès

Le projet Vercel est actuellement configuré en mode `container` et les derniers builds échouent sur un refus d'envoi de l'image vers le Container Registry. Ce blocage relève de l'infrastructure du compte Vercel. **La PR Studio ne le corrige pas**, pour éviter une modification implicite de la production. Tester en local, puis configurer et valider le registre avec un détenteur d'accès au compte. La PR est maintenue en brouillon jusqu'à une recette complète.