import { getOfferDataState, type Offer } from "@/lib/core";

export type OfferRow = {
  id: string;
  product: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  merchant: string;
  price: number;
  barred_price: number | null;
  availability: string;
  delivery: string;
  warranty: string;
  score: number;
  status: string;
  status_color: string;
  confidence: string;
  freshness: string;
  image_url?: string | null;
  source_url?: string | null;
  last_updated?: string | null;
  reliability_score?: number | null;
  price_history?: Array<{ date: string; price: number; source_url?: string | null }> | null;
  pefas_p: number;
  pefas_e: number;
  pefas_f: number;
  pefas_a: number;
  pefas_s: number;
  mimo_short: string;
  reasons: string[];
  vigilances: string[];
  specs?: Record<string, string>;
};

export function normalizeAvailability(value: string | null | undefined) {
  if (!value) return "Disponibilité à confirmer";
  if (value.toLowerCase() === "en stock") return "Disponible";
  return value;
}

export function mapOfferRow(row: OfferRow): Offer {
  const offer: Offer = {
    id: row.id,
    product: row.product,
    brand: row.brand,
    model: row.model,
    category: row.category,
    subcategory: row.subcategory,
    merchant: row.merchant,
    price: row.price,
    barredPrice: row.barred_price,
    availability: normalizeAvailability(row.availability),
    delivery: row.delivery,
    warranty: row.warranty,
    score: typeof row.score === "number" ? row.score : null,
    status: row.status || null,
    statusColor: row.status_color || null,
    confidence: row.confidence || null,
    freshness: row.freshness || null,
    imageUrl: row.image_url || null,
    sourceUrl: row.source_url || null,
    lastUpdated: row.last_updated || null,
    reliabilityScore: typeof row.reliability_score === "number" ? row.reliability_score : null,
    priceHistory: Array.isArray(row.price_history)
      ? row.price_history.map((entry) => ({
          date: entry.date,
          price: entry.price,
          sourceUrl: entry.source_url || null,
        }))
      : [],
    dataState: "unknown",
    pefas: {
      P: typeof row.pefas_p === "number" ? row.pefas_p : null,
      E: typeof row.pefas_e === "number" ? row.pefas_e : null,
      F: typeof row.pefas_f === "number" ? row.pefas_f : null,
      A: typeof row.pefas_a === "number" ? row.pefas_a : null,
      S: typeof row.pefas_s === "number" ? row.pefas_s : null,
    },
    mimoShort: row.mimo_short || null,
    reasons: row.reasons || [],
    vigilances: row.vigilances || [],
    specs: row.specs || {},
  };

  return {
    ...offer,
    dataState: getOfferDataState(offer),
  };
}
