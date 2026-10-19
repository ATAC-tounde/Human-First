# HUMAN FIRST - THINK FIRST 0.2.1

Date : 19 octobre 2026. Déploiement prévu uniquement en Vercel **Preview** après recette locale.

## Correctifs

- Séances de démonstration désormais sans état côté serveur, transportées dans un cookie AES-256-GCM chiffré/authentifié avec expiration absolue (2 heures).
- Conservation des réponses **uniquement dans l’onglet** après soumission via sessionStorage, et non dans le cookie ou dans une base de données.
- Parcours repris entre deux instances Vercel différentes si même secret (simulation locale).
- Cookie sécurisé en HTTPS et sur Vercel, SameSite Strict, HttpOnly.
- Correction de l’accès au site sur les URL avec paramètres (notamment `/?lang=en`).
- Santé API signale l’absence de secret sans exposer sa valeur ; défaut sûr HTTP 503 en Vercel et production.

## Limites et points de validation

- Aucune révocation centrale : un cookie chiffré copié peut être réutilisé jusqu’à son expiration. Ne traiter ni données personnelles sensibles, ni comptes, ni participants à la recherche.
- Pas de garantie de sécurité/audit complète ; pas de preuve pédagogique/clinique.
- Vérifier visuellement les écrans dans les navigateurs du testeur (tests Playwright automatiques peuvent être bloqués dans certains environnements).
- Branches GitHub et Vercel Preview uniquement, production inchangée.