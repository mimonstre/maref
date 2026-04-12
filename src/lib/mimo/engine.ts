import { generateMimoAnalysis } from "@/features/offers/analysis";
import { hasEnoughDataForScore, type Offer, type ProjectDecisionContext } from "@/lib/core";
import { getTruthWarning } from "@/lib/mimo/truthGuard";
import { computeProjectAwareScore, getScoreStatus } from "@/lib/score/engine";

export function generateMimo(input: {
  offer?: Offer;
  comparison?: Offer[];
  project?: ProjectDecisionContext;
  mode?: "offer" | "comparison" | "project" | "explorer" | "dashboard";
}) {
  const truthWarning = getTruthWarning(input);

  function getBudgetSignal() {
    const budgetRaw = input.project?.projectBudget;
    if (!budgetRaw || !input.offer) return null;
    const budgetValue = parseInt(budgetRaw.replace(/[^\d]/g, ""));
    if (Number.isNaN(budgetValue)) return null;
    if (input.offer.price <= budgetValue * 0.85) return "Cette offre reste confortablement sous le budget du projet.";
    if (input.offer.price <= budgetValue) return "Cette offre reste compatible avec le budget cible.";
    if (input.offer.price <= budgetValue * 1.1) return "Cette offre depasse legerement le budget : a arbitrer selon vos priorites.";
    return "Cette offre est nettement au-dessus du budget cible.";
  }

  function getTopSignals(offer: Offer) {
    const entries = Object.entries(offer.pefas).sort((a, b) => (b[1] ?? -1) - (a[1] ?? -1));
    return {
      bestAxis: entries[0],
      weakAxis: entries[entries.length - 1],
    };
  }

  if (input.mode === "dashboard" && input.project?.existingOffers && input.project.existingOffers.length > 0) {
    const ranked = [...input.project.existingOffers].sort((a, b) => (computeProjectAwareScore(b, input.project) || -1) - (computeProjectAwareScore(a, input.project) || -1));
    const best = ranked[0];
    if (!best || !hasEnoughDataForScore(best)) {
      return "Je n ai pas assez de donnees fiables pour resumer votre projet principal.";
    }
    const budgetMessage = input.project.projectBudget ? " Budget cible: " + input.project.projectBudget + "." : "";
    return ((truthWarning ? truthWarning + " " : "") +
      "Votre projet " +
      (input.project.projectName || "principal") +
      " est actuellement mene par " +
      best.brand +
      " " +
      best.product +
      ". " +
      "C est aujourd hui l option la plus coherente avec votre contexte de decision." +
      budgetMessage);
  }

  if (input.mode === "explorer" && input.comparison && input.comparison.length > 0) {
    const ranked = [...input.comparison].sort((a, b) => (computeProjectAwareScore(b, input.project) || -1) - (computeProjectAwareScore(a, input.project) || -1));
    const best = ranked[0];
    const affordable = [...input.comparison].sort((a, b) => a.price - b.price)[0];
    if (!best || !affordable) {
      return "Je n ai pas encore assez de donnees pour orienter cette exploration.";
    }
    return (
      (truthWarning ? truthWarning + " " : "") +
      "Dans cette selection, " +
      best.brand +
      " " +
      best.product +
      " mene par la qualite globale, tandis que " +
      affordable.brand +
      " " +
      affordable.product +
      " reste l entree prix la plus accessible. " +
      "Choisissez selon que vous priorisez la performance globale ou le budget."
    );
  }

  if (input.mode === "comparison" && input.comparison && input.comparison.length > 1) {
    const ranked = [...input.comparison].sort((a, b) => (computeProjectAwareScore(b, input.project) || -1) - (computeProjectAwareScore(a, input.project) || -1));
    const best = ranked[0];
    const runnerUp = ranked[1];
    const bestScore = computeProjectAwareScore(best, input.project);
    const runnerUpScore = runnerUp ? computeProjectAwareScore(runnerUp, input.project) : null;
    if (bestScore === null) {
      return truthWarning || "Je n ai pas assez de donnees pour comparer ces offres de maniere fiable.";
    }
    return (
      (truthWarning ? truthWarning + " " : "") +
      "Dans ce comparatif, " +
      best.brand +
      " " +
      best.product +
      " ressort comme le meilleur choix avec un score contextualise de " +
      bestScore +
      "/100. " +
      (runnerUp && runnerUpScore !== null
        ? "Il devance " + runnerUp.brand + " " + runnerUp.product + " de " + (bestScore - runnerUpScore) + " points sur le contexte actuel. "
        : "") +
      "Je recommande de le retenir comme reference principale."
    );
  }

  if (input.mode === "project" && input.project?.existingOffers && input.project.existingOffers.length > 0) {
    const ranked = [...input.project.existingOffers].sort((a, b) => (computeProjectAwareScore(b, input.project) || -1) - (computeProjectAwareScore(a, input.project) || -1));
    const best = ranked[0];
    if (!best || !hasEnoughDataForScore(best)) {
      return truthWarning || "Le projet contient encore trop peu de donnees fiables pour une recommandation.";
    }
    return (
      (truthWarning ? truthWarning + " " : "") +
      "Pour le projet " +
      (input.project.projectName || "en cours") +
      ", l offre la plus pertinente a ce stade est " +
      best.brand +
      " " +
      best.product +
      ". Elle aligne le mieux le score, le budget et l objectif du projet."
    );
  }

  if (input.offer) {
    if (!hasEnoughDataForScore(input.offer)) {
      return truthWarning || "Je n ai pas assez de donnees pour analyser cette offre de facon fiable.";
    }
    const contextualScore = computeProjectAwareScore(input.offer, input.project);
    if (contextualScore === null) {
      return truthWarning || "Score indisponible : donnees insuffisantes pour une recommandation contextualisee.";
    }
    const status = getScoreStatus(contextualScore);
    const { bestAxis, weakAxis } = getTopSignals(input.offer);
    const budgetSignal = getBudgetSignal();
    return (
      (truthWarning ? truthWarning + " " : "") +
      generateMimoAnalysis(input.offer) +
      " Son meilleur levier est l axe " +
      bestAxis[0] +
      ", alors que l axe " +
      weakAxis[0] +
      " merite le plus de vigilance. " +
      " En contexte projet, cette offre monte a " +
      contextualScore +
      "/100, soit un niveau " +
      status.label.toLowerCase() +
      ". " +
      (budgetSignal || "")
    );
  }

  return "Je peux vous aider a decider a partir d une offre, d un projet ou d un comparatif, a condition d avoir des donnees suffisantes.";
}
