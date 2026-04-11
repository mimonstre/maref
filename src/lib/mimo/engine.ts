import { generateMimoAnalysis } from "@/features/offers/analysis";
import type { Offer, ProjectDecisionContext } from "@/lib/core";
import { computeProjectAwareScore, getScoreStatus } from "@/lib/score/engine";

export function generateMimo(input: {
  offer?: Offer;
  comparison?: Offer[];
  project?: ProjectDecisionContext;
  mode?: "offer" | "comparison" | "project" | "explorer" | "dashboard";
}) {
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
    const entries = Object.entries(offer.pefas).sort((a, b) => b[1] - a[1]);
    return {
      bestAxis: entries[0],
      weakAxis: entries[entries.length - 1],
    };
  }

  if (input.mode === "dashboard" && input.project?.existingOffers && input.project.existingOffers.length > 0) {
    const ranked = [...input.project.existingOffers].sort(
      (a, b) => computeProjectAwareScore(b, input.project) - computeProjectAwareScore(a, input.project),
    );
    const best = ranked[0];
    const budgetMessage = input.project.projectBudget ? " Budget cible: " + input.project.projectBudget + "." : "";
    return (
      "Votre projet " +
      (input.project.projectName || "principal") +
      " est actuellement mene par " +
      best.brand +
      " " +
      best.product +
      ". " +
      "C est aujourd hui l option la plus coherente avec votre contexte de decision." +
      budgetMessage
    );
  }

  if (input.mode === "explorer" && input.comparison && input.comparison.length > 0) {
    const ranked = [...input.comparison].sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const affordable = [...input.comparison].sort((a, b) => a.price - b.price)[0];
    return (
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
    const ranked = [...input.comparison].sort(
      (a, b) => computeProjectAwareScore(b, input.project) - computeProjectAwareScore(a, input.project),
    );
    const best = ranked[0];
    const runnerUp = ranked[1];
    const bestScore = computeProjectAwareScore(best, input.project);
    const runnerUpScore = runnerUp ? computeProjectAwareScore(runnerUp, input.project) : null;
    return (
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
    const ranked = [...input.project.existingOffers].sort(
      (a, b) => computeProjectAwareScore(b, input.project) - computeProjectAwareScore(a, input.project),
    );
    const best = ranked[0];
    return (
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
    const contextualScore = computeProjectAwareScore(input.offer, input.project);
    const status = getScoreStatus(contextualScore);
    const { bestAxis, weakAxis } = getTopSignals(input.offer);
    const budgetSignal = getBudgetSignal();
    return (
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

  return "Je peux vous aider a decider a partir d une offre, d un projet ou d un comparatif.";
}
