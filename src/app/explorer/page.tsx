"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { ScoreCircle, StatusBadge, MimoCard, EmptyState, LoadingSkeleton, Toast } from "@/components/shared/Score";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
import { deriveUserJourney } from "@/lib/core";
import type { Offer } from "@/lib/data";
import { addOfferToProject, getProjectsWithOffers, type Project } from "@/features/projects/api";
import { useTimedMessage } from "@/lib/hooks/useTimedMessage";
import { generateMimo } from "@/lib/mimo/engine";
import { averageOfferScore, getOfferDisplayScore, rankOffersByScore, toBaseOffer } from "@/lib/score/engine";
import { getOffers } from "@/lib/queries";

export default function ExplorerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { message, showMessage } = useTimedMessage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sort, setSort] = useState("score");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState("all");
  const [priceBand, setPriceBand] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, Offer[]>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    getOffers({}).then((data) => {
      setAllOffers(data);
      setInitialLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getProjectsWithOffers().then((data) => {
      setProjects(data.projects);
      setProjectOffers(data.projectOffers);
    });
  }, [user]);

  useEffect(() => {
    if (activeSubcategory || search) {
      async function loadFilteredOffers() {
        setLoading(true);
        const data = await getOffers({
          category: activeCategory || undefined,
          subcategory: activeSubcategory || undefined,
          search: search || undefined,
          sort,
        });
        setOffers(sort === "score" ? rankOffersByScore(data).map(toBaseOffer) : data);
        setLoading(false);
      }

      void Promise.resolve().then(loadFilteredOffers);
    }
  }, [activeCategory, activeSubcategory, search, sort]);

  const activeCat = CATEGORIES.find((category) => category.id === activeCategory);
  const journey = deriveUserJourney(projects, projectOffers);
  const merchants = [...new Set(allOffers.map((offer) => offer.merchant))];
  const brands = [...new Set(allOffers.map((offer) => offer.brand))];
  const targetProjectId = journey.activeProjectId || projects[0]?.id || null;
  const targetProject = projects.find((project) => project.id === targetProjectId) || null;

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (selectedBrand !== "all" && offer.brand !== selectedBrand) return false;
      if (selectedMerchant !== "all" && offer.merchant !== selectedMerchant) return false;
      if (inStockOnly && offer.availability !== "En stock") return false;
      if (priceBand === "budget" && offer.price > 500) return false;
      if (priceBand === "mid" && (offer.price < 500 || offer.price > 1000)) return false;
      if (priceBand === "premium" && offer.price < 1000) return false;
      return true;
    });
  }, [inStockOnly, offers, priceBand, selectedBrand, selectedMerchant]);

  const topSuggestion = filteredOffers[0] || null;

  async function handleAddToProject(offerId: string) {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!targetProjectId) {
      router.push("/projets");
      return;
    }

    const result = await addOfferToProject(targetProjectId, offerId);

    if (!result.success && result.reason === "exists") {
      showMessage("Offre deja presente dans " + (targetProject?.name || "le projet"));
      return;
    }

    if (result.success) {
      showMessage("Ajoutee a " + (targetProject?.name || "votre projet"));
      const data = await getProjectsWithOffers();
      setProjects(data.projects);
      setProjectOffers(data.projectOffers);
      return;
    }

    showMessage("Ajout impossible pour le moment");
  }

  function getCatCount(categoryId: string) {
    return allOffers.filter((offer) => offer.category === categoryId).length;
  }

  function getSubCount(subcategoryId: string) {
    return allOffers.filter((offer) => offer.subcategory === subcategoryId).length;
  }

  function getCatAvgScore(categoryId: string) {
    const categoryOffers = allOffers.filter((offer) => offer.category === categoryId);
    return averageOfferScore(categoryOffers);
  }

  function getSubAvgScore(subcategoryId: string) {
    const subcategoryOffers = allOffers.filter((offer) => offer.subcategory === subcategoryId);
    return averageOfferScore(subcategoryOffers);
  }

  const explorerMimo = activeCategory && !activeSubcategory && !search && activeCat
    ? "La categorie " + activeCat.name + " contient " + getCatCount(activeCat.id) + " offres analysees avec un score moyen de " + getCatAvgScore(activeCat.id) + "/100. Selectionnez une sous-categorie pour voir les offres detaillees."
    : filteredOffers.length > 0
      ? generateMimo({ mode: "explorer", comparison: filteredOffers.slice(0, 5) })
      : "Explorez les categories pour faire ressortir les meilleures options selon vos criteres.";

  return (
    <div className="space-y-4">
      <Toast message={message} />
      {user && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-bold text-emerald-700 uppercase tracking-wide">Guidage MAREF</p>
              <h3 className="font-bold mt-1">{journey.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{journey.description}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              {journey.progress}/5
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">{journey.hint}</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Link href={journey.primaryAction.href} className="text-xs font-semibold bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
              {journey.primaryAction.label}
            </Link>
            {journey.secondaryAction && (
              <Link href={journey.secondaryAction.href} className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-300 transition-colors">
                {journey.secondaryAction.label}
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-3 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Produit, marque, reference, marchand..."
          className="flex-1 bg-transparent outline-none text-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {activeCategory && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">Tout</button>
          <span className="text-gray-300">â€º</span>
          <button onClick={() => setActiveSubcategory(null)} className="text-xs px-3 py-1.5 rounded-full bg-emerald-700 text-white font-medium">{activeCat?.name}</button>
          {activeSubcategory && (
            <>
              <span className="text-gray-300">â€º</span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-700 text-white font-medium">{activeCat?.subs.find((subcategory) => subcategory.id === activeSubcategory)?.name}</span>
            </>
          )}
        </div>
      )}

      {!activeCategory && !search && (
        <div>
          <h3 className="font-bold mb-3">Categories</h3>
          <div className="space-y-2.5">
            {CATEGORIES.map((category) => {
              const count = getCatCount(category.id);
              const avg = getCatAvgScore(category.id);

              return (
                <div key={category.id} onClick={() => setActiveCategory(category.id)} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-emerald-50 transition-colors">{category.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{category.name}</h4>
                      {avg > 0 && <ScoreCircle score={avg} size="xs" />}
                    </div>
                    <p className="text-xs text-gray-500">{category.subs.length} sous-categories Â· {count} offres</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {category.subs.map((subcategory) => (
                        <span key={subcategory.id} className="text-[0.65rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {subcategory.name} ({getSubCount(subcategory.id)})
                        </span>
                      ))}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>

          {initialLoaded && (
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">{allOffers.length}</p>
                <p className="text-[0.65rem] text-gray-500">Offres totales</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">{merchants.length}</p>
                <p className="text-[0.65rem] text-gray-500">Marchands</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">{brands.length}</p>
                <p className="text-[0.65rem] text-gray-500">Marques</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCategory && !activeSubcategory && !search && activeCat && (
        <div>
          <h3 className="font-bold mb-3">{activeCat.name}</h3>
          <div className="space-y-2.5">
            {activeCat.subs.map((subcategory) => {
              const count = getSubCount(subcategory.id);
              const avg = getSubAvgScore(subcategory.id);

              return (
                <div key={subcategory.id} onClick={() => setActiveSubcategory(subcategory.id)} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-colors">{subcategory.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{subcategory.name}</h4>
                      {avg > 0 && <ScoreCircle score={avg} size="xs" />}
                    </div>
                    <p className="text-xs text-gray-500">{count} offres disponibles Â· Score moy. {avg}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>
          <MimoCard text={explorerMimo} />
        </div>
      )}

      {(activeSubcategory || search) && (
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-bold text-emerald-700 uppercase tracking-wide">Explorer premium</p>
                <h3 className="font-bold mt-1">
                  {targetProject ? "Suggestions pour " + targetProject.name : "Suggestions les plus pertinentes"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {targetProject
                    ? "Ajoutez directement les offres a votre projet pour alimenter la comparaison contextualisee."
                    : "Affinez la recherche puis structurez votre decision dans un projet."}
                </p>
              </div>
              {topSuggestion && <ScoreCircle score={getOfferDisplayScore(topSuggestion)} size="sm" />}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
              <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}>
                <option value="all">Toutes les marques</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" value={selectedMerchant} onChange={(event) => setSelectedMerchant(event.target.value)}>
                <option value="all">Tous les marchands</option>
                {merchants.map((merchant) => <option key={merchant} value={merchant}>{merchant}</option>)}
              </select>
              <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" value={priceBand} onChange={(event) => setPriceBand(event.target.value)}>
                <option value="all">Tous les budgets</option>
                <option value="budget">Moins de 500 EUR</option>
                <option value="mid">500 a 1 000 EUR</option>
                <option value="premium">1 000 EUR et plus</option>
              </select>
              <button onClick={() => setInStockOnly(!inStockOnly)} className={"text-xs font-semibold rounded-lg px-3 py-2 border transition-colors " + (inStockOnly ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-gray-50 border-gray-200 text-gray-600")}>
                {inStockOnly ? "En stock uniquement" : "Inclure toutes disponibilites"}
              </button>
            </div>
            {topSuggestion && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <div>
                  <p className="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wide">Meilleure option visible</p>
                  <p className="text-sm font-bold text-emerald-950 mt-1">{topSuggestion.brand} {topSuggestion.product}</p>
                  <p className="text-xs text-emerald-800 mt-1">{topSuggestion.merchant} · {topSuggestion.price.toLocaleString("fr-FR")} EUR</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <button onClick={() => router.push("/explorer/" + topSuggestion.id)} className="text-xs font-semibold bg-white border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                    Voir la fiche
                  </button>
                  <button onClick={() => void handleAddToProject(topSuggestion.id)} className="text-xs font-semibold bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
                    {targetProject ? "Ajouter au projet" : user ? "Creer un projet d abord" : "Se connecter"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{loading ? "Chargement..." : filteredOffers.length + " resultat" + (filteredOffers.length > 1 ? "s" : "")}</p>
            <div className="flex items-center gap-2">
              <select className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="score">Meilleur score</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix decroissant</option>
              </select>
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("list")} className={"px-2 py-1.5 " + (viewMode === "list" ? "bg-emerald-50 text-emerald-700" : "text-gray-400")}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button onClick={() => setViewMode("grid")} className={"px-2 py-1.5 " + (viewMode === "grid" ? "bg-emerald-50 text-emerald-700" : "text-gray-400")}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={4} />
          ) : filteredOffers.length === 0 ? (
            <EmptyState icon="ðŸ”" title="Aucun resultat" description="Essayez d elargir vos criteres." action={() => { setSearch(""); setActiveSubcategory(null); }} actionLabel="Reinitialiser" />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredOffers.map((offer) => (
                <div key={offer.id} onClick={() => router.push("/explorer/" + offer.id)} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group">
                  <div className="w-full h-20 rounded-lg bg-gray-50 flex items-center justify-center text-3xl mb-2 group-hover:bg-emerald-50 transition-colors">
                    {getCategoryIcon(offer.category)}
                  </div>
                  <p className="text-[0.65rem] text-gray-400 font-medium uppercase">{offer.brand}</p>
                  <p className="font-semibold text-xs truncate group-hover:text-emerald-700 transition-colors">{offer.product}</p>
                  <p className="text-[0.65rem] text-gray-400 truncate">{offer.merchant}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm">{offer.price.toLocaleString("fr-FR")} EUR</span>
                    <ScoreCircle score={getOfferDisplayScore(offer)} size="xs" />
                  </div>
                  <div className="mt-1.5"><StatusBadge score={getOfferDisplayScore(offer)} /></div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleAddToProject(offer.id);
                    }}
                    className="w-full mt-2 text-[0.7rem] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    {targetProject ? "Ajouter au projet" : user ? "Creer un projet" : "Se connecter"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              <MimoCard text={explorerMimo} />
              {filteredOffers.map((offer, index) => (
                <div key={offer.id} onClick={() => router.push("/explorer/" + offer.id)} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group">
                  <div className="relative w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-emerald-50 transition-colors">
                    {getCategoryIcon(offer.category)}
                    {index < 3 && sort === "score" && <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-700 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center shadow-sm">{index + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{offer.brand}</p>
                        <p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{offer.product}</p>
                      </div>
                      <ScoreCircle score={getOfferDisplayScore(offer)} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">{offer.merchant} Â· {offer.availability}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <span className="font-bold">{offer.price.toLocaleString("fr-FR")} EUR</span>
                        {offer.barredPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{offer.barredPrice.toLocaleString("fr-FR")} EUR</span>}
                      </div>
                      <StatusBadge score={getOfferDisplayScore(offer)} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{offer.mimoShort}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleAddToProject(offer.id);
                        }}
                        className="text-[0.7rem] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        {targetProject ? "Ajouter au projet" : user ? "Creer un projet" : "Se connecter"}
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push("/comparer?ids=" + offer.id);
                        }}
                        className="text-[0.7rem] font-semibold bg-white border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg hover:border-emerald-300 transition-colors"
                      >
                        Comparer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
