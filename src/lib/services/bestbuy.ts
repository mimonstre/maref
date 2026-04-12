import "server-only";

import { getOfferDataState, type Offer } from "@/lib/core";
import { computeScore, generateShortMimo, getScoreStatus } from "@/lib/score/engine";

const BESTBUY_BASE_URL = "https://api.bestbuy.com/v1";

const SUBCATEGORY_QUERIES: Record<string, string> = {
  "lave-linge": "washer",
  "seche-linge": "dryer",
  "lave-vaisselle": "dishwasher",
  "frigos-top": "top freezer refrigerator",
  "frigos-1-porte": "single door refrigerator",
  "frigos-combines": "bottom freezer refrigerator",
  "refrigerateurs-americains": "side by side refrigerator",
  "multi-door": "french door refrigerator",
  "congelateurs-armoire": "upright freezer",
  "congelateurs-coffre": "chest freezer",
  "fours-encastrables": "wall oven",
  "micro-ondes": "microwave",
  "plaques-induction": "induction cooktop",
  "plaques-vitroceramiques": "electric cooktop",
  "cuisinieres": "range",
  "hottes": "range hood",
  "caves-a-vin": "wine cooler",
  "machines-expresso": "espresso machine",
  "cafetieres-filtre": "coffee maker",
  bouilloires: "electric kettle",
  "grille-pain": "toaster",
  "friteuses-air": "air fryer",
  "robots-patissiers": "stand mixer",
  blenders: "blender",
  "mixeurs-plongeants": "hand blender",
  multicuiseurs: "multi cooker",
  "aspirateurs-traineaux": "canister vacuum",
  "aspirateurs-balais": "stick vacuum",
  "aspirateurs-robots": "robot vacuum",
  "nettoyeurs-vapeur": "steam cleaner",
  "fers-a-repasser": "iron",
  "centrales-vapeur": "steam station iron",
  "seche-cheveux": "hair dryer",
  lisseurs: "hair straightener",
  tondeuses: "trimmer",
  "brosses-a-dents": "electric toothbrush",
  epilateurs: "epilator",
  oled: "OLED TV",
  qled: "QLED TV",
  "mini-led": "Mini LED TV",
  "tv-4k": "4K TV",
  "tv-8k": "8K TV",
  "tv-gaming": "gaming TV",
  videoprojecteurs: "projector",
  "barres-de-son": "soundbar",
  smartphones: "smartphone",
  tablettes: "tablet",
  "montres-connectees": "smart watch",
  ecouteurs: "wireless earbuds",
  "ordinateurs-portables": "laptop",
  "ordinateurs-bureau": "desktop computer",
  "pc-gaming": "gaming PC",
  ecrans: "monitor",
  imprimantes: "printer",
  composants: "computer components",
  stockage: "SSD external hard drive",
  reseau: "router mesh wifi",
  consoles: "game console",
  jeux: "video game",
  "accessoires-gaming": "gaming headset controller",
  simulation: "racing wheel",
};

type BestBuyCollectionResponse = {
  products?: BestBuyProduct[];
  total?: number;
};

type BestBuyProduct = {
  sku?: string | number;
  manufacturer?: string;
  name?: string;
  modelNumber?: string;
  salePrice?: number;
  regularPrice?: number;
  onlineAvailability?: boolean;
  onlineAvailabilityText?: string;
  shippingCost?: number;
  inStoreAvailabilityText?: string;
  customerReviewAverage?: number;
  customerReviewCount?: number;
  image?: string;
  mediumImage?: string;
  largeImage?: string;
  url?: string;
  shortDescription?: string;
  longDescription?: string;
  color?: string;
  class?: string;
  subclass?: string;
  details?: Record<string, unknown>;
  names?: { title?: string };
  images?: { standard?: string };
  prices?: { current?: number; regular?: number };
  links?: { web?: string };
  descriptions?: { short?: string };
  customerReviews?: { averageScore?: number | string; count?: number | string };
};

function getApiKey() {
  return process.env.BESTBUY_API_KEY || process.env.BEST_BUY_API_KEY || null;
}

