# HUMAN FIRST - Architecture universelle et extensible des apprentissages

**Version : 0.8-alpha.** Statut : noyau démonstrateur. Les quatre piliers THINK, FOCUS, LEARN et DECIDE restent autonomes et disponibles. Cette version n'offre ni diplomation ni diagnostic certifié.

## 1. Principe d'architecture

> La compétence est l'unité de référence ; le pilier est la modalité pédagogique ; le parcours est une vue personnelle, libre et révisable. L'utilisateur conserve le contrôle.

```
        PACKS VERSIONNES (référentiels déclaratifs FR/EN)
         Domaine -> Compétences -> Prérequis -> Cas -> Activités
                              |
                              v
                    REGISTRY / VALIDATION
                 Identifiants, versions, DAG
                              |
          PROFIL ADULTE ------+------ OBJECTIFS CHOISIS
         âge optionnel / contexte / acquis auto-déclarés
                              |
                              v
               MOTEUR D'ORCHESTRATION DETERMINISTE
                 dépendances -> objectifs -> activités
                              |
         +--------------------+--------------------+
         |                    |                    |
         v                    v                    v
   THINK | FOCUS           LEARN               DECIDE
         +--------------------+--------------------+
                              |
                 PORTFOLIO UTILISATEUR PORTABLE
               JSON versionné, import/export opt-in
```

Le modèle ne fige **aucune liste exhaustive** de professions, de pays, de diplômes, de disciplines ou de compétences. La V0.8 fournit quatre exemples de packs ; les nouveaux catalogues respectant le schéma sont ajoutés sans modification de l'algorithme central. « Sans limite » signifie **extensible par contrat** : pas des ressources informatiques infinies, ni une promesse de prise en charge de tous les publics immédiatement.

## 2. Modules livrés

| Fichier | Responsabilité |
| --- | --- |
| `public/journey/engine.mjs` | Contrat des packs, validation, registre, DAG, planification, portabilité |
| `public/journey/packs.mjs` | Quatre packs d'exemples versionnés, 12 compétences et 5 parcours |
| `public/journey/app.mjs` | Interface privée, consentement majeur, générateur et suivi déclaratif |
| `public/journey.html`, `public/journey.css` | Atelier pédagogique FR/EN, accessible, responsive, imprimable |
| `tests/journey.test.mjs` | Contrats, graphes, sécurité, non-régressions quatre piliers |

Dans la V0.8, le moteur **tourne dans le navigateur** : il reçoit le profil et génère les propositions sans envoyer les informations personnelles au serveur. Le serveur sert uniquement les assets statiques à routes explicites. Un futur serveur multi-utilisateur pourra employer une version partagée du cœur pur avec **consentement explicite**, authentification, isolation des organisations et des personnes, chiffrement, journaux d'accès et politique de conservation.

## 3. Contrat des packs

Chaque fichier de pack exporte une structure déclarative (pas de code arbitraire exécuté depuis un utilisateur), par exemple :

```js
const pack = {
  id: 'hospitality',
  version: '1.0.0',
  title: {fr: 'Accueil et service', en: 'Hospitality and service'},
  competencies: [{
    id: 'hospitality.check',
    title: {fr: 'Vérifier une consigne', en: 'Check an instruction'},
    outcome: {fr: 'Clarifier une demande ambiguë', en: 'Clarify an ambiguous request'},
    tags: ['profession', 'hospitality'],
    requires: ['core.evidence'],
    activities: {
      think: {fr: 'Identifier les ambiguïtés dans une consigne.', en: 'Identify ambiguities in an instruction.'},
      focus: {fr: 'Lire attentivement une consigne avant d’agir.', en: 'Read an instruction attentively before acting.'},
      learn: {fr: 'Restituer les critères sans les notes.', en: 'Recall the criteria without notes.'},
      decide: {fr: 'Vérifier quelle option respecte les critères.', en: 'Check which option meets the criteria.'}
    },
    contexts: {work: {fr: 'Exemple dans un service d’accueil.', en: 'Example from a reception service.'}}
  }],
  pathways: [{
    id: 'hospitality.practice',
    title: {fr: 'Qualité de service', en: 'Service quality'},
    summary: {fr: 'Pratiquer en situation professionnelle.', en: 'Practice at work.'},
    competencyIds: ['hospitality.check'],
    audiences: ['work', 'transition']
  }]
};
```

