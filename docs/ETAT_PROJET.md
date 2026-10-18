# HUMAN FIRST / THINK FIRST 0.2 — Journal de reprise

## Références
- HUMAN_FIRST_Document_Fondateur_V0.1 (18/10/2026).
- HUMAN_FIRST_THINK_FIRST_Specification_Fonctionnelle_Scientifique_V0.1 (18/10/2026).

## Décisions de conception
- Le code est séparé de Kanban, LIMS, ATAC Academy et TSD.
- Aucun secret, abonnement ou connecteur IA n'est requis.
- Les exercices de démonstration restent séparés de toute banque approuvée par des experts.
- Aucun stockage d'analyse comportementale ; aucune expérimentation humaine activée.
- La correction du transfert reste privée côté serveur jusqu'à la soumission.

## Couverture (prototype de démonstration)
| Exigence | État | Limite |
|---|---|---|
| TF-FR-01 | Démonstration | Contrôle déclaratif 18+, pas de procédure de recherche |
| TF-FR-02 | Démonstration | Session temporaire sans compte |
| TF-FR-03 | Non développé | Étude scientifique désactivée |
| TF-FR-04 | Démonstration | FR/EN disponibles ; traduction non validée par les experts |
| TF-FR-05 | Partiel | 3 contenus de démo NON approuvés |
| TF-FR-06 | Démonstration | Tentative ou passage |
| TF-FR-07 | Démonstration | 3 niveaux prédéfinis |
| TF-FR-08 | Démonstration | Explication accessible immédiatement |
| TF-FR-09 | Non développé | IA désactivée et non nécessaire |
| TF-FR-10 | Démonstration | Item distinct et correction cachée côté serveur |
| TF-FR-11 | Partiel | Autoévaluation qualitative, pas de barème validé |
| TF-FR-12/13 | Démonstration | Fin explicite, activité hors écran |
| TF-FR-14 | Non développé | Procédure de signalement à prévoir avant ouverture |
| TF-FR-15/17/19 | Partiel | Aucune donnée durable / aucun compte / aucun suivi externe |
| TF-FR-18 | À vérifier | Parcours clavier et responsive, audit manuel requis |
| TF-FR-20 | Non développé | Aucun protocole A/B/C activé |

## Prochain lot indispensable avant une expérimentation scientifique
1. Faire relire et approuver 20–24 exercices, variantes parallèles et grilles par deux relecteurs indépendants.
2. Concevoir et enregistrer le protocole, les risques, les critères d'inclusion/exclusion et le plan d'analyse.
3. Obtenir les validations éthiques et juridiques pertinentes, notices, bases légales, durées de conservation et droit de retrait.
4. Mettre en place une infrastructure de recherche séparée, pseudonymisation, sauvegardes, contrôles d'accès et audit.
5. Tester l'équivalence des formes A/B/C et la non-divulgation des corrections.
6. Valider l'accessibilité clavier, mobile, zoom et lecteur d'écran avec des utilisateurs.
7. N'ouvrir le recrutement des adultes qu'après avoir franchi les portes de recette prévues par la spécification.

## V0.2 (19/10/2026)

- Sélecteur FR/EN et contenus pédagogiques localisés.
- Indices cachés côté serveur jusqu’à la demande ; transferts sans fuite de grille ni d’indices.
- Bilan imprimable avec réponse et grille de réflexion qualitative, sans score.
- Recette locale/visuelle humaine requise avant fusion dans `main`.