function buildSearchQuery(subcategory?: string, search?: string) {
  const term = search?.trim() || (subcategory ? SUBCATEGORY_QUERIES[subcategory] : "");
  if (!term) return null;
  const normalized = term.replace(/\s+/g, "&");
  return `(search=${normalized})`;
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function mapPriceHistory(current: number, regular: number | null, url: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  const history = [{ date: today, price: current, sourceUrl: url }];
  if (regular && regular > current) {
    history.unshift({ date: today, price: regular, sourceUrl: url });
  }
  return history;
}

function buildPefas(product: BestBuyProduct, price: number, regularPrice: number | null) {
  const reviewAverage =
    getNumber(product.customerReviewAverage) ??
    getNumber(product.customerReviews?.averageScore) ??
    0;
  const reviewCount =
    getNumber(product.customerReviewCount) ??
    getNumber(product.customerReviews?.count) ??
    0;
  const onlineAvailability = product.onlineAvailabilityText || product.onlineAvailability ? "En stock" : "Disponibilité limitée";
  const discountRatio = regularPrice && regularPrice > price ? Math.min(1, (regularPrice - price) / regularPrice) : 0;

  const P = Math.round(Math.min(100, 45 + reviewAverage * 10 + Math.min(reviewCount / 40, 18)));
  const E = Math.round(Math.min(100, 48 + discountRatio * 28 + (reviewAverage >= 4 ? 8 : 0)));
  const F = Math.round(onlineAvailability.includes("stock") ? 78 : 58);
  const A = Math.round(Math.min(100, 50 + reviewAverage * 9 + Math.min(reviewCount / 60, 14)));
  const S = Math.round(Math.min(100, 46 + reviewAverage * 8 + Math.min(reviewCount / 55, 16)));

  return { P, E, F, A, S };
}

function pickImage(product: BestBuyProduct) {
  return product.image || product.mediumImage || product.largeImage || product.images?.standard || null;
}

function pickTitle(product: BestBuyProduct) {
  return product.name || product.names?.title || "Produit Best Buy";
}

function pickBrand(product: BestBuyProduct) {
  return product.manufacturer || "Marque inconnue";
}

function pickModel(product: BestBuyProduct) {
  return product.modelNumber || String(product.sku || "");
}

function pickPrice(product: BestBuyProduct) {
  return getNumber(product.salePrice) ?? getNumber(product.prices?.current) ?? 0;
}

function pickRegularPrice(product: BestBuyProduct) {
  return getNumber(product.regularPrice) ?? getNumber(product.prices?.regular);
}

function pickUrl(product: BestBuyProduct) {
  return product.url || product.links?.web || null;
}

function mapBestBuyProductToOffer(product: BestBuyProduct, category: string, subcategory: string): Offer | null {
  const sku = String(product.sku || "");
  const price = pickPrice(product);
  if (!sku || !price) return null;

  const regularPrice = pickRegularPrice(product);
  const pefas = buildPefas(product, price, regularPrice);
  const score = computeScore(pefas.P, pefas.E, pefas.F, pefas.A, pefas.S);
  const status = score !== null ? getScoreStatus(score) : null;
  const reviewAverage =
    getNumber(product.customerReviewAverage) ??
    getNumber(product.customerReviews?.averageScore);
  const reviewCount =
    getNumber(product.customerReviewCount) ??
    getNumber(product.customerReviews?.count);
  const sourceUrl = pickUrl(product);

  const offer: Offer = {
    id: `bestbuy-${sku}`,
    product: pickTitle(product),
    brand: pickBrand(product),
    model: pickModel(product),
    category,
    subcategory,
    merchant: "Best Buy",
    price,
    barredPrice: regularPrice,
    availability: product.onlineAvailability || product.onlineAvailabilityText ? "En stock" : "Disponibilité limitée",
    delivery: typeof product.shippingCost === "number" ? `Livraison ${product.shippingCost === 0 ? "gratuite" : `${product.shippingCost.toFixed(2)} USD`}` : "Voir Best Buy",
    warranty: "Voir Best Buy",
    score,
    status: status?.label || null,
    statusColor: status?.color || null,
    confidence: reviewAverage !== null ? (reviewAverage >= 4.4 ? "Élevée" : reviewAverage >= 3.8 ? "Correcte" : "À confirmer") : "Partielle",
    freshness: "Prix Best Buy actuel",
    imageUrl: pickImage(product),
    sourceUrl,
    lastUpdated: new Date().toISOString().slice(0, 10),
    reliabilityScore: sourceUrl ? 88 : 70,
    priceHistory: mapPriceHistory(price, regularPrice, sourceUrl),
    dataState: "unknown",
    pefas,
    mimoShort: generateShortMimo(score),
    reasons: [
      reviewAverage !== null ? `Note clients ${reviewAverage}/5 sur Best Buy` : "Source marchand directe",
      reviewCount ? `${reviewCount} avis disponibles` : "Avis clients non remontés",
      regularPrice && regularPrice > price ? `Prix actuel inférieur au prix régulier` : "Prix courant observé",
    ].filter(Boolean),
    vigilances: [
      "Données issues du catalogue Best Buy USA",
      "Historique limité aux relevés réellement enregistrés dans MAREF ou au prix courant/régulier disponible",
      reviewCount && reviewCount < 25 ? "Volume d’avis encore limité" : "",
    ].filter(Boolean),
    specs: {
      SKU: sku,
      "Prix régulier": regularPrice ? `${regularPrice.toFixed(2)} USD` : "Non communiqué",
      "Note clients": reviewAverage !== null ? `${reviewAverage}/5` : "Non communiqué",
      "Nombre d’avis": reviewCount !== null ? String(reviewCount) : "Non communiqué",
      Couleur: product.color || "Non communiqué",
      Classe: product.class || "Non communiqué",
      "Sous-classe": product.subclass || "Non communiqué",
      "Description courte": product.shortDescription || product.descriptions?.short || "Non communiqué",
    },
  };

  return {
    ...offer,
    dataState: getOfferDataState(offer),
  };
}

export async function fetchBestBuyOffers(input: {
  category: string;
  subcategory: string;
  search?: string;
  limit?: number;
}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("BESTBUY_API_KEY manquante");
  }

  const query = buildSearchQuery(input.subcategory, input.search);
  if (!query) return [];

  const show = [
    "sku",
    "name",
    "manufacturer",
    "modelNumber",
    "salePrice",
    "regularPrice",
    "onlineAvailability",
    "onlineAvailabilityText",
    "shippingCost",
    "customerReviewAverage",
    "customerReviewCount",
    "image",
    "mediumImage",
    "largeImage",
    "url",
    "shortDescription",
    "longDescription",
    "color",
    "class",
    "subclass",
  ].join(",");

  const url =
    `${BESTBUY_BASE_URL}/products${query}` +
    `?format=json&pageSize=${input.limit || 10}&page=1&show=${encodeURIComponent(show)}&apiKey=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Best Buy API ${response.status}`);
  }

  const data = (await response.json()) as BestBuyCollectionResponse;
  const products = Array.isArray(data.products) ? data.products : [];

  return products
    .map((product) => mapBestBuyProductToOffer(product, input.category, input.subcategory))
    .filter((offer): offer is Offer => Boolean(offer));
}

