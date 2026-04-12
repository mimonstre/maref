"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck, Sparkles, Trash2, Trophy } from "lucide-react";
import {
  IncompleteDataWarning,
  MimoCard,
  NoDataBlock,
  ScoreCircle,
  StatusBadge,
} from "@/components/shared/Score";
import type { ProjectDecisionContext } from "@/lib/core";
import { hasEnoughDataForScore } from "@/lib/core";
import { getCategoryIcon } from "@/lib/categories";
import type { Offer } from "@/lib/data";
import { generateMimo } from "@/lib/mimo/engine";
import type { CompareGroup } from "./types";

const PEFAS_LABELS: Record<string, string> = {
  P: "Pertinence",
  E: "Economie",
  F: "Fluidite",
  A: "Assurance",
  S: "Stabilite",
};

function getComparableSpecRows(offers: Array<Offer & { contextualScore: number | null }>) {
  const specKeys = Array.from(new Set(offers.flatMap((offer) => Object.keys(offer.specs || {}))));

  return specKeys
    .map((key) => {
      const values = offers.map((offer) => offer.specs?.[key] || "—");
      const uniqueValues = Array.from(new Set(values.filter((value) => value !== "—")));

      return {
        key,
        values,
        useful: uniqueValues.length > 0,
        differs: uniqueValues.length > 1,
      };
    })
    .filter((row) => row.useful)
    .sort((a, b) => Number(b.differs) - Number(a.differs));
}

type CompareFamilySectionProps = {
  group: CompareGroup;
  offers: Array<Offer & { contextualScore: number | null }>;
  projectContext: ProjectDecisionContext | null;
  onRemoveOffer: (groupKey: string, offerId: string) => void;
  onClearGroup: (groupKey: string) => void;
  onOpenOffer: (offerId: string) => void;
};

