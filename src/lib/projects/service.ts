import type { ProjectDecisionContext } from "@/lib/core";
import { generateMimo } from "@/lib/mimo/engine";
import { averageOfferScore, rankOffersByScore } from "@/lib/score/engine";

function parseBudgetValue(budget?: string) {
  if (!budget) return null;
  const numeric = parseInt(budget.replace(/[^\d]/g, ""));
  return Number.isNaN(numeric) ? null : numeric;
}

export function analyzeProject(context: ProjectDecisionContext) {
  const offers = context.existingOffers || [];
  const rankedOffers = rankOffersByScore(offers, context).map((offer) => ({
    ...offer,
    contextualScore: offer.displayScore,
  }));
  const bestOffer = rankedOffers[0] || null;
  const budgetValue = parseBudgetValue(context.projectBudget);
  const totalPrice = offers.reduce((sum, offer) => sum + offer.price, 0);
  const averageScore = averageOfferScore(offers, context);
  const budgetUsagePercent = budgetValue && totalPrice > 0 ? Math.round((totalPrice / budgetValue) * 100) : null;
  const budgetStatus = budgetValue === null
    ? "A definir"
    : totalPrice <= budgetValue
      ? "Dans le budget"
      : totalPrice <= budgetValue * 1.1
        ? "Budget sous tension"
        : "Hors budget";
  const decisionStage = offers.length === 0 ? "empty" : offers.length === 1 ? "scoping" : offers.length < 3 ? "comparing" : "ready";
  const nextAction = decisionStage === "empty"
    ? "Ajoutez vos premieres offres pour lancer une analyse."
    : decisionStage === "scoping"
      ? "Ajoutez une ou deux alternatives pour rendre la comparaison credible."
      : decisionStage === "comparing"
        ? "Vous pouvez deja comparer ces offres et isoler un choix principal."
        : "Le projet est suffisamment mature pour une recommandation finale.";

  return {
    totalOffers: offers.length,
    totalPrice,
    averageScore,
    bestOffer,
    rankedOffers,
    budgetValue,
    budgetUsagePercent,
    budgetStatus,
    decisionStage,
    nextAction,
    recommendation: generateMimo({ mode: "project", project: context }),
  };
}
