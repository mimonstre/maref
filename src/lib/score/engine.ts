import { hasEnoughDataForScore, type Offer, type ProjectDecisionContext } from "@/lib/core";

export type ScoredOffer<T extends Offer = Offer> = T & {
  displayScore: number | null;
  scoreMode: "global" | "contextual";
};

export function getScoreColorClass(score: number) {
  if (score >= 85) return "bg-[#163a74]";
  if (score >= 72) return "bg-[#1f4b8f]";
  if (score >= 58) return "bg-[#2f68b1]";
  if (score >= 42) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-600";
}

export function getScoreStatus(score: number) {
  if (score >= 85) return { label: "Excellent choix", className: "bg-blue-100 text-[#163a74]", color: "#163a74" };
  if (score >= 72) return { label: "Très bon choix", className: "bg-blue-50 text-[#1f4b8f]", color: "#1f4b8f" };
  if (score >= 58) return { label: "Bon choix", className: "bg-slate-100 text-[#2f68b1]", color: "#2f68b1" };
  if (score >= 42) return { label: "A surveiller", className: "bg-yellow-100 text-yellow-700", color: "#e6a817" };
  if (score >= 25) return { label: "Risque", className: "bg-orange-100 text-orange-700", color: "#d4652a" };
  return { label: "Peu pertinent", className: "bg-red-100 text-red-700", color: "#c0392b" };
}

export function computeScore(p: number, e: number, f: number, a: number, s: number) {
  if ([p, e, f, a, s].some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
    return null;
  }
  return Math.round(p * 0.25 + e * 0.25 + f * 0.15 + a * 0.2 + s * 0.15);
}

export function computeProjectAwareScore(offer: Offer, context?: ProjectDecisionContext) {
  if (!hasEnoughDataForScore(offer)) return null;

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
    ((offer.pefas.P || 0) * weights.P +
      (offer.pefas.E || 0) * weights.E +
      (offer.pefas.F || 0) * weights.F +
      (offer.pefas.A || 0) * weights.A +
      (offer.pefas.S || 0) * weights.S) /
      total,
  );
}

export function getBaseOfferScore(offer: Offer) {
  if (!hasEnoughDataForScore(offer)) return null;
  return computeScore(offer.pefas.P || 0, offer.pefas.E || 0, offer.pefas.F || 0, offer.pefas.A || 0, offer.pefas.S || 0);
}

export function getOfferDisplayScore(offer: Offer, context?: ProjectDecisionContext) {
  if (context) return computeProjectAwareScore(offer, context);
  return getBaseOfferScore(offer);
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
    .sort((a, b) => {
      if (a.displayScore === null && b.displayScore === null) return 0;
      if (a.displayScore === null) return 1;
      if (b.displayScore === null) return -1;
      return b.displayScore - a.displayScore;
    });
}

export function averageOfferScore(offers: Offer[], context?: ProjectDecisionContext) {
  const ranked = rankOffersByScore(offers, context).filter((offer) => offer.displayScore !== null);
  if (ranked.length === 0) return 0;
  return Math.round(ranked.reduce((sum, offer) => sum + (offer.displayScore || 0), 0) / ranked.length);
}

export function generateShortMimo(score: number | null) {
  if (score === null) return "Score indisponible : donnees insuffisantes pour resumer cette offre.";
  if (score >= 85) return "Offre solide, bien positionnee pour votre profil.";
  if (score >= 72) return "Bon rapport qualite-prix-fiabilite dans votre contexte.";
  if (score >= 58) return "Offre correcte, des alternatives existent.";
  if (score >= 42) return "Quelques points a verifier avant de decider.";
  return "Attention, plusieurs signaux meritent votre vigilance.";
}
