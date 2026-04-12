import { CATEGORIES } from "@/lib/categories";
import type { Offer } from "@/lib/data";
import type { CompareFamily } from "./types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const FAMILY_RULES: Array<{ match: (text: string, offer: Offer) => boolean; family: CompareFamily }> = [
  {
    match: (text) => text.includes("seche linge") || text.includes("seche-linge") || text.includes("dryer"),
    family: { key: "seche-linge", label: "Seche-linge" },
  },
  {
    match: (text) => text.includes("lave linge") || text.includes("lave-linge") || text.includes("washing machine"),
    family: { key: "lave-linge", label: "Lave-linge" },
  },
  {
    match: (text) => text.includes("lave vaisselle") || text.includes("lave-vaisselle") || text.includes("dishwasher"),
    family: { key: "lave-vaisselle", label: "Lave-vaisselle" },
  },
  {
    match: (text) => text.includes("refrigerateur") || text.includes("refrigerator") || text.includes("frigo"),
    family: { key: "refrigerateurs", label: "Refrigerateurs" },
  },
  {
    match: (text) => text.includes("congel"),
    family: { key: "congelation", label: "Congelation" },
  },
  {
    match: (text, offer) =>
      offer.category === "televiseurs" || text.includes("televiseur") || text.includes("television") || text.includes("tv") || text.includes("oled") || text.includes("qled"),
    family: { key: "televiseurs", label: "Televiseurs" },
  },
];

export function getOfferCompareFamily(offer: Offer): CompareFamily {
  const haystack = normalize([offer.product, offer.model, offer.subcategory, offer.category].filter(Boolean).join(" "));
  const matchedRule = FAMILY_RULES.find((rule) => rule.match(haystack, offer));
  if (matchedRule) {
    return matchedRule.family;
  }

  const subcategory = CATEGORIES.flatMap((category) => category.subs).find((item) => item.id === offer.subcategory);
  if (subcategory) {
    return { key: subcategory.id, label: subcategory.name };
  }

  const category = CATEGORIES.find((item) => item.id === offer.category);
  if (category) {
    return { key: category.id, label: category.name };
  }

  return { key: "autres", label: "Autres produits" };
}
