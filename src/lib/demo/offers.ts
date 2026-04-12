import { CATEGORIES, type Offer } from "@/lib/core";
import { computeScore, generateShortMimo, getScoreStatus } from "@/lib/score/engine";

const BRAND_POOLS: Record<string, string[]> = {
  electromenager: ["Samsung", "LG", "Bosch", "Whirlpool", "Electrolux", "Beko", "Hisense", "Haier"],
  "petit-electromenager": ["Philips", "Moulinex", "Krups", "Ninja", "Tefal", "Rowenta", "Dyson", "Braun"],
  televiseurs: ["Samsung", "LG", "Sony", "TCL", "Hisense", "Panasonic", "Philips", "Sharp"],
  telephonie: ["Apple", "Samsung", "Xiaomi", "Google", "Honor", "Motorola", "OnePlus", "Nokia"],
  informatique: ["HP", "Lenovo", "Dell", "Asus", "Acer", "MSI", "Apple", "Samsung"],
  "jeux-video": ["Sony", "Microsoft", "Nintendo", "Logitech", "Razer", "SteelSeries", "Thrustmaster", "Asus"],
};

const MERCHANTS = ["Darty", "Boulanger", "Fnac", "Amazon", "Cdiscount", "Electro Depot", "But", "Conforama"];
const AVAILABILITIES = ["En stock", "Sous 48h", "Sous 5 jours"];
const WARRANTIES = ["2 ans", "3 ans", "5 ans"];
const DELIVERIES = ["Gratuite", "9,99 EUR", "19,99 EUR"];

const PRICE_BASES: Record<string, number> = {
  "lave-linge": 549,
  "seche-linge": 479,
  "lave-vaisselle": 499,
  "frigos-top": 269,
  "frigos-1-porte": 399,
  "frigos-combines": 699,
  "refrigerateurs-americains": 1299,
  "multi-door": 1599,
  "congelateurs-armoire": 549,
  "congelateurs-coffre": 379,
  "fours-encastrables": 649,
  "micro-ondes": 149,
  "plaques-induction": 399,
  "plaques-vitroceramiques": 299,
  cuisinieres: 599,
  hottes: 249,
  "caves-a-vin": 399,
  "machines-expresso": 499,
  "cafetieres-filtre": 89,
  bouilloires: 49,
  "grille-pain": 59,
  "friteuses-air": 149,
  "robots-patissiers": 299,
  blenders: 119,
  "mixeurs-plongeants": 69,
  multicuiseurs: 169,
  "aspirateurs-traineaux": 179,
  "aspirateurs-balais": 249,
  "aspirateurs-robots": 399,
  "nettoyeurs-vapeur": 129,
  "fers-a-repasser": 59,
  "centrales-vapeur": 179,
  "seche-cheveux": 79,
  lisseurs: 69,
  tondeuses: 59,
  "brosses-a-dents": 79,
  epilateurs: 89,
  oled: 1399,
  qled: 999,
  "mini-led": 1199,
  "tv-4k": 699,
  "tv-8k": 2299,
  "tv-gaming": 899,
  videoprojecteurs: 799,
  "barres-de-son": 299,
  smartphones: 699,
  tablettes: 499,
  "montres-connectees": 249,
  ecouteurs: 149,
  "ordinateurs-portables": 899,
  "ordinateurs-bureau": 799,
  "pc-gaming": 1499,
  ecrans: 299,
  imprimantes: 149,
  composants: 249,
  stockage: 129,
  reseau: 159,
  consoles: 499,
  jeux: 69,
  "accessoires-gaming": 129,
  simulation: 349,
};

function getBasePrice(subcategory: string) {
  return PRICE_BASES[subcategory] || 299;
}

function makeSpecs(subcategoryName: string, index: number, price: number) {
  return {
    "Reference serie": `S${index.toString().padStart(2, "0")}`,
    "Classe energetique": ["A", "B", "C"][index % 3],
    Connectivite: index % 2 === 0 ? "Oui" : "Non",
    "Capacite / format": `${Math.max(4, (index % 8) + 4)}`,
    "Niveau sonore": `${38 + (index % 18)} dB`,
    "Prix repere": `${price} EUR`,
    Famille: subcategoryName,
  };
}

