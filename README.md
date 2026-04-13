# MAREF

MAREF est une application Next.js orientée décision d’achat.  
Le produit aide un utilisateur à :

- explorer des produits par famille
- ouvrir une fiche produit agrégée
- comparer des offres marchandes
- structurer sa décision dans un projet
- s’appuyer sur un score MAREF et sur Mimo pour mieux arbitrer

## Positionnement

MAREF n’est pas un simple comparateur de prix.  
Le cœur du produit est la boucle suivante :

1. identifier un besoin
2. explorer des produits comparables
3. analyser des offres marchandes
4. regrouper les offres dans un projet
5. comparer et décider avec plus de contexte

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase

## Architecture

Le dépôt est organisé autour de quatre zones principales :

- [src/app](/C:/Users/PC/Documents/maref/src/app:1) : routes App Router
- [src/components](/C:/Users/PC/Documents/maref/src/components:1) : shell, composants UI transverses et auth
- [src/features](/C:/Users/PC/Documents/maref/src/features:1) : logique et composants par domaine métier
- [src/lib](/C:/Users/PC/Documents/maref/src/lib:1) : noyau métier, services, hooks, score, projets, Mimo

Documentation complémentaire :

- [docs/architecture.md](/C:/Users/PC/Documents/maref/docs/architecture.md:1)
- [docs/product-model.md](/C:/Users/PC/Documents/maref/docs/product-model.md:1)

## Démarrage local

```bash
npm install
npm run dev
```

## Vérifications

```bash
npm run lint
npx tsc --noEmit
```

## Variables d’environnement

Selon les flux activés, le projet peut utiliser :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `BESTBUY_API_KEY`
- `NEXT_PUBLIC_MAREF_DEMO_CATALOG`

`NEXT_PUBLIC_MAREF_DEMO_CATALOG` doit être activée explicitement pour permettre le mode catalogue démo.  
En production, l’objectif recommandé est de laisser ce mode désactivé.

## État du modèle métier

Le produit est en transition d’un modèle centré uniquement sur `Offer` vers un domaine plus propre :

- `Product` : fiche agrégée visible dans l’explorer
- `Offer` : offre marchande analysable et comparable
- `Merchant` : enseigne ou marchand
- `PriceSnapshot` : historique de prix persistant

Cette transition est déjà entamée côté UI et hooks, mais reste à finaliser côté schéma de données.

## Priorités techniques actuelles

- finaliser la séparation `Product` / `Offer`
- réduire la couche legacy dans `src/lib`
- fiabiliser la persistence du comparateur côté serveur
- remplacer les données démo par une vraie pipeline catalogue
- renforcer l’intégration Mimo avec le contexte compte/projet

## Philosophie produit

MAREF doit rester un produit honnête :

- pas de score sans base exploitable
- pas d’historique prix sans relevés réels
- pas de profondeur simulée
- pas de contenu inventé présenté comme vrai
