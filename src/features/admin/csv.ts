import { CATEGORIES } from "@/lib/categories";
import { getDemoOffers } from "@/lib/demo/offers";
import type { AdminOfferForm } from "./types";

const CSV_HEADERS = [
  "product",
  "brand",
  "model",
  "category",
  "subcategory",
  "merchant",
  "price",
  "barredPrice",
  "availability",
  "delivery",
  "warranty",
  "sourceUrl",
  "lastUpdated",
  "reliabilityScore",
  "pefas_p",
  "pefas_e",
  "pefas_f",
  "pefas_a",
  "pefas_s",
  "reasons",
  "vigilances",
] as const;

function defaultForm(): AdminOfferForm {
  const firstCategory = CATEGORIES[0];
  const firstSubcategory = firstCategory?.subs[0];

  return {
    product: "",
    brand: "",
    model: "",
    category: firstCategory?.id || "electromenager",
    subcategory: firstSubcategory?.id || "lave-linge",
    merchant: "Darty",
    price: "",
    barredPrice: "",
    availability: "Disponible",
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
    reasons: "",
    vigilances: "",
  };
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

export function parseOffersCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const form = defaultForm();

    headers.forEach((header, index) => {
      if (header in form) {
        form[header as keyof AdminOfferForm] = values[index] || "";
      }
    });

    return form;
  });
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildOffersCsv(forms: AdminOfferForm[]) {
  const rows = forms.map((form) =>
    CSV_HEADERS.map((header) => escapeCsv(form[header] || "")).join(","),
  );

  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

export function buildDemoOffersCsv() {
  const forms: AdminOfferForm[] = getDemoOffers().map((offer) => ({
    product: offer.product,
    brand: offer.brand,
    model: offer.model,
    category: offer.category,
    subcategory: offer.subcategory,
    merchant: offer.merchant,
    price: String(offer.price),
    barredPrice: offer.barredPrice ? String(offer.barredPrice) : "",
    availability: offer.availability,
    delivery: offer.delivery,
    warranty: offer.warranty,
    sourceUrl: offer.sourceUrl || "",
    lastUpdated: offer.lastUpdated || "",
    reliabilityScore: offer.reliabilityScore !== null ? String(offer.reliabilityScore) : "",
    pefas_p: String(offer.pefas.P || 0),
    pefas_e: String(offer.pefas.E || 0),
    pefas_f: String(offer.pefas.F || 0),
    pefas_a: String(offer.pefas.A || 0),
    pefas_s: String(offer.pefas.S || 0),
    reasons: offer.reasons.join("\n"),
    vigilances: offer.vigilances.join("\n"),
  }));

  return buildOffersCsv(forms);
}