function buildImageUrl(brand: string, product: string) {
  return `https://placehold.co/800x800/png?text=${encodeURIComponent(`${brand}\n${product}`)}`;
}

function buildOffer(categoryId: string, subcategoryId: string, subcategoryName: string, index: number): Offer {
  const brands = BRAND_POOLS[categoryId] || ["Maref"];
  const brand = brands[index % brands.length];
  const merchant = MERCHANTS[index % MERCHANTS.length];
  const price = getBasePrice(subcategoryId) + index * 17 + (index % 3) * 25;
  const barredPrice = price + 80 + (index % 4) * 20;
  const availability = AVAILABILITIES[index % AVAILABILITIES.length];
  const delivery = DELIVERIES[index % DELIVERIES.length];
  const warranty = WARRANTIES[index % WARRANTIES.length];
  const model = `${brand.substring(0, 3).toUpperCase()}-${subcategoryId.substring(0, 3).toUpperCase()}-${(index + 1).toString().padStart(3, "0")}`;
  const product = `${subcategoryName} ${brand} Serie ${index + 1}`;
  const pefas = {
    P: 58 + (index % 8) * 4,
    E: 54 + ((index + 2) % 8) * 4,
    F: 56 + ((index + 4) % 8) * 4,
    A: 60 + ((index + 1) % 8) * 4,
    S: 55 + ((index + 3) % 8) * 4,
  };
  const score = computeScore(pefas.P, pefas.E, pefas.F, pefas.A, pefas.S);
  const status = score !== null ? getScoreStatus(score) : null;
  const today = new Date();
  const currentDate = new Date(today.getTime() - index * 86400000).toISOString().slice(0, 10);

  return {
    id: `demo-${subcategoryId}-${index + 1}`,
    product,
    brand,
    model,
    category: categoryId,
    subcategory: subcategoryId,
    merchant,
    price,
    barredPrice,
    availability,
    delivery,
    warranty,
    score,
    status: status?.label || "Catalogue de demonstration",
    statusColor: status?.color || "#1f4b8f",
    confidence: "Demo",
    freshness: "Apercu catalogue",
    imageUrl: buildImageUrl(brand, product),
    sourceUrl: null,
    lastUpdated: currentDate,
    reliabilityScore: 25,
    priceHistory: [
      { date: new Date(today.getTime() - 14 * 86400000).toISOString().slice(0, 10), price: barredPrice, sourceUrl: null },
      { date: new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10), price: price + 25, sourceUrl: null },
      { date: currentDate, price, sourceUrl: null },
    ],
    dataState: "partial",
    pefas,
    mimoShort: generateShortMimo(score),
    reasons: [
      "Offre de demonstration pour peupler le catalogue",
      `Positionnee dans la sous-categorie ${subcategoryName}`,
      "Lecture PEFAS calculee automatiquement",
    ],
    vigilances: [
      "Fiche de demonstration",
      "Prix et caracteristiques fournis a titre d'apercu",
    ],
    specs: makeSpecs(subcategoryName, index, price),
  };
}

export function getDemoOffers() {
  const offers: Offer[] = [];

  CATEGORIES.forEach((category) => {
    category.subs.forEach((subcategory) => {
      for (let index = 0; index < 20; index += 1) {
        offers.push(buildOffer(category.id, subcategory.id, subcategory.name, index));
      }
    });
  });

  return offers;
}

export function getFilteredDemoOffers(filters?: {
  category?: string;
  subcategory?: string;
  search?: string;
}) {
  const all = getDemoOffers();

  return all.filter((offer) => {
    if (filters?.category && offer.category !== filters.category) return false;
    if (filters?.subcategory && offer.subcategory !== filters.subcategory) return false;
    if (filters?.search) {
      const needle = filters.search.toLowerCase();
      const haystack = [offer.product, offer.brand, offer.merchant, offer.model].join(" ").toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

export function getDemoOfferById(id: string) {
  return getDemoOffers().find((offer) => offer.id === id) || null;
}