export default function CompareFamilySection({
  group,
  offers,
  projectContext,
  onRemoveOffer,
  onClearGroup,
  onOpenOffer,
}: CompareFamilySectionProps) {
  const rankedOffers = offers;
  const best = rankedOffers.length >= 2 ? rankedOffers[0] : null;
  const runnerUp = rankedOffers.length >= 2 ? rankedOffers[1] : null;
  const worst = rankedOffers.length >= 2 ? rankedOffers[rankedOffers.length - 1] : null;
  const recommendationGap =
    best && runnerUp && best.contextualScore !== null && runnerUp.contextualScore !== null
      ? best.contextualScore - runnerUp.contextualScore
      : 0;
  const confidenceLabel = recommendationGap >= 8 ? "Tres claire" : recommendationGap >= 4 ? "Solide" : "A arbitrer";
  const expensiveOffer = rankedOffers.length > 0 ? [...rankedOffers].sort((a, b) => b.price - a.price)[0] : null;
  const budgetAdvantage = best && expensiveOffer ? expensiveOffer.price - best.price : 0;
  const incompleteComparison = rankedOffers.some((offer) => !hasEnoughDataForScore(offer));
  const axisLeaders = Object.entries(PEFAS_LABELS).map(([key, label]) => {
    const leader = rankedOffers.reduce((current, offer) =>
      !current || (offer.pefas[key as keyof typeof offer.pefas] || 0) > (current.pefas[key as keyof typeof current.pefas] || 0)
        ? offer
        : current,
    null as (typeof rankedOffers)[number] | null);
    return { key, label, leader };
  });
  const bestAxisWins = best ? axisLeaders.filter((axis) => axis.leader?.id === best.id).length : 0;
  const compareMimo =
    rankedOffers.length >= 2
      ? generateMimo({
          comparison: rankedOffers,
          project: projectContext || undefined,
          mode: "comparison",
        })
      : "Ajoutez au moins une autre offre de cette famille pour obtenir une comparaison exploitable.";
  const technicalRows = getComparableSpecRows(rankedOffers);

  return (
    <section className="premium-surface space-y-5 rounded-[30px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-blue-700">Famille</p>
          <h3 className="mt-1 text-lg font-bold">{group.label}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {rankedOffers.length} offre{rankedOffers.length > 1 ? "s" : ""} dans cette comparaison
            {projectContext?.projectName ? " - Projet " + projectContext.projectName : ""}
          </p>
        </div>
        <button
          onClick={() => onClearGroup(group.key)}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Vider
        </button>
      </div>

      {rankedOffers.length < 2 ? (
        <NoDataBlock
          title={"Comparaison incomplete pour " + group.label}
          description="Ajoutez au moins une autre offre de cette meme famille depuis l explorer ou la fiche produit."
        />
      ) : (
        <>
          <MimoCard text={compareMimo} />
          {incompleteComparison && (
            <IncompleteDataWarning description="Certaines offres n ont pas assez de donnees structurees pour une comparaison complete. Les recommandations restent partielles." />
          )}

          {best && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="premium-card rounded-[24px] p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Trophy className="h-4 w-4" />
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide">Leader global</p>
                </div>
                <p className="mt-3 text-sm font-bold">{best.brand} {best.product}</p>
                <p className="mt-1 text-xs text-gray-500">{bestAxisWins} axe{bestAxisWins > 1 ? "s" : ""} dominant{bestAxisWins > 1 ? "s" : ""} sur 5</p>
              </div>
              <div className="premium-card rounded-[24px] p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide">Niveau de confiance</p>
                </div>
                <p className="mt-3 text-sm font-bold">{confidenceLabel}</p>
                <p className="mt-1 text-xs text-gray-500">{recommendationGap} point{recommendationGap > 1 ? "s" : ""} d avance sur l alternative suivante</p>
              </div>
              <div className="premium-card rounded-[24px] p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide">Signal budget</p>
                </div>
                <p className="mt-3 text-sm font-bold">{budgetAdvantage >= 0 ? "Gain potentiel" : "Surcout assume"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {budgetAdvantage >= 0
                    ? budgetAdvantage.toLocaleString("fr-FR") + " EUR de moins que l option la plus chere"
                    : Math.abs(budgetAdvantage).toLocaleString("fr-FR") + " EUR au-dessus du maximum"}
                </p>
              </div>
            </div>
          )}

          {best && worst && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 text-center">
                <p className="text-[0.65rem] font-medium text-blue-600">Choix recommande</p>
                <p className="text-sm font-bold text-blue-800">{best.brand} {best.product}</p>
                <p className="text-xs text-blue-600">Score {best.contextualScore ?? "indisponible"} - {best.price.toLocaleString("fr-FR")} EUR</p>
              </div>
              <div className="rounded-[24px] border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-4 text-center">
                <p className="text-[0.65rem] font-medium text-yellow-600">Le moins adapte</p>
                <p className="text-sm font-bold text-yellow-800">{worst.brand} {worst.product}</p>
                <p className="text-xs text-yellow-600">Score {worst.contextualScore ?? "indisponible"} - {worst.price.toLocaleString("fr-FR")} EUR</p>
              </div>
            </div>
          )}
        </>
      )}

      <div className={"grid gap-3 " + (rankedOffers.length === 1 ? "grid-cols-1" : rankedOffers.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {rankedOffers.map((offer) => {
          const isBest = best?.id === offer.id;
          return (
            <div key={offer.id} className={"premium-card rounded-[28px] p-4 " + (isBest ? "border-blue-500 ring-2 ring-blue-100" : "")}>
              {isBest && (
                <span className="mb-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[0.6rem] font-bold text-blue-800">Recommande</span>
              )}
              <div className="mb-3 text-center">
                <p className="mb-1 text-2xl">{getCategoryIcon(offer.category)}</p>
                <p className="text-[0.6rem] font-medium uppercase text-gray-400">{offer.brand}</p>
                <p className="text-xs font-bold leading-tight">{offer.product}</p>
                <p className="mt-0.5 text-[0.6rem] text-gray-400">{offer.merchant}</p>
              </div>
              <div className="mb-2 flex justify-center">
                <ScoreCircle score={offer.contextualScore} size="lg" />
              </div>
              <div className="mb-1 text-center">
                <StatusBadge score={offer.contextualScore} />
              </div>
              <p className="mb-3 text-center text-[0.65rem] text-gray-500">{projectContext ? "Score contextualise projet" : "Score global"}</p>
              <p className="mb-3 text-center text-lg font-bold">{offer.price.toLocaleString("fr-FR")} EUR</p>
              {offer.barredPrice && <p className="-mt-2 mb-3 text-center text-xs text-gray-400 line-through">{offer.barredPrice.toLocaleString("fr-FR")} EUR</p>}

              <div className="mb-3 space-y-1">
                {Object.entries(PEFAS_LABELS).map(([key, label]) => {
                  const value = offer.pefas[key as keyof typeof offer.pefas] || 0;
                  const color = value >= 70 ? "bg-blue-600" : value >= 50 ? "bg-yellow-500" : "bg-orange-500";
                  const isBestOnAxis =
                    rankedOffers.length >= 2 &&
                    value === Math.max(...rankedOffers.map((item) => item.pefas[key as keyof typeof item.pefas] || 0));

                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-12 text-[0.6rem] font-semibold text-gray-500">{label.substring(0, 5)}.</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className={"h-full rounded-full " + color} style={{ width: value + "%" }}></div>
                      </div>
                      <span className={"w-6 text-right text-[0.6rem] font-bold " + (isBestOnAxis ? "text-blue-700" : "text-gray-500")}>{value}</span>
                      {isBestOnAxis && rankedOffers.length >= 2 && <CheckCircle2 className="h-3 w-3 text-blue-700" />}
                    </div>
                  );
                })}
              </div>

              <div className="mb-3 space-y-1 text-[0.65rem] text-gray-500">
                <div className="flex justify-between"><span>Livraison</span><span className="font-medium text-gray-700">{offer.delivery}</span></div>
                <div className="flex justify-between"><span>Garantie</span><span className="font-medium text-gray-700">{offer.warranty}</span></div>
                <div className="flex justify-between"><span>Disponibilite</span><span className="font-medium text-gray-700">{offer.availability}</span></div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => onOpenOffer(offer.id)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-[0.65rem] font-semibold transition-colors hover:border-blue-300"
                >
                  Fiche
                </button>
                <button
                  onClick={() => onRemoveOffer(group.key, offer.id)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-[0.65rem] font-semibold text-red-500 transition-colors hover:border-red-300"
                >
                  Retirer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rankedOffers.length >= 2 && (
        <>
          <div className="premium-card rounded-[26px] p-4">
            <h4 className="mb-3 text-sm font-bold">Lecture multi-criteres</h4>
            <div className="space-y-2">
              {axisLeaders.map((axis) => (
                <div key={axis.key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{axis.label}</p>
                    <p className="text-[0.65rem] text-gray-500">{axis.leader ? axis.leader.brand + " " + axis.leader.product : "Aucun leader"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {axis.leader?.id === best?.id ? <ShieldCheck className="h-4 w-4 text-blue-700" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    <span className="text-xs font-bold text-gray-700">
                      {axis.leader ? axis.leader.pefas[axis.key as keyof typeof axis.leader.pefas] : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card rounded-[26px] p-4">
            <h4 className="mb-3 text-sm font-bold">Comparatif technique</h4>
            {technicalRows.length === 0 ? (
              <NoDataBlock
                title="Données techniques insuffisantes"
                description="Les fiches de cette famille ne partagent pas encore assez de données techniques réelles pour une comparaison détaillée."
              />
            ) : (
              <div className="space-y-2">
                {technicalRows.slice(0, 8).map((row) => (
                  <div key={row.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-gray-700">{row.key}</p>
                      <span className={"rounded-full px-2 py-0.5 text-[0.65rem] font-semibold " + (row.differs ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-600")}>
                        {row.differs ? "Écart visible" : "Valeurs proches"}
                      </span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      {rankedOffers.map((offer, index) => (
                        <div key={offer.id + row.key} className={"rounded-lg border px-3 py-2 " + (index === 0 ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white")}>
                          <p className="text-[0.65rem] font-semibold text-gray-500">{offer.brand}</p>
                          <p className="truncate text-xs font-bold text-gray-900">{offer.product}</p>
                          <p className="mt-1 text-xs text-gray-600">{offer.specs?.[row.key] || "Non documenté"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="premium-card rounded-[26px] p-4">
            <h4 className="mb-3 text-sm font-bold">Decision finale</h4>
            <div className="rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
              <p className="text-[0.65rem] font-medium text-blue-700">Choix optimal recommande</p>
              <h5 className="mt-1 font-bold text-blue-900">{best?.brand} {best?.product}</h5>
              <p className="mt-1 text-sm text-blue-800">
                Cette offre obtient le meilleur score dans cette famille et presente aujourd hui le meilleur equilibre entre pertinence, cout et fiabilite.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-blue-100 bg-white/70 p-3">
                  <p className="text-[0.65rem] font-medium text-blue-700">Pourquoi maintenant</p>
                  <p className="mt-1 text-xs text-blue-900">
                    {recommendationGap >= 4
                      ? "L avance sur les autres options est suffisamment nette pour recommander une decision."
                      : "La recommandation existe, mais un arbitrage prix ou usage reste possible."}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-white/70 p-3">
                  <p className="text-[0.65rem] font-medium text-blue-700">Action suivante</p>
                  <p className="mt-1 text-xs text-blue-900">
                    {projectContext?.projectId
                      ? "Revenez au projet pour valider la decision ou conserver cette short-list."
                      : "Ouvrez la fiche detaillee pour confirmer les points techniques avant arbitrage final."}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => best && onOpenOffer(best.id)}
                  className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Voir la fiche recommande
                </button>
                {projectContext?.projectId && (
                  <Link
                    href="/projets"
                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-50"
                  >
                    Retour au projet
                  </Link>
                )}
              </div>
            </div>
          </div>

          <NoDataBlock
            title="Cout total long terme indisponible"
            description="MAREF n affiche plus d estimation arbitraire de cout sur plusieurs annees sans source reelle documentee."
          />
        </>
      )}
    </section>
  );
}
