import type { Offer, ProjectDecisionContext } from "@/lib/core";

export type ScoredOffer<T extends Offer = Offer> = T & {
  displayScore: number;
  scoreMode: "global" | "contextual";
};

export function getScoreColorClass(score: number) {
  if (score >= 85) return "bg-emerald-700";
  if (score >= 72) return "bg-emerald-600";
  if (score >= 58) return "bg-lime-600";
  if (score >= 42) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-600";
}

export function getScoreStatus(score: number) {
  if (score >= 85) return { label: "Excellent choix", className: "bg-emerald-100 text-emerald-800", color: "#1a6b4e" };
  if (score >= 72) return { label: "Tres bon choix", className: "bg-emerald-50 text-emerald-700", color: "#2e8b57" };
  if (score >= 58) return { label: "Bon choix", className: "bg-lime-100 text-lime-700", color: "#6aab2e" };
  if (score >= 42) return { label: "A surveiller", className: "bg-yellow-100 text-yellow-700", color: "#e6a817" };
  if (score >= 25) return { label: "Risque", className: "bg-orange-100 text-orange-700", color: "#d4652a" };
  return { label: "Peu pertinent", className: "bg-red-100 text-red-700", color: "#c0392b" };
}

export function computeScore(p: number, e: number, f: number, a: number, s: number) {
  return Math.round(p * 0.25 + e * 0.25 + f * 0.15 + a * 0.2 + s * 0.15);
}

export function computeProjectAwareScore(offer: Offer, context?: ProjectDecisionContext) {
  const weights = {
    P: 0.25,
    E: 0.25,
    F: 0.15,
    A: 0.2,
    S: 0.15,
  };

  if (context?.userProfile?.priority === "Prix") {
    weights.E += 0.08;
    weights.P -= 0.03;
    weights.A -= 0.02;
    weights.S -= 0.03;
  }

  if (context?.userProfile?.priority === "Fiabilite") {
    weights.A += 0.06;
    weights.S += 0.04;
    weights.E -= 0.04;
    weights.F -= 0.02;
    weights.P -= 0.04;
  }

  if (context?.userProfile?.priority === "Simplicite") {
    weights.F += 0.07;
    weights.P += 0.03;
    weights.E -= 0.05;
    weights.S -= 0.03;
    weights.A -= 0.02;
  }

  if (context?.projectBudget) {
    const budgetValue = parseInt(context.projectBudget.replace(/[^\d]/g, ""));
    if (!Number.isNaN(budgetValue) && offer.price > budgetValue) {
      weights.E += 0.08;
    }
  }

  const total = weights.P + weights.E + weights.F + weights.A + weights.S;
  return Math.round(
    (offer.pefas.P * weights.P +
      offer.pefas.E * weights.E +
      offer.pefas.F * weights.F +
      offer.pefas.A * weights.A +
      offer.pefas.S * weights.S) /
      total,
  );
}

export function getOfferDisplayScore(offer: Offer, context?: ProjectDecisionContext) {
  if (!context) return offer.score;
  return computeProjectAwareScore(offer, context);
}

export function scoreOffer<T extends Offer>(offer: T, context?: ProjectDecisionContext): ScoredOffer<T> {
  return {
    ...offer,
    displayScore: getOfferDisplayScore(offer, context),
    scoreMode: context ? "contextual" : "global",
  };
}

export function toBaseOffer<T extends Offer>(offer: ScoredOffer<T>) {
  const baseOffer = { ...offer } as T & Partial<ScoredOffer<T>>;
  delete baseOffer.displayScore;
  delete baseOffer.scoreMode;
  return baseOffer as T;
}

export function rankOffersByScore<T extends Offer>(offers: T[], context?: ProjectDecisionContext) {
  return [...offers]
    .map((offer) => scoreOffer(offer, context))
    .sort((a, b) => b.displayScore - a.displayScore);
}

export function averageOfferScore(offers: Offer[], context?: ProjectDecisionContext) {
  if (offers.length === 0) return 0;
  const ranked = rankOffersByScore(offers, context);
  return Math.round(ranked.reduce((sum, offer) => sum + offer.displayScore, 0) / ranked.length);
}

export function generateShortMimo(score: number) {
  if (score >= 85) return "Offre solide, bien positionnee pour votre profil.";
  if (score >= 72) return "Bon rapport qualite-prix-fiabilite dans votre contexte.";
  if (score >= 58) return "Offre correcte, des alternatives existent.";
  if (score >= 42) return "Quelques points a verifier avant de decider.";
  return "Attention, plusieurs signaux meritent votre vigilance.";
}
