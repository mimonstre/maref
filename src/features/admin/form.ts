import { CATEGORIES } from "@/lib/categories";
import type { AdminOffer, AdminOfferForm } from "./types";

export const EMPTY_ADMIN_FORM: AdminOfferForm = {
  product: "",
  brand: "",
  model: "",
  category: "electromenager",
  subcategory: "lave-linge",
  merchant: "Darty",
  price: "",
  barredPrice: "",
  availability: "En stock",
  delivery: "Gratuite",
  warranty: "2 ans",
  sourceUrl: "",
  lastUpdated: "",
  reliabilityScore: "60",
  pefas_p: "70",
  pefas_e: "70",
  pefas_f: "70",
  pefas_a: "70",
  pefas_s: "70",
  reasons: "Prix competitif\nMarque fiable",
  vigilances: "Cout d usage a verifier",
};

export const ADMIN_SUBCATEGORIES: Record<string, { id: string; name: string }[]> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.subs.map((sub) => ({ id: sub.id, name: sub.name }))]),
);

export function getNextAdminForm(form: AdminOfferForm, key: keyof AdminOfferForm, value: string): AdminOfferForm {
  if (key !== "category") {
    return { ...form, [key]: value };
  }

  const subcategories = ADMIN_SUBCATEGORIES[value];
  return {
    ...form,
    category: value,
    subcategory: subcategories && subcategories.length > 0 ? subcategories[0].id : "",
  };
}

export function getAdminFormFromOffer(offer: AdminOffer): AdminOfferForm {
  return {
    product: offer.product,
    brand: offer.brand,
    model: offer.model,
    category: offer.category,
    subcategory: offer.subcategory,
    merchant: offer.merchant,
    price: offer.price.toString(),
    barredPrice: offer.barred_price?.toString() || "",
    availability: offer.availability,
    delivery: offer.delivery,
    warranty: offer.warranty,
    sourceUrl: offer.source_url || "",
    lastUpdated: offer.last_updated ? offer.last_updated.slice(0, 10) : "",
    reliabilityScore: offer.reliability_score?.toString() || "",
    pefas_p: offer.pefas_p.toString(),
    pefas_e: offer.pefas_e.toString(),
    pefas_f: offer.pefas_f.toString(),
    pefas_a: offer.pefas_a.toString(),
    pefas_s: offer.pefas_s.toString(),
    reasons: offer.reasons.join("\n"),
    vigilances: offer.vigilances.join("\n"),
  };
}
