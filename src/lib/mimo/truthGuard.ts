import { getOfferMissingFields, getOfferTruthDescriptor, hasEnoughDataForScore, type Offer } from "@/lib/core";

type TruthGuardInput = {
  offer?: Offer;
  comparison?: Offer[];
  mode?: "offer" | "comparison" | "project" | "explorer" | "dashboard";
};

export function getTruthWarning(input: TruthGuardInput) {
  if (input.offer) {
    const descriptor = getOfferTruthDescriptor(input.offer);
    if (!hasEnoughDataForScore(input.offer)) {
      return "Je n ai pas assez de donnees structurees pour produire une recommandation fiable sur cette offre.";
    }
    if (descriptor.state !== "reliable") {
      const details = descriptor.missingFields.slice(0, 3).join(", ");
      return details
        ? "Attention : information incomplete. Il manque encore " + details + "."
        : "Attention : information incomplete sur cette offre.";
    }
  }

  if (input.comparison && input.comparison.length > 0) {
    const incompleteOffers = input.comparison.filter((offer) => !hasEnoughDataForScore(offer));
    if (incompleteOffers.length === input.comparison.length) {
      return "Je n ai pas assez de donnees pour comparer ces offres de maniere fiable.";
    }
    if (incompleteOffers.length > 0) {
      const labels = incompleteOffers
        .slice(0, 2)
        .map((offer) => offer.brand + " " + offer.product)
        .join(", ");
      return "Comparaison partielle : certaines offres ont des donnees incompletes" + (labels ? " (" + labels + ")" : "") + ".";
    }
  }

  return null;
}

export function getOfferHonestySummary(offer: Offer) {
  const missingFields = getOfferMissingFields(offer);
  if (missingFields.length === 0) {
    return "Les donnees disponibles permettent une analyse exploitable.";
  }

  return "Analyse prudente : champs manquants - " + missingFields.slice(0, 4).join(", ") + ".";
}