export async function fetchBestBuyOffersByIds(ids: string[]) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("BESTBUY_API_KEY manquante");
  }

  const skus = ids
    .map((id) => id.replace(/^bestbuy-/, ""))
    .filter(Boolean);

  if (skus.length === 0) return [];

  const orQuery = skus.map((sku) => `sku=${sku}`).join("|");
  const url =
    `${BESTBUY_BASE_URL}/products(${orQuery})` +
    `?format=json&pageSize=${Math.min(skus.length, 50)}&show=all&apiKey=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Best Buy API ${response.status}`);
  }

  const data = (await response.json()) as BestBuyCollectionResponse;
  const products = Array.isArray(data.products) ? data.products : [];

  const mapped = products
    .map((product) => {
      const sku = String(product.sku || "");
      const sourceId = `bestbuy-${sku}`;
      const inferred = mapBestBuyProductToOffer(product, "imported", "imported");
      return inferred ? { inferred, sourceId } : null;
    })
    .filter((item): item is { inferred: Offer; sourceId: string } => Boolean(item));

  return mapped.map(({ inferred, sourceId }) => {
    const matchId = ids.find((id) => id === sourceId) || sourceId;
    return { ...inferred, id: matchId };
  });
}

export function hasBestBuyApiKey() {
  return Boolean(getApiKey());
}
