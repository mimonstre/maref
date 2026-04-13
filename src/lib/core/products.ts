import type { Offer, Product } from "./types";

export function getProductKey(offer: Offer) {
  return [offer.category, offer.subcategory, offer.brand, offer.model || offer.product].join("::");
}

export function getProductTitle(offer: Offer) {
  return offer.product || `${offer.brand} ${offer.model}`.trim();
}

export function buildProductFromOffers(offers: Offer[]): Product | null {
  if (offers.length === 0) return null;

  const sortedByPrice = [...offers].sort((a, b) => a.price - b.price);
  const bestOffer = sortedByPrice[0];
  const merchants = Array.from(new Set(offers.map((offer) => offer.merchant)));
  const prices = offers.map((offer) => offer.price).filter((value) => Number.isFinite(value) && value > 0);

  return {
    id: getProductKey(bestOffer),
    key: getProductKey(bestOffer),
    title: getProductTitle(bestOffer),
    brand: bestOffer.brand,
    model: bestOffer.model,
    category: bestOffer.category,
    subcategory: bestOffer.subcategory,
    imageUrl: bestOffer.imageUrl || null,
    offers: sortedByPrice,
    merchants,
    bestOffer,
    lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
    highestPrice: prices.length > 0 ? Math.max(...prices) : null,
    offerCount: offers.length,
  };
}

export function groupOffersIntoProducts(offers: Offer[]) {
  const grouped = offers.reduce<Record<string, Offer[]>>((accumulator, offer) => {
    const key = getProductKey(offer);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(offer);
    return accumulator;
  }, {});

  return Object.values(grouped)
    .map((items) => buildProductFromOffers(items))
    .filter((product): product is Product => Boolean(product))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function findProductOffers(allOffers: Offer[], referenceOffer: Offer) {
  return allOffers.filter((offer) => getProductKey(offer) === getProductKey(referenceOffer));
}
