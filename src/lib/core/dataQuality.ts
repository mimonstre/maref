import type { DataTruthState, Offer } from "./types";

export type OfferTruthDescriptor = {
  state: DataTruthState;
  label: string;
  toneClassName: string;
  description: string;
  missingFields: string[];
};

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValidNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value);
}

export function hasCompletePefas(offer: Offer) {
  return Object.values(offer.pefas).every(
    (value) => hasValidNumber(value) && value !== null && value >= 0 && value <= 100
  );
}

export function getOfferMissingFields(offer: Offer) {
  const missing: string[] = [];

  if (!hasText(offer.product)) missing.push("nom produit");
  if (!hasText(offer.brand)) missing.push("marque");
  if (!hasValidNumber(offer.price) || offer.price <= 0) missing.push("prix");
  if (!hasText(offer.merchant)) missing.push("marchand");
  if (!hasText(offer.sourceUrl)) missing.push("source");
  if (!hasText(offer.lastUpdated)) missing.push("date de mise a jour");
  if (!hasCompletePefas(offer)) missing.push("axes PEFAS");
  if (Object.keys(offer.specs).length === 0) missing.push("specifications");

  return missing;
}

export function getOfferTruthDescriptor(offer: Offer): OfferTruthDescriptor {
  const missingFields = getOfferMissingFields(offer);
  const hasSource = hasText(offer.sourceUrl);
  const reliabilityScore = offer.reliabilityScore;

  if (
    missingFields.length === 0 &&
    hasSource &&
    hasValidNumber(reliabilityScore) &&
    reliabilityScore !== null &&
    reliabilityScore >= 80
  ) {
    return {
      state: "reliable",
      label: "Donnee fiable",
      toneClassName: "bg-blue-50 text-blue-800 border-blue-200",
      description: "Les champs essentiels sont renseignes et la source est tracee.",
      missingFields,
    };
  }

  if (hasSource || missingFields.length <= 3) {
    return {
      state: "partial",
      label: "Donnee partielle",
      toneClassName: "bg-amber-50 text-amber-800 border-amber-200",
      description: "Une partie des informations est disponible, mais l'analyse reste partielle.",
      missingFields,
    };
  }

  return {
    state: "unknown",
    label: "Donnee inconnue",
    toneClassName: "bg-gray-100 text-gray-700 border-gray-200",
    description: "La fiche ne contient pas assez d'elements fiables pour conclure.",
    missingFields,
  };
}

export function getOfferDataState(offer: Offer): DataTruthState {
  return getOfferTruthDescriptor(offer).state;
}

export function hasEnoughDataForScore(offer: Offer) {
  return hasValidNumber(offer.price) && offer.price > 0 && hasCompletePefas(offer);
}
