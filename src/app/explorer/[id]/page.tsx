"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AxisBar,
  DataTruthBadge,
  EmptyState,
  IncompleteDataWarning,
  LoadingSkeleton,
  MimoCard,
  NoDataBlock,
  ScoreCircle,
  StatusBadge,
  Toast,
} from "@/components/shared/Score";
import {
  categorizeSpecs,
  generateSpecsMimo,
  PEFAS_INFO,
  SPEC_ICONS,
} from "@/features/offers/analysis";
import { getCategoryIcon } from "@/lib/categories";
import { deriveUserJourney, getOfferTruthDescriptor } from "@/lib/core";
import type { Offer } from "@/lib/data";
import { generateMimo } from "@/lib/mimo/engine";
import { analyzeProject } from "@/lib/projects/service";
import { getOfferDisplayScore, rankOffersByScore, toBaseOffer } from "@/lib/score/engine";
import { addOfferToProject, getProjectsWithOffers, type Project } from "@/features/projects/api";
import { addOfferToCompareGroups } from "@/features/compare/store";
import {
  addFavorite,
  getFavorites,
  getOfferById,
  getOffers,
  recordView,
  removeFavorite,
} from "@/lib/queries";

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [alternatives, setAlternatives] = useState<Offer[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [activeAxis, setActiveAxis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, Offer[]>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [showAllReasons, setShowAllReasons] = useState(false);
  const [showAllVigilances, setShowAllVigilances] = useState(false);
  const [activeSpecCat, setActiveSpecCat] = useState<string | null>(null);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  function showToast(message: string) {
    setToastMsg(message);
    setTimeout(() => setToastMsg(""), 2000);
  }

  useEffect(() => {
    async function loadOfferPage() {
      setLoading(true);

      const offerId = String(params.id);
      const currentOffer = await getOfferById(offerId);
      setOffer(currentOffer);

      if (currentOffer) {
        void recordView(currentOffer.id);

        const sameSubcategoryOffers = await getOffers({ subcategory: currentOffer.subcategory });
        setAlternatives(
          rankOffersByScore(sameSubcategoryOffers.filter((item) => item.id !== currentOffer.id))
            .map(toBaseOffer)
            .slice(0, 4),
        );

        const favorites = await getFavorites();
        setIsFav(favorites.includes(currentOffer.id));
      }

      const projectData = await getProjectsWithOffers();
      setProjects(projectData.projects);
      setProjectOffers(projectData.projectOffers);

      setLoading(false);
    }

    void loadOfferPage();
  }, [params.id]);

  async function toggleFav() {
    if (!offer) return;

    if (isFav) {
      await removeFavorite(offer.id);
      setIsFav(false);
      showToast("Retire des favoris");
      return;
    }

    await addFavorite(offer.id);
    setIsFav(true);
    showToast("Ajoute aux favoris");
  }

  async function addToProject(projectId: string) {
    if (!offer) return;

    const result = await addOfferToProject(projectId, offer.id);

    if (!result.success && result.reason === "exists") {
      showToast("Deja dans ce projet");
    } else if (result.success) {
      const project = projects.find((item) => item.id === projectId);
      showToast("Ajoute a " + (project?.name || "projet"));
      const projectData = await getProjectsWithOffers();
      setProjects(projectData.projects);
      setProjectOffers(projectData.projectOffers);
    }

    setShowProjectMenu(false);
  }

  function handleCompareOffer(nextOffer: Offer) {
    const result = addOfferToCompareGroups(nextOffer);

    if (result.status === "exists") {
      showToast("Deja dans la comparaison " + result.family.label);
    } else if (result.status === "full") {
      showToast("Comparaison " + result.family.label + " deja complete");
    } else {
      showToast("Ajoute a la comparaison " + result.family.label);
    }

    router.push("/comparer");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="flex gap-4 animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <LoadingSkeleton count={3} type="simple" />
      </div>
    );
  }

  if (!offer) {
    return (
      <EmptyState
        icon="?"
        title="Offre introuvable"
        description="Cette offre n existe pas ou a ete supprimee."
        action={() => router.push("/explorer")}
        actionLabel="Retour a l Explorer"
      />
    );
  }

  const categoryIcon = getCategoryIcon(offer.category);
  const truth = getOfferTruthDescriptor(offer);
  const mimoText = generateMimo({ offer, mode: "offer" });

  const safePefas = offer.pefas ?? {};
  const pefasEntries = Object.entries(safePefas) as Array<[string, number]>;

  const bestAxis =
    pefasEntries.length > 0
      ? [...pefasEntries].sort((a, b) => Number(b[1]) - Number(a[1]))[0]
      : null;

  const worstAxis =
    pefasEntries.length > 0
      ? [...pefasEntries].sort((a, b) => Number(a[1]) - Number(b[1]))[0]
      : null;

  const safeSpecs = offer.specs ?? {};
  const specCategories = categorizeSpecs(safeSpecs);
  const hasSpecs = Object.keys(safeSpecs).length > 0;

  const journey = deriveUserJourney(projects, projectOffers);
  const activeProjectId = journey.activeProjectId || projects[0]?.id;
  const activeProject = projects.find((project) => project.id === activeProjectId) || null;
  const currentProjectOffers = activeProject ? projectOffers[activeProject.id] || [] : [];
  const alreadyInActiveProject = currentProjectOffers.some((item) => item.id === offer.id);
  const projectedOffers = alreadyInActiveProject ? currentProjectOffers : [...currentProjectOffers, offer];

  const projectedAnalysis = activeProject
    ? analyzeProject({
        projectId: activeProject.id,
        projectName: activeProject.name,
        projectCategory: activeProject.category,
        projectBudget: activeProject.budget,
        projectObjective: activeProject.objective,
        existingOffers: projectedOffers,
      })
    : null;

  const currentBestInProject = activeProject
    ? analyzeProject({
        projectId: activeProject.id,
        projectName: activeProject.name,
        projectCategory: activeProject.category,
        projectBudget: activeProject.budget,
        projectObjective: activeProject.objective,
        existingOffers: currentProjectOffers,
      }).bestOffer
    : null;

  const projectedBestOffer = projectedAnalysis?.bestOffer || null;
  const compareIds = projectedOffers.map((item) => item.id);

  const projectDecisionText = !activeProject
    ? "Creez un projet pour voir comment cette offre se comporte dans votre vrai contexte de decision."
    : alreadyInActiveProject
      ? "Cette offre est deja rattachee au projet " + activeProject.name + ". Vous pouvez maintenant l'analyser dans une comparaison contextualisee."
      : projectedBestOffer?.id === offer.id
        ? "Dans le projet " + activeProject.name + ", cette offre deviendrait le choix recommande a ce stade."
        : currentBestInProject
          ? "Cette offre enrichit le projet " + activeProject.name + ", mais " + currentBestInProject.brand + " " + currentBestInProject.product + " reste devant pour l'instant."
          : "Cette offre lancerait reellement l'analyse du projet " + activeProject.name + ".";

  return (
    <div className="space-y-4">
      <Toast message={toastMsg} />

      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Retour
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="w-24 h-24 rounded-xl bg-gray-50 flex items-center justify-center text-4xl shrink-0">
            {categoryIcon}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{offer.brand}</p>
            <h2 className="text-lg font-bold">{offer.product}</h2>
            <p className="text-xs text-gray-500">{offer.model}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">
                {offer.merchant}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">
                {offer.subcategory}
              </span>
              <DataTruthBadge label={truth.label} state={truth.state} />
            </div>
          </div>
        </div>
      </div>

      {truth.state !== "reliable" && (
        <IncompleteDataWarning
          description={
            truth.description +
            (truth.missingFields.length
              ? " Champs manquants : " + truth.missingFields.join(", ") + "."
              : "")
          }
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-extrabold">{offer.price.toLocaleString("fr-FR")} EUR</span>
            {offer.barredPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {offer.barredPrice.toLocaleString("fr-FR")} EUR
              </span>
            )}
            {offer.barredPrice && (
              <span className="text-xs font-semibold text-blue-700 ml-2">
                -{Math.round((1 - offer.price / offer.barredPrice) * 100)}%
              </span>
            )}
          </div>
          <span
            className={
              "text-xs font-semibold px-2.5 py-1 rounded-full " +
              (offer.availability === "En stock"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-700")
            }
          >
            {offer.availability}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Livraison", v: offer.delivery },
            { l: "Disponibilite", v: offer.availability },
            { l: "Garantie", v: offer.warranty },
          ].map((item) => (
            <div key={item.l} className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-[0.6rem] text-gray-400">{item.l}</p>
              <p className="text-xs font-semibold">{item.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {offer.lastUpdated && (
            <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
              Mis a jour : {offer.lastUpdated}
            </span>
          )}
          {offer.sourceUrl && (
            <a
              href={offer.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
            >
              Voir la source
            </a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <ScoreCircle score={getOfferDisplayScore(offer)} size="lg" />
          <div className="flex-1">
            <p className="font-bold">Score MAREF</p>
            <StatusBadge score={getOfferDisplayScore(offer)} />
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">
                Confiance : {offer.confidence}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">
                {offer.freshness}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-blue-50 rounded-lg p-2.5">
            <p className="text-[0.65rem] text-blue-600 font-medium">Meilleur axe</p>
            <p className="text-sm font-bold text-blue-800">
              {bestAxis ? `${PEFAS_INFO[bestAxis[0]]?.name ?? bestAxis[0]} (${bestAxis[1]})` : "Axe indisponible"}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2.5">
            <p className="text-[0.65rem] text-yellow-600 font-medium">Axe a surveiller</p>
            <p className="text-sm font-bold text-yellow-800">
              {worstAxis ? `${PEFAS_INFO[worstAxis[0]]?.name ?? worstAxis[0]} (${worstAxis[1]})` : "Axe indisponible"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-bold text-blue-700 uppercase tracking-wide">
              Decision guidee
            </p>
            <h3 className="font-bold mt-1">
              {activeProject ? "Impact sur " + activeProject.name : "Projetez cette offre dans un projet"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{projectDecisionText}</p>
          </div>
          {projectedAnalysis?.averageScore ? (
            <ScoreCircle score={projectedAnalysis.averageScore} size="sm" />
          ) : null}
        </div>

        {activeProject && projectedAnalysis && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-blue-700">{projectedOffers.length}</p>
              <p className="text-[0.65rem] text-gray-500">Offres projet</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-blue-700">{projectedAnalysis.budgetStatus}</p>
              <p className="text-[0.65rem] text-gray-500">Budget</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-blue-700">
                {projectedBestOffer?.id === offer.id ? "Oui" : "A valider"}
              </p>
              <p className="text-[0.65rem] text-gray-500">Choix recommande</p>
            </div>
          </div>
        )}

        {activeProject && projectedAnalysis && (
          <div className="relative bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-3 mt-4">
            <span className="absolute -top-2 left-3 bg-blue-700 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded">
              Mimo
            </span>
            <p className="text-xs text-gray-700 mt-2 leading-relaxed">
              {projectedAnalysis.recommendation}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          {activeProject ? (
            <button
              onClick={() => void addToProject(activeProject.id)}
              className="text-xs font-semibold bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              {alreadyInActiveProject ? "Deja dans le projet" : "Ajouter a " + activeProject.name}
            </button>
          ) : (
            <button
              onClick={() => router.push("/projets")}
              className="text-xs font-semibold bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Creer un projet
            </button>
          )}

          {activeProject && compareIds.length >= 2 && (
            <Link
              href={"/comparer?project=" + activeProject.id + "&ids=" + compareIds.join(",")}
              className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:border-blue-300 transition-colors"
            >
              Comparer dans ce projet
            </Link>
          )}

          <Link
            href="/projets"
            className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:border-blue-300 transition-colors"
          >
            Voir mes projets
          </Link>
        </div>
      </div>

      <MimoCard text={mimoText} />

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">Analyse PEFAS</h3>
        {Object.entries(PEFAS_INFO).map(([key, info]) => {
          const axisValue = safePefas[key as keyof typeof safePefas];

          return (
            <div key={key}>
              <AxisBar
                label={info.name}
                value={typeof axisValue === "number" ? axisValue : 0}
                onClick={() => setActiveAxis(activeAxis === key ? null : key)}
              />

              {activeAxis === key && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-600 mb-2">{info.desc}</p>
                  <MimoCard
                    compact
                    text={
                      "Sur l axe " +
                      info.name +
                      " (" +
                      (typeof axisValue === "number" ? axisValue : 0) +
                      "/100) : " +
                      ((typeof axisValue === "number" ? axisValue : 0) >= 75
                        ? "c est un point fort de cette offre."
                        : (typeof axisValue === "number" ? axisValue : 0) >= 55
                          ? "resultat correct mais pas exceptionnel."
                          : "c est un point faible a verifier.")
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Donnees techniques</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {Object.keys(safeSpecs).length} caracteristiques
              </p>
            </div>
            {hasSpecs && (
              <button
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {showAllSpecs ? "Reduire" : "Tout voir"}
              </button>
            )}
          </div>
        </div>

        {!hasSpecs ? (
          <div className="p-6 text-center">
            <p className="text-2xl mb-2">?</p>
            <p className="text-sm text-gray-500">
              Donnees techniques non disponibles pour ce produit.
            </p>
          </div>
        ) : (
          <div>
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Caracteristiques cles</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(safeSpecs).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="bg-white rounded-lg p-2 text-center border border-gray-100">
                    <p className="text-[0.6rem] text-gray-400">{key}</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {(showAllSpecs || activeSpecCat) && (
              <div className="divide-y divide-gray-100">
                {Object.entries(specCategories).map(([categoryName, items]) => (
                  <div key={categoryName}>
                    <button
                      onClick={() => setActiveSpecCat(activeSpecCat === categoryName ? null : categoryName)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{SPEC_ICONS[categoryName] || "[]"}</span>
                        <span className="text-sm font-semibold">{categoryName}</span>
                        <span className="text-[0.65rem] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {items.length}
                        </span>
                      </div>
                      <svg
                        className={
                          "w-4 h-4 text-gray-400 transition-transform " +
                          (activeSpecCat === categoryName ? "rotate-180" : "")
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {activeSpecCat === categoryName && (
                      <div className="px-4 pb-4">
                        {items.map(([key, value]) => {
                          const valueStr = String(value);

                          const isGood =
                            (key.includes("energetique") && (valueStr === "A" || valueStr === "B")) ||
                            (key.includes("sonore") && parseInt(valueStr, 10) <= 42) ||
                            key.includes("No Frost") ||
                            valueStr.includes("No Frost") ||
                            (key.includes("Dolby") && valueStr === "Oui") ||
                            (key === "Vapeur" && valueStr === "Oui");

                          const isBad =
                            (key.includes("energetique") && (valueStr === "F" || valueStr === "G")) ||
                            (key.includes("sonore") && parseInt(valueStr, 10) >= 55);

                          return (
                            <div
                              key={key}
                              className={
                                "flex items-center justify-between py-2 border-b border-gray-50 last:border-0 " +
                                (isGood
                                  ? "bg-blue-50/50 -mx-2 px-2 rounded"
                                  : isBad
                                    ? "bg-red-50/50 -mx-2 px-2 rounded"
                                    : "")
                              }
                            >
                              <span className="text-xs text-gray-600">{key}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-800">{valueStr}</span>
                                {isGood && <span className="text-[0.6rem]">OK</span>}
                                {isBad && <span className="text-[0.6rem]">!</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showAllSpecs && (
              <div className="p-4 border-t border-gray-100">
                <MimoCard compact text={generateSpecsMimo(safeSpecs)} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h4 className="font-bold text-sm mb-2 text-blue-700">
          Points forts ({offer.reasons.length})
        </h4>
        {(showAllReasons ? offer.reasons : offer.reasons.slice(0, 3)).map((reason, index) => (
          <div
            key={index}
            className="py-2 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-blue-600 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {reason}
          </div>
        ))}
        {offer.reasons.length > 3 && (
          <button
            onClick={() => setShowAllReasons(!showAllReasons)}
            className="text-xs font-semibold text-blue-700 mt-2 hover:underline"
          >
            {showAllReasons ? "Voir moins" : "Voir tout (" + offer.reasons.length + ")"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h4 className="font-bold text-sm mb-2 text-yellow-600">
          Points de vigilance ({offer.vigilances.length})
        </h4>
        {(showAllVigilances ? offer.vigilances : offer.vigilances.slice(0, 2)).map(
          (vigilance, index) => (
            <div
              key={index}
              className="py-2 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 text-yellow-500 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {vigilance}
            </div>
          ),
        )}
        {offer.vigilances.length > 2 && (
          <button
            onClick={() => setShowAllVigilances(!showAllVigilances)}
            className="text-xs font-semibold text-yellow-600 mt-2 hover:underline"
          >
            {showAllVigilances ? "Voir moins" : "Voir tout (" + offer.vigilances.length + ")"}
          </button>
        )}
      </div>

      <NoDataBlock
        title="Historique de prix indisponible"
        description="MAREF ne genere plus de courbe de prix simulee. Tant qu une source historique reelle n est pas disponible, cette section reste volontairement vide."
      />

      {alternatives.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Alternatives ({alternatives.length})</h3>
            <button
              onClick={() => router.push("/explorer")}
              className="text-xs font-semibold text-blue-700"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-2">
            {alternatives.map((alternative) => (
              <div
                key={alternative.id}
                onClick={() => router.push("/explorer/" + alternative.id)}
                className="bg-white rounded-xl border border-gray-200 p-3 flex gap-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-50 transition-colors">
                  {getCategoryIcon(alternative.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[0.65rem] text-gray-400 uppercase font-medium">
                        {alternative.brand}
                      </p>
                      <p className="font-semibold text-xs truncate group-hover:text-blue-700">
                        {alternative.product}
                      </p>
                    </div>
                    <ScoreCircle score={getOfferDisplayScore(alternative)} size="xs" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-xs">
                      {alternative.price.toLocaleString("fr-FR")} EUR
                    </span>
                    <span className="text-[0.6rem] text-gray-400">{alternative.merchant}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={toggleFav}
            className={
              "flex-1 text-sm font-semibold px-4 py-3 rounded-xl transition-colors " +
              (isFav
                ? "bg-blue-700 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300")
            }
          >
            {isFav ? "Sauvegardee" : "Sauvegarder"}
          </button>

          <button
            onClick={() => handleCompareOffer(offer)}
            className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            Comparer
          </button>
        </div>

        <div className="relative mt-2">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="w-full text-sm font-semibold px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-300 transition-colors"
          >
            Ajouter au projet
          </button>

          {showProjectMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)}></div>
              <div className="absolute bottom-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-scale-in">
                {projects.length === 0 ? (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-500 mb-2">Aucun projet</p>
                    <button
                      onClick={() => router.push("/projets")}
                      className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                    >
                      Creer un projet
                    </button>
                  </div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => void addToProject(project.id)}
                      className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">{project.name}</span>
                      <span className="text-xs text-gray-400 ml-1.5">{project.category}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}