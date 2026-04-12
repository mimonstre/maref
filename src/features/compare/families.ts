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

function getSubcategoryFamily(offer: Offer): CompareFamily | null {
  const subcategory = CATEGORIES.flatMap((category) => category.subs).find((item) => item.id === offer.subcategory);
  if (!subcategory) return null;

  return {
    key: `subcategory:${subcategory.id}`,
    label: subcategory.name,
  };
}

const CATEGORY_FALLBACK_RULES: Array<{ match: (text: string, offer: Offer) => boolean; family: CompareFamily }> = [
  {
    match: (text, offer) =>
      offer.category === "televiseurs" ||
      text.includes("televiseur") ||
      text.includes("television") ||
      text.includes("tv"),
    family: { key: "category:televiseurs", label: "Televiseurs" },
  },
  {
    match: (text) =>
      text.includes("telephone") ||
      text.includes("smartphone") ||
      text.includes("mobile"),
    family: { key: "category:telephonie", label: "Telephonie" },
  },
  {
    match: (text) =>
      text.includes("ordinateur") ||
      text.includes("pc") ||
      text.includes("laptop"),
    family: { key: "category:informatique", label: "Informatique" },
  },
];

export function getOfferCompareFamily(offer: Offer): CompareFamily {
  const subcategoryFamily = getSubcategoryFamily(offer);
  if (subcategoryFamily) {
    return subcategoryFamily;
  }

  const haystack = normalize([offer.product, offer.model, offer.subcategory, offer.category].filter(Boolean).join(" "));
  const matchedRule = CATEGORY_FALLBACK_RULES.find((rule) => rule.match(haystack, offer));
  if (matchedRule) {
    return matchedRule.family;
  }

  const category = CATEGORIES.find((item) => item.id === offer.category);
  if (category) {
    return { key: `category:${category.id}`, label: category.name };
  }

  return { key: "category:autres", label: "Autres produits" };
}