**Validation** : identifiants globaux namespacés, versions semver, textes FR/EN complets, quatre piliers, liens de prérequis existants, zéro cycle de dépendances, unicité des ID de packs/parcours/compétences. En cas d'erreur, le registre échoue explicitement plutôt que d'afficher un parcours incomplet. L'ordre des compétences est obtenu par parcours topologique stable, en incluant les prérequis avant leurs objectifs. Les compétences ne sont jamais masquées selon le diplôme ou l'âge.

**Versionnement** : `pack@major.minor.patch`, `hf.profile.v1`, `hf.journey.v1`, `hf.portfolio.v1`. L'export signale la version du catalogue d'origine et un import sous une nouvelle version affiche un avertissement. V0.9 devra fournir un mécanisme de migrations des identifiants de compétences, avec compatibilité de schémas et historique signé des packs, avant tout usage durable.

## 4. Personnalisation honnête

Le profil facultatif contient : âge **sous forme de tranche adulte**, situation (apprentissage personnel, études supérieures, reprise d'études adulte, métier, reconversion, enseignement), diplôme déclaré, métier déclaré, rythme souhaité, objectif choisi et familiarité **auto-déclarée**. Le parcours est ensuite déduit du choix de l'utilisateur et de la structure pédagogique vérifiée du pack. La situation peut sélectionner un exemple contextualisé.

**Pas de détermination de capacités à partir de l'âge, du métier ou du diplôme.** Le métier et le diplôme sont actuellement des champs de contexte libre, pas des entrées d'un système de recommandation automatisé. La V0.9 pourra proposer une taxonomie de compétences métier et de qualifications, publiquement documentée, vérifiable et révisable par la personne. Toute évaluation ultérieure doit définir une grille et une preuve observable ; « se sentir à l'aise » reste une auto-déclaration, jamais une certification.

Le temps d'activité est **indicatif** (20 minutes par compétence pour construire une estimation), sans minuteur, streak, score ni verrou de progression. Un utilisateur peut accéder librement à chaque pilier et refaire toute compétence.

## 5. Portabilité et droits de l'apprenant

- Aucun compte, aucun cookie de profil, aucun `localStorage` ou `sessionStorage` ajouté par JOURNEY ; les champs vivent uniquement dans le document navigateur courant jusqu'à actualisation/fermeture.
- L'export JSON est une action intentionnelle. Il contient contexte, objectif, auto-déclaration et événements `explored`, `practiced`, `review-later`, horodatés. Aucune réponse longue ni journal des erreurs, aucun score, aucune preuve de diplôme.
- L'import vérifie le format et filtre les propriétés inconnues. Taille de fichier bornée à 80 ko ; cette limite de sécurité du prototype sera remplacée par des stratégies de pagination/stockage à l'étape multi-utilisateurs.
- Toute personne peut effacer la séance ; aucun rappel ou compte n'est requis. **Attention** : le fichier exporté reste sous la responsabilité de l'utilisateur et peut contenir des informations personnelles déclarées. Il doit être conservé en lieu sûr.
- Les hébergeurs peuvent conserver leurs **logs HTTP techniques** lors du chargement des fichiers statiques : ne pas prétendre à l'absence absolue de journaux serveur.

## 6. Pour la véritable éducation tout au long de la vie

### Extension future par niveaux et référentiels

1. **V0.9 - Référentiels et Studio** : CRUD de packs brouillons/publiés, contrôle éditorial, validation des cycles, provenance des sources, révisions et traductions, taxonomies modulaires de diplômes/métiers/compétences, référentiels propres aux pays et organismes.
2. **V1.0 - Parcours individualisés explicables** : diagnostic facultatif fondé sur des tâches réelles, règles versionnées, prérequis, recommandations révisables, import de compétences externes, preuves et appréciations humaines. Refus des classements non expliqués.
3. **V1.1 - Portfolio durable** : stockage personnel consenti, authentification facultative, autorisations par ressource, export/import, suivi des versions et révocation, migrations de schémas, effacement et portabilité ; configuration de conservation et journal d'accès.
4. **V1.2 - Métier / diplôme / territoire** : référentiels nationaux et internationaux sourcés, modules métiers et savoir-faire, parcours de reconversion, formation continue et enseignement supérieur. Aucune équivalence officielle sans validation par les autorités compétentes.
5. **Mineurs - volet séparé** : le prototype actuel reste **18+**. Avant l'accès des enfants et adolescents : conception dédiée par âge/classe, évaluation des risques, traitement adapté des données, consentement parental quand requis, contrôles enseignants/établissements, garde-fous contre classement et profilage préjudiciables, revue juridique et pédagogique.

### Architecture cible si une plateforme commerciale est souhaitée

- **API de contrat / Catalog Service** : référentiels immuables publiés, versionnés, approuvés, multilingues, avec prérequis et relations typées.
- **Learning Planner Service** : noyau déterministe versionné, explication des recommandations, moteur de règles, simulations d'évolution des acquis.
- **Evidence & Portfolio Service** : consentements granulaires, portfolios exportables, preuves horodatées, évaluations observables, séparation des données d'élèves, enseignants et organisations.
- **Content Studio / Editorial Workflow** : drafts, approbations, contrôle éditorial, accessibilité, localisation, retraçabilité de chaque compétence et activité.
- **Integration Adapters** : fournisseurs de contenus externes et référentiels institutionnels avec validation à l'ingestion, résolution de conflits, provenance et licences ; pas d'exécution arbitraire de modules utilisateurs.
- **Operational** : migration DB et event streams, isolation multi-tenant, journal d'audit, sauvegarde, monitoring de disponibilité, sécurité et RGPD. Toutes ces briques sont **projetées**, non incluses dans V0.8.

## 7. Recette V0.8

Lancer `npm run check`, puis `npm start` et ouvrir `/journey`. Valider les 4 piliers, bascule FR/EN, sélection de cinq parcours, 12 compétences, variation de contexte sans inférence d'aptitude, impossibilité de poursuivre sans déclaration 18+, génération ordonnée prérequis → objectif, modification du profil, suivi auto-déclaré, export, import, effacement. Inspecter les requêtes : **aucun POST de données profil JOURNEY**. Vérifier lecture clavier, zoom 200 %, téléphone, impression, réactivation après import d'une ancienne version de catalog.

### Non-régressions

Les 20 exercices THINK, les 6 activités FOCUS, les 6 leçons LEARN et les 7 ateliers DECIDE ne sont pas modifiés par les nouvelles règles. Une PR depuis le `main` actuel, isolée et testée, est impérative avant fusion.

## 8. Extension immédiate sans recompilation du moteur

La page `/journey` possède une commande **Importer un pack JSON** : un concepteur peut charger localement un référentiel supplémentaire conforme au contrat, sans copier de code JavaScript. Le navigateur analyse uniquement du JSON (maximum 150 ko pour le prototype), rejette doublons, prérequis absents, cycles et traductions incomplètes, puis l'ajoute au registre actif pour **cet onglet seulement**. Aucun pack utilisateur n'est exécuté, envoyé au serveur ou publié aux autres utilisateurs. Les packs importés sont explicitement indiqués comme **non certifiés / non approuvés pédagogiquement** ; une future plateforme devra ajouter revue humaine, provenance et validation de licences avant partage.

La fermeture/recharge de la page efface les packs chargés localement. Lorsqu'un portfolio exporté dépend d'un pack tiers, il faut **réimporter ce même référentiel** avant le portfolio. Le mécanisme de distribution/validation et de migration des extensions fait partie de la roadmap V0.9 / V1.0, pas de ce démonstrateur.