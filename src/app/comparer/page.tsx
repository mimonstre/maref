"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { ScoreCircle, StatusBadge, MimoCard, EmptyState, LoadingSkeleton } from "@/components/shared/Score";
import { getCategoryIcon } from "@/lib/categories";
import type { ProjectDecisionContext } from "@/lib/core";
import type { Offer } from "@/lib/data";
import { getProjectDecisionContext } from "@/features/projects/api";
import { getOffers } from "@/lib/queries";
import { generateMimo } from "@/lib/mimo/engine";
import { getOfferDisplayScore, rankOffersByScore } from "@/lib/score/engine";

const PEFAS_LABELS: Record<string, string> = {
  P: "Pertinence",
  E: "Economie",
  F: "Fluidite",
  A: "Assurance",
  S: "Stabilite",
};

export default function ComparerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectContext, setProjectContext] = useState<ProjectDecisionContext | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getOffers({});
      setAllOffers(data);

      const ids = searchParams.get("ids");
      if (ids) {
        setSelected(ids.split(",").filter(Boolean).slice(0, 3));
      }

      const projectId = searchParams.get("project");
      if (projectId) {
        setProjectContext(await getProjectDecisionContext(projectId));
      }

      setLoading(false);
    }

    void Promise.resolve().then(load);
  }, [searchParams]);

  const selectedOffers = selected
    .map((id) => allOffers.find((offer) => offer.id === id))
    .filter(Boolean) as Offer[];

  const contextualizedOffers = useMemo(
    () =>
      rankOffersByScore(selectedOffers, projectContext || undefined).map((offer) => ({
        ...offer,
        contextualScore: offer.displayScore,
      })),
    [projectContext, selectedOffers],
  );

  const rankedOffers = contextualizedOffers;
  const best = rankedOffers.length >= 2 ? rankedOffers[0] : null;
  const runnerUp = rankedOffers.length >= 2 ? rankedOffers[1] : null;
  const worst = rankedOffers.length >= 2 ? rankedOffers[rankedOffers.length - 1] : null;
  const recommendationGap = best && runnerUp ? best.contextualScore - runnerUp.contextualScore : 0;
  const confidenceLabel = recommendationGap >= 8 ? "Tres claire" : recommendationGap >= 4 ? "Solide" : "A arbitrer";
  const expensiveOffer = rankedOffers.length > 0 ? [...rankedOffers].sort((a, b) => b.price - a.price)[0] : null;
  const budgetAdvantage = best && expensiveOffer ? expensiveOffer.price - best.price : 0;
  const axisLeaders = Object.entries(PEFAS_LABELS).map(([key, label]) => {
    const leader = rankedOffers.reduce((current, offer) =>
      !current || offer.pefas[key as keyof typeof offer.pefas] > current.pefas[key as keyof typeof current.pefas] ? offer : current,
    null as (typeof rankedOffers)[number] | null);
    return { key, label, leader };
  });
  const bestAxisWins = best ? axisLeaders.filter((axis) => axis.leader?.id === best.id).length : 0;

  const filtered = search
    ? allOffers.filter(
        (offer) =>
          !selected.includes(offer.id) &&
          (offer.product.toLowerCase().includes(search.toLowerCase()) ||
            offer.brand.toLowerCase().includes(search.toLowerCase()) ||
            offer.merchant.toLowerCase().includes(search.toLowerCase())),
      )
    : [];

  const compareMimo =
    selectedOffers.length >= 2
      ? generateMimo({
          comparison: selectedOffers,
          project: projectContext || undefined,
          mode: "comparison",
        })
      : "Ajoutez au moins 2 offres pour obtenir une analyse comparative.";

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Comparaison</h2>
        <p className="text-sm text-gray-500">
          {selectedOffers.length} offre{selectedOffers.length > 1 ? "s" : ""} selectionnee{selectedOffers.length > 1 ? "s" : ""}
          {projectContext?.projectName ? " - Projet " + projectContext.projectName : ""}
        </p>
      </div>

      {projectContext && (
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[0.7rem] font-bold text-emerald-700 uppercase tracking-wide">Contexte projet</p>
          <h3 className="font-bold mt-1">{projectContext.projectName}</h3>
          <p className="text-sm text-gray-600 mt-1">{projectContext.projectObjective || "Aucun objectif precise."}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">{projectContext.projectCategory}</span>
            {projectContext.projectBudget && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">Budget {projectContext.projectBudget}</span>
            )}
          </div>
        </div>
      )}

      {selected.length < 3 && (
        <div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={"Ajouter une offre (" + (3 - selected.length) + " place" + (3 - selected.length > 1 ? "s" : "") + " restante" + (3 - selected.length > 1 ? "s" : "") + ")..."}
              className="flex-1 bg-transparent outline-none text-sm"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {search && (
            <div className="bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 p-3">Aucun resultat</p>
              ) : (
                filtered.slice(0, 6).map((offer) => (
                  <div key={offer.id} onClick={() => { setSelected([...selected, offer.id]); setSearch(""); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                    <span className="text-lg">{getCategoryIcon(offer.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{offer.brand} {offer.product}</p>
                      <p className="text-xs text-gray-400">{offer.merchant} - {offer.price.toLocaleString("fr-FR")} EUR</p>
                    </div>
                    <ScoreCircle score={getOfferDisplayScore(offer, projectContext || undefined)} size="xs" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {selected.length === 0 && !search && (
        <EmptyState icon="?" title="Aucune offre a comparer" description="Recherchez et ajoutez 2 ou 3 offres ci-dessus, ou ajoutez des offres depuis les fiches produit." />
      )}

      {selectedOffers.length >= 2 && <MimoCard text={compareMimo} />}

      {selectedOffers.length >= 2 && best && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <Trophy className="w-4 h-4" />
              <p className="text-[0.7rem] font-bold uppercase tracking-wide">Leader global</p>
            </div>
            <p className="text-sm font-bold mt-3">{best.brand} {best.product}</p>
            <p className="text-xs text-gray-500 mt-1">{bestAxisWins} axe{bestAxisWins > 1 ? "s" : ""} domine{bestAxisWins > 1 ? "s" : ""} sur 5</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-[0.7rem] font-bold uppercase tracking-wide">Niveau de confiance</p>
            </div>
            <p className="text-sm font-bold mt-3">{confidenceLabel}</p>
            <p className="text-xs text-gray-500 mt-1">{recommendationGap} point{recommendationGap > 1 ? "s" : ""} d avance sur l alternative suivante</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Sparkles className="w-4 h-4" />
              <p className="text-[0.7rem] font-bold uppercase tracking-wide">Signal budget</p>
            </div>
            <p className="text-sm font-bold mt-3">{budgetAdvantage >= 0 ? "Gain potentiel" : "Surcout assume"}</p>
            <p className="text-xs text-gray-500 mt-1">
              {budgetAdvantage >= 0
                ? budgetAdvantage.toLocaleString("fr-FR") + " EUR de moins que l option la plus chere"
                : Math.abs(budgetAdvantage).toLocaleString("fr-FR") + " EUR au-dessus du maximum"}
            </p>
          </div>
        </div>
      )}

      {selectedOffers.length >= 2 && best && worst && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <p className="text-[0.65rem] text-emerald-600 font-medium">Choix recommande</p>
            <p className="text-sm font-bold text-emerald-800">{best.brand} {best.product}</p>
            <p className="text-xs text-emerald-600">Score contexte {best.contextualScore} - {best.price.toLocaleString("fr-FR")} EUR</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
            <p className="text-[0.65rem] text-yellow-600 font-medium">Le moins adapte</p>
            <p className="text-sm font-bold text-yellow-800">{worst.brand} {worst.product}</p>
            <p className="text-xs text-yellow-600">Score contexte {worst.contextualScore} - {worst.price.toLocaleString("fr-FR")} EUR</p>
          </div>
        </div>
      )}

      {contextualizedOffers.length > 0 && (
        <div className={"grid gap-3 " + (contextualizedOffers.length === 1 ? "grid-cols-1" : contextualizedOffers.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {rankedOffers.map((offer) => (
            <div key={offer.id} className={"bg-white rounded-2xl border p-4 shadow-sm " + (best && offer.id === best.id ? "border-emerald-500 ring-2 ring-emerald-100" : "border-gray-200")}>
              {best && offer.id === best.id && (
                <span className="text-[0.6rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mb-2 inline-block">Recommande</span>
              )}
              <div className="text-center mb-3">
                <p className="text-2xl mb-1">{getCategoryIcon(offer.category)}</p>
                <p className="text-[0.6rem] text-gray-400 uppercase font-medium">{offer.brand}</p>
                <p className="font-bold text-xs leading-tight">{offer.product}</p>
                <p className="text-[0.6rem] text-gray-400 mt-0.5">{offer.merchant}</p>
              </div>
              <div className="flex justify-center mb-2"><ScoreCircle score={offer.contextualScore} size="lg" /></div>
              <div className="text-center mb-1"><StatusBadge score={offer.contextualScore} /></div>
              <p className="text-center text-[0.65rem] text-gray-500 mb-3">
                {projectContext ? "Score contextualise projet" : "Score global"}
              </p>
              <p className="text-center font-bold text-lg mb-3">{offer.price.toLocaleString("fr-FR")} EUR</p>
              {offer.barredPrice && <p className="text-center text-xs text-gray-400 line-through -mt-2 mb-3">{offer.barredPrice.toLocaleString("fr-FR")} EUR</p>}

              <div className="mb-3 space-y-1">
                {Object.entries(PEFAS_LABELS).map(([key, label]) => {
                  const value = offer.pefas[key as keyof typeof offer.pefas];
                  const color = value >= 70 ? "bg-emerald-600" : value >= 50 ? "bg-yellow-500" : "bg-orange-500";
                  const isBestOnAxis = contextualizedOffers.length >= 2 && value === Math.max(...contextualizedOffers.map((item) => item.pefas[key as keyof typeof item.pefas]));
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-12 text-[0.6rem] font-semibold text-gray-500">{label.substring(0, 5)}.</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={"h-full rounded-full " + color} style={{ width: value + "%" }}></div>
                      </div>
                      <span className={"w-6 text-[0.6rem] font-bold text-right " + (isBestOnAxis ? "text-emerald-700" : "text-gray-500")}>{value}</span>
                      {isBestOnAxis && contextualizedOffers.length >= 2 && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                    </div>
                  );
                })}
              </div>

              <div className="text-[0.65rem] text-gray-500 space-y-1 mb-3">
                <div className="flex justify-between"><span>Livraison</span><span className="font-medium text-gray-700">{offer.delivery}</span></div>
                <div className="flex justify-between"><span>Garantie</span><span className="font-medium text-gray-700">{offer.warranty}</span></div>
                <div className="flex justify-between"><span>Disponibilite</span><span className="font-medium text-gray-700">{offer.availability}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                  <span className="font-semibold">Cout total 4 ans</span>
                  <span className="font-bold text-emerald-700">{(offer.price + Math.round(offer.price * 0.08) * 4).toLocaleString("fr-FR")} EUR</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => router.push("/explorer/" + offer.id)} className="flex-1 text-[0.65rem] font-semibold bg-white border border-gray-200 py-2 rounded-lg hover:border-emerald-300 transition-colors">
                  Fiche
                </button>
                <button onClick={() => setSelected(selected.filter((id) => id !== offer.id))} className="flex-1 text-[0.65rem] font-semibold text-red-500 bg-white border border-gray-200 py-2 rounded-lg hover:border-red-300 transition-colors">
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contextualizedOffers.length >= 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Lecture multi-criteres</h3>
          <div className="space-y-2">
            {axisLeaders.map((axis) => (
              <div key={axis.key} className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-gray-700">{axis.label}</p>
                  <p className="text-[0.65rem] text-gray-500">{axis.leader ? axis.leader.brand + " " + axis.leader.product : "Aucun leader"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {axis.leader?.id === best?.id ? <ShieldCheck className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  <span className="text-xs font-bold text-gray-700">
                    {axis.leader ? axis.leader.pefas[axis.key as keyof typeof axis.leader.pefas] : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {contextualizedOffers.length >= 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Comparaison par axe</h3>
          {Object.entries(PEFAS_LABELS).map(([key, label]) => {
            const values = rankedOffers.map((offer) => ({
              name: offer.brand + " " + offer.product,
              value: offer.pefas[key as keyof typeof offer.pefas],
            }));
            const maxValue = Math.max(...values.map((item) => item.value));
            return (
              <div key={key} className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
                {values.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-1">
                    <span className="w-24 text-[0.65rem] text-gray-500 truncate">{item.name.split(" ").slice(0, 2).join(" ")}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={"h-full rounded-full " + (item.value === maxValue ? "bg-emerald-600" : "bg-gray-400")} style={{ width: item.value + "%" }}></div>
                    </div>
                    <span className={"w-7 text-xs font-bold text-right " + (item.value === maxValue ? "text-emerald-700" : "text-gray-500")}>{item.value}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {contextualizedOffers.length >= 2 && best && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Decision finale</h3>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-[0.65rem] text-emerald-700 font-medium">Choix optimal recommande</p>
            <h4 className="font-bold text-emerald-900 mt-1">{best.brand} {best.product}</h4>
            <p className="text-sm text-emerald-800 mt-1">
              Cette offre obtient le meilleur score dans ce contexte et presente aujourd hui le meilleur equilibre entre pertinence, cout et fiabilite.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-lg bg-white/70 border border-emerald-100 p-3">
                <p className="text-[0.65rem] font-medium text-emerald-700">Pourquoi maintenant</p>
                <p className="text-xs text-emerald-900 mt-1">
                  {recommendationGap >= 4
                    ? "L avance sur les autres options est suffisamment nette pour recommander une decision."
                    : "La recommandation existe, mais un arbitrage prix ou usage reste possible."}
                </p>
              </div>
              <div className="rounded-lg bg-white/70 border border-emerald-100 p-3">
                <p className="text-[0.65rem] font-medium text-emerald-700">Action suivante</p>
                <p className="text-xs text-emerald-900 mt-1">
                  {projectContext?.projectId
                    ? "Revenez au projet pour valider la decision ou conserver cette short-list."
                    : "Ouvrez la fiche detaillee pour confirmer les points techniques avant arbitrage final."}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => router.push("/explorer/" + best.id)} className="text-xs font-semibold bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
                Voir la fiche recommande
              </button>
              {projectContext?.projectId && (
                <button onClick={() => router.push("/projets")} className="text-xs font-semibold bg-white border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                  Retour au projet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
