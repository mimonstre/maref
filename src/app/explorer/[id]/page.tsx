"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AxisBar,
  DataTruthBadge,
  EmptyState,
  LoadingSkeleton,
  MimoCard,
  ScoreCircle,
  StatusBadge,
  Toast,
} from "@/components/shared/Score";
import { addOfferToCompareGroups } from "@/features/compare/store";
import { categorizeSpecs, generateSpecsMimo, PEFAS_INFO, SPEC_ICONS } from "@/features/offers/analysis";
import { addOfferToProject, getProjectsWithOffers, type Project } from "@/features/projects/api";
import { getCategoryIcon } from "@/lib/categories";
import { deriveUserJourney, getOfferTruthDescriptor } from "@/lib/core";
import type { Offer } from "@/lib/data";
import { generateMimo } from "@/lib/mimo/engine";
import { getOfferDisplayScore, rankOffersByScore, toBaseOffer } from "@/lib/score/engine";
import { addFavorite, getFavorites, getOfferById, getOffers, recordView, removeFavorite } from "@/lib/queries";

function getProductGroupKey(offer: Offer) {
  return [offer.category, offer.subcategory, offer.brand, offer.model || offer.product].join("::");
}

function buildPriceChartPath(points: Array<{ date: string; price: number }>) {
  if (points.length === 0) return "";
  const minPrice = Math.min(...points.map((entry) => entry.price));
  const maxPrice = Math.max(...points.map((entry) => entry.price));
  const span = Math.max(1, maxPrice - minPrice);

  return points
    .map((entry, index) => {
      const x = 20 + (index * 280) / Math.max(1, points.length - 1);
      const y = 105 - ((entry.price - minPrice) / span) * 70;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [productOffer, setProductOffer] = useState<Offer | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [merchantOffers, setMerchantOffers] = useState<Offer[]>([]);
  const [alternatives, setAlternatives] = useState<Offer[]>([]);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<string[]>([]);
  const [hoveredOfferId, setHoveredOfferId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, Offer[]>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [showAllReasons, setShowAllReasons] = useState(false);
  const [showAllVigilances, setShowAllVigilances] = useState(false);
  const [activeSpecCat, setActiveSpecCat] = useState<string | null>(null);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  function showToast(message: string) {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(""), 2200);
  }

  useEffect(() => {
    async function loadPage() {
      setLoading(true);

      const requestedId = String(params.id);
      let currentOffer = await getOfferById(requestedId);

      if (!currentOffer && requestedId.startsWith("bestbuy-")) {
        const response = await fetch("/api/bestbuy/offers?ids=" + encodeURIComponent(requestedId));
        if (response.ok) {
          const json = await response.json();
          currentOffer = (json.offers?.[0] || null) as Offer | null;
        }
      }

      if (!currentOffer) {
        setProductOffer(null);
        setMerchantOffers([]);
        setAlternatives([]);
        setLoading(false);
        return;
      }

      void recordView(currentOffer.id);
      const [sameSubcategoryOffers, favorites, projectData] = await Promise.all([
        getOffers({ subcategory: currentOffer.subcategory }),
        getFavorites(),
        getProjectsWithOffers(),
      ]);

      const sameProductOffers = sameSubcategoryOffers
        .filter((item) => getProductGroupKey(item) === getProductGroupKey(currentOffer))
        .sort((a, b) => a.price - b.price);

      const groupedOffers = sameProductOffers.length > 0 ? sameProductOffers : [currentOffer];
      const nextAlternatives = sameSubcategoryOffers.filter((item) => getProductGroupKey(item) !== getProductGroupKey(currentOffer));

      setProductOffer(groupedOffers[0]);
      setSelectedOfferId(groupedOffers[0]?.id || currentOffer.id);
      setMerchantOffers(groupedOffers);
      setFavoriteOfferIds(favorites);
      setProjects(projectData.projects);
      setProjectOffers(projectData.projectOffers);
      setAlternatives(rankOffersByScore(nextAlternatives).map(toBaseOffer).slice(0, 4));
      setLoading(false);
    }

    void loadPage();
  }, [params.id]);

  const selectedOffer = useMemo(
    () => merchantOffers.find((offer) => offer.id === selectedOfferId) || merchantOffers[0] || productOffer,
    [merchantOffers, productOffer, selectedOfferId],
  );

  async function toggleFavorite(offerId: string) {
    const isFavorite = favoriteOfferIds.includes(offerId);
    if (isFavorite) {
      await removeFavorite(offerId);
      setFavoriteOfferIds((current) => current.filter((id) => id !== offerId));
      showToast("Retirée des favoris");
      return;
    }

    await addFavorite(offerId);
    setFavoriteOfferIds((current) => [...current, offerId]);
    showToast("Ajoutée aux favoris");
  }

  async function handleAddToProject(projectId: string, offerId: string) {
    const result = await addOfferToProject(projectId, offerId);
    if (!result.success && result.reason === "exists") {
      showToast("Déjà dans ce projet");
      return;
    }

    if (result.success) {
      const nextProjects = await getProjectsWithOffers();
      setProjects(nextProjects.projects);
      setProjectOffers(nextProjects.projectOffers);
      const project = nextProjects.projects.find((item) => item.id === projectId);
      showToast("Ajoutée à " + (project?.name || "votre projet"));
    }
  }

  function handleCompareOffer(offer: Offer) {
    const result = addOfferToCompareGroups(offer);

    if (result.status === "exists") {
      showToast("Cette offre est déjà dans " + result.family.label);
      return;
    }

    if (result.status === "full") {
      showToast(result.family.label + " contient déjà 3 offres maximum");
      return;
    }

    showToast("Offre ajoutée à " + result.family.label);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!productOffer || !selectedOffer) {
    return (
      <EmptyState
        icon="?"
        title="Produit introuvable"
        description="Ce produit n’existe pas ou n’est plus disponible."
        action={() => router.push("/explorer")}
        actionLabel="Retour à l’explorer"
      />
    );
  }

  const truth = getOfferTruthDescriptor(selectedOffer);
  const safeSpecs = selectedOffer.specs ?? {};
  const specCategories = categorizeSpecs(safeSpecs);
  const hasSpecs = Object.keys(safeSpecs).length > 0;
  const sortedPriceHistory = [...(selectedOffer.priceHistory || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pathData = buildPriceChartPath(sortedPriceHistory);
  const mimoText =
    selectedOffer.reasons.length > 0 || selectedOffer.vigilances.length > 0
      ? `Sur cette offre, Mimo voit surtout ${selectedOffer.reasons.slice(0, 2).join(" et ").toLowerCase()}. ${
          selectedOffer.vigilances[0]
            ? "Le principal point de vigilance reste " + selectedOffer.vigilances[0].toLowerCase() + "."
            : "Le niveau global reste cohérent si ce produit correspond bien à votre besoin."
        }`
      : generateMimo({ offer: selectedOffer, mode: "offer" });

  const journey = deriveUserJourney(projects, projectOffers);
  const activeProjectId = journey.activeProjectId || projects[0]?.id;
  const activeProject = projects.find((project) => project.id === activeProjectId) || null;

  return (
    <div className="space-y-4">
      <Toast message={toastMsg} />

      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-950">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Retour
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 text-4xl">
            {productOffer.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={productOffer.imageUrl} alt={productOffer.product} className="h-full w-full object-cover" />
            ) : (
              getCategoryIcon(productOffer.category)
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{productOffer.brand}</p>
            <h2 className="text-lg font-bold">{productOffer.product}</h2>
            <p className="text-xs text-gray-500">{productOffer.model}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{productOffer.subcategory}</span>
              <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {merchantOffers.length} offre{merchantOffers.length > 1 ? "s" : ""} marchande{merchantOffers.length > 1 ? "s" : ""} référencée{merchantOffers.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-blue-950">Offres marchands</p>
            <h3 className="mt-1 font-bold">Le score MAREF s’applique à chaque offre, pas à la fiche produit</h3>
            <p className="mt-1 text-sm text-gray-500">Choisissez une offre marchande pour afficher son score, ses axes PEFAS, son historique et sa redirection.</p>
          </div>
          <DataTruthBadge label={truth.label} state={truth.state} />
        </div>

        <div className="space-y-2">
          {merchantOffers.map((merchantOffer) => {
            const isSelected = merchantOffer.id === selectedOffer.id;
            const isFavorite = favoriteOfferIds.includes(merchantOffer.id);

            return (
              <div
                key={merchantOffer.id}
                className={
                  "rounded-xl border p-3 transition-all " +
                  (isSelected ? "border-blue-950 bg-slate-50 shadow-sm" : "border-gray-200 bg-white")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">{merchantOffer.merchant}</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{merchantOffer.price.toLocaleString("fr-FR")} EUR</p>
                    <p className="text-xs text-gray-500">
                      {merchantOffer.delivery} • {merchantOffer.warranty} • {merchantOffer.availability}
                    </p>
                  </div>
                  <div
                    className="relative flex flex-col items-end gap-2"
                    onMouseEnter={() => setHoveredOfferId(merchantOffer.id)}
                    onMouseLeave={() => setHoveredOfferId((current) => (current === merchantOffer.id ? null : current))}
                  >
                    <ScoreCircle score={getOfferDisplayScore(merchantOffer)} size="sm" />
                    <StatusBadge score={getOfferDisplayScore(merchantOffer)} />
                    {hoveredOfferId === merchantOffer.id && (
                      <div className="absolute right-0 top-16 z-20 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-blue-950">Lecture PEFAS</p>
                        {Object.entries(PEFAS_INFO).map(([key, info]) => {
                          const axisValue = merchantOffer.pefas[key as keyof typeof merchantOffer.pefas];
                          return <AxisBar key={key} label={info.name} value={typeof axisValue === "number" ? axisValue : 0} />;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedOfferId(merchantOffer.id)}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors " +
                      (isSelected ? "bg-blue-950 text-white" : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300")
                    }
                  >
                    {isSelected ? "Offre sélectionnée" : "Analyser"}
                  </button>
                  <button
                    onClick={() => handleCompareOffer(merchantOffer)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-blue-950 transition-colors hover:bg-slate-200"
                  >
                    Comparer
                  </button>
                  <button
                    onClick={() => void toggleFavorite(merchantOffer.id)}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors " +
                      (isFavorite ? "bg-blue-950 text-white" : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300")
                    }
                  >
                    {isFavorite ? "En favoris" : "Favoris"}
                  </button>
                  {activeProject ? (
                    <button
                      onClick={() => void handleAddToProject(activeProject.id, merchantOffer.id)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300"
                    >
                      Ajouter à {activeProject.name}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/projets")}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300"
                    >
                      Créer un projet
                    </button>
                  )}
                  {merchantOffer.sourceUrl && (
                    <a
                      href={merchantOffer.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300"
                    >
                      Voir l’offre
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MimoCard text={mimoText} />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Données techniques</h3>
              <p className="mt-0.5 text-xs text-gray-400">{Object.keys(safeSpecs).length} caractéristiques</p>
            </div>
            {hasSpecs && (
              <button onClick={() => setShowAllSpecs(!showAllSpecs)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-blue-950 transition-colors hover:bg-slate-200">
                {showAllSpecs ? "Réduire" : "Tout voir"}
              </button>
            )}
          </div>
        </div>

        {!hasSpecs ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">Données techniques non disponibles pour cette offre.</p>
          </div>
        ) : (
          <div>
            <div className="border-b border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold text-gray-500">Caractéristiques clés</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(safeSpecs).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-gray-100 bg-white p-2 text-center">
                    <p className="text-[0.6rem] text-gray-400">{key}</p>
                    <p className="mt-0.5 text-xs font-bold text-gray-800">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {(showAllSpecs || activeSpecCat) && (
              <div className="divide-y divide-gray-100">
                {Object.entries(specCategories).map(([categoryName, items]) => (
                  <div key={categoryName}>
                    <button onClick={() => setActiveSpecCat(activeSpecCat === categoryName ? null : categoryName)} className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{SPEC_ICONS[categoryName] || "[]"}</span>
                        <span className="text-sm font-semibold">{categoryName}</span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.65rem] text-gray-400">{items.length}</span>
                      </div>
                      <svg className={"h-4 w-4 text-gray-400 transition-transform " + (activeSpecCat === categoryName ? "rotate-180" : "")} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {activeSpecCat === categoryName && (
                      <div className="px-4 pb-4">
                        {items.map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
                            <span className="text-xs text-gray-600">{key}</span>
                            <span className="text-xs font-semibold text-gray-800">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showAllSpecs && (
              <div className="border-t border-gray-100 p-4">
                <MimoCard compact text={generateSpecsMimo(safeSpecs)} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-2 text-sm font-bold text-blue-950">Points forts ({selectedOffer.reasons.length})</h4>
        {(showAllReasons ? selectedOffer.reasons : selectedOffer.reasons.slice(0, 3)).map((reason, index) => (
          <div key={index} className="flex items-center gap-2 border-b border-gray-100 py-2 text-sm last:border-0">
            <svg className="h-4 w-4 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {reason}
          </div>
        ))}
        {selectedOffer.reasons.length > 3 && (
          <button onClick={() => setShowAllReasons(!showAllReasons)} className="mt-2 text-xs font-semibold text-blue-950 hover:underline">
            {showAllReasons ? "Voir moins" : "Voir tout (" + selectedOffer.reasons.length + ")"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-2 text-sm font-bold text-yellow-700">Points de vigilance ({selectedOffer.vigilances.length})</h4>
        {(showAllVigilances ? selectedOffer.vigilances : selectedOffer.vigilances.slice(0, 2)).map((vigilance, index) => (
          <div key={index} className="flex items-center gap-2 border-b border-gray-100 py-2 text-sm last:border-0">
            <svg className="h-4 w-4 shrink-0 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {vigilance}
          </div>
        ))}
        {selectedOffer.vigilances.length > 2 && (
          <button onClick={() => setShowAllVigilances(!showAllVigilances)} className="mt-2 text-xs font-semibold text-yellow-700 hover:underline">
            {showAllVigilances ? "Voir moins" : "Voir tout (" + selectedOffer.vigilances.length + ")"}
          </button>
        )}
      </div>

      {sortedPriceHistory.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold">Historique de prix</h3>
            <p className="mt-1 text-xs text-gray-500">Courbe construite à partir des relevés enregistrés pour l’offre sélectionnée.</p>
          </div>
          <svg viewBox="0 0 320 140" className="h-40 w-full overflow-visible">
            <path d={pathData} fill="none" stroke="#10294e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {sortedPriceHistory.map((entry, index) => {
              const minPrice = Math.min(...sortedPriceHistory.map((item) => item.price));
              const maxPrice = Math.max(...sortedPriceHistory.map((item) => item.price));
              const span = Math.max(1, maxPrice - minPrice);
              const x = 20 + (index * 280) / Math.max(1, sortedPriceHistory.length - 1);
              const y = 105 - ((entry.price - minPrice) / span) * 70;
              return (
                <g key={entry.date + entry.price}>
                  <circle cx={x} cy={y} r="4" fill="#10294e" />
                  <text x={x} y="126" textAnchor="middle" fontSize="10" fill="#64748b">
                    {new Date(entry.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-4 space-y-2">
            {[...sortedPriceHistory].reverse().map((entry) => (
              <div key={entry.date + entry.price} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{entry.price.toLocaleString("fr-FR")} EUR</p>
                  <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString("fr-FR")}</p>
                </div>
                {entry.sourceUrl ? (
                  <a href={entry.sourceUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300">
                    Source
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Source non liée</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {alternatives.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Alternatives ({alternatives.length})</h3>
            <button onClick={() => router.push("/explorer")} className="text-xs font-semibold text-blue-950">
              Voir tout
            </button>
          </div>
          <div className="space-y-2">
            {alternatives.map((alternative) => (
              <div
                key={alternative.id}
                onClick={() => router.push("/explorer/" + alternative.id)}
                className="group flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-xl transition-colors group-hover:bg-slate-100">
                  {getCategoryIcon(alternative.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-medium uppercase text-gray-400">{alternative.brand}</p>
                  <p className="truncate text-xs font-semibold transition-colors group-hover:text-blue-950">{alternative.product}</p>
                  <p className="mt-1 text-[0.7rem] text-gray-400">{alternative.merchant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
