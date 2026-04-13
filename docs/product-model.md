# Modèle Produit

## Intention

MAREF doit distinguer clairement deux niveaux :

- le `produit`
- l’`offre`

Cette séparation est essentielle pour la compréhension utilisateur et pour la scalabilité du modèle.

## Product

Un `Product` représente une fiche agrégée visible dans l’explorer.

Il contient :

- une identité produit stable
- une famille
- une sous-catégorie
- une marque
- un modèle
- une image principale éventuelle
- la liste des offres connues pour ce produit

Exemples d’usage :

- affichage dans l’explorer
- regroupement par référence
- navigation vers une fiche produit unique

## Offer

Une `Offer` représente une offre marchande précise.

Elle contient :

- un marchand
- un prix
- une livraison
- une garantie
- une disponibilité
- une source URL
- une fraîcheur de donnée
- un score MAREF
- une lecture PEFAS

Exemples d’usage :

- comparaison
- ajout à un projet
- favoris
- historique
- score MAREF

## Merchant

Un `Merchant` représente une enseigne ou un vendeur.

Il doit permettre à terme :

- normalisation du nom marchand
- suivi de la fiabilité
- comparaison des conditions de service

## PriceSnapshot

Un `PriceSnapshot` représente un relevé de prix historisé.

Il doit contenir :

- `offer_id`
- `captured_at`
- `price`
- `currency`
- `source_url`

## Pourquoi cette séparation est critique

Sans cette distinction :

- l’explorer devient incohérent
- les scores semblent appliqués au mauvais niveau
- l’historique de prix devient ambigu
- le comparateur mélange produit et marchand

## Conséquences UI

- l’explorer montre des `Product`
- la fiche produit détaille plusieurs `Offer`
- le score MAREF s’affiche sur une `Offer`
- le projet référence des `Offer`
- le comparateur compare des `Offer`

## Conséquences backend

Le schéma cible doit évoluer vers :

- `products`
- `offers`
- `merchants`
- `price_snapshots`

La base actuelle est encore plus simple, mais cette cible doit guider les prochaines migrations.
