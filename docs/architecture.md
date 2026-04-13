# Architecture MAREF

## Vue d’ensemble

MAREF s’appuie sur une architecture App Router avec quatre couches principales :

1. `app`
2. `components`
3. `features`
4. `lib`

## 1. Routes

[src/app](/C:/Users/PC/Documents/maref/src/app:1) contient les routes utilisateur et les routes API.

Principales zones :

- `/` : landing publique ou dashboard connecté
- `/explorer` : catalogue produit
- `/explorer/[id]` : fiche produit et offres marchandes
- `/comparer` : comparateur d’offres
- `/projets` : organisation décisionnelle
- `/guide` : contenus pédagogiques
- `/assistant` : interface Mimo
- `/api/*` : intégrations serveur

## 2. Composants transverses

[src/components](/C:/Users/PC/Documents/maref/src/components:1) regroupe :

- `layout` : top bar, bottom nav
- `auth` : provider, garde d’accès
- `shared` : score, badges, états vides, feedback

Ces composants doivent rester centrés sur la présentation et l’orchestration légère.

## 3. Features

[src/features](/C:/Users/PC/Documents/maref/src/features:1) contient la logique par domaine.

Exemples :

- `compare`
- `projects`
- `offers`
- `guide`
- `profile`
- `home`
- `forum`

Règle cible :

- une `feature` possède ses composants, son API locale, ses helpers et ses types
- les pages App Router doivent devenir des points d’entrée fins

## 4. Lib

[src/lib](/C:/Users/PC/Documents/maref/src/lib:1) contient le noyau partagé :

- `core` : types et helpers métier transverses
- `services` : accès data et mapping
- `score` : moteur de score
- `mimo` : moteur d’analyse et garde de vérité
- `projects` : analyse projet
- `hooks` : hooks métier réutilisables

## Architecture cible

L’architecture cible recherchée est :

- `Product` comme fiche agrégée
- `Offer` comme unité de comparaison marchande
- `Merchant` comme source commerciale
- `PriceSnapshot` comme source de vérité pour l’historique

## Dette encore présente

Le dépôt contient encore une couche legacy :

- [src/lib/auth.ts](/C:/Users/PC/Documents/maref/src/lib/auth.ts:1)
- [src/lib/queries.ts](/C:/Users/PC/Documents/maref/src/lib/queries.ts:1)
- [src/lib/data.ts](/C:/Users/PC/Documents/maref/src/lib/data.ts:1)
- [src/lib/score.ts](/C:/Users/PC/Documents/maref/src/lib/score.ts:1)
- [src/lib/supabase.ts](/C:/Users/PC/Documents/maref/src/lib/supabase.ts:1)

Objectif :

- conserver temporairement les re-exports utiles
- arrêter d’introduire de nouvelles dépendances sur cette couche
- basculer progressivement vers `lib/core`, `lib/services`, `lib/hooks`

## Découpage recommandé à poursuivre

- `ExplorerPage` -> recherche, filtres, liste produits, états
- `ProductDetailPage` -> hero produit, liste d’offres, données techniques, historique prix, alternatives
- `DashboardPage` -> hero, projet prioritaire, historique, recommandations
- `Score` -> séparer le rendu du score, les badges, les états vides, le feedback

## Règles d’évolution

- aucune logique métier lourde dans `page.tsx`
- aucun faux fallback implicite en production
- tout texte visible doit être relu et stabilisé
- tout nouveau flux métier doit passer par un type explicite
