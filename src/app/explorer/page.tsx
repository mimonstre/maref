"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { EmptyState, LoadingSkeleton, ScoreCircle, StatusBadge, Toast } from "@/components/shared/Score";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
import type { Offer } from "@/lib/data";
import { addOfferToCompareGroups } from "@/features/compare/store";
import { addOfferToProject, getProjectsWithOffers, type Project } from "@/features/projects/api";
import { useTimedMessage } from "@/lib/hooks/useTimedMessage";
import { recordSearchSignal } from "@/lib/core/userSignals";
import { getOfferDisplayScore, rankOffersByScore, toBaseOffer } from "@/lib/score/engine";
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
  const [loading, setLoading] = useState(false);
  const [bestBuyAvailable, setBestBuyAvailable] = useState(false);

  async function fetchBestBuyOffersLive(input: {
    category?: string | null;
    subcategory?: string | null;
    search?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (input.category) params.set("category", input.category);
    if (input.subcategory) params.set("subcategory", input.subcategory);
    if (input.search) params.set("search", input.search);
    params.set("limit", String(input.limit || 10));

    const response = await fetch("/api/bestbuy/offers?" + params.toString());
    if (!response.ok) {
      setBestBuyAvailable(false);
      return [];
    }

    const json = await response.json();
    setBestBuyAvailable(true);
    return (json.offers || []) as Offer[];
  }

  useEffect(() => {
    getOffers({}).then((data) => {
      setAllOffers(data);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getProjectsWithOffers().then((data) => {
      setProjects(data.projects);
    });
  }, [user]);

  useEffect(() => {
    if (!activeSubcategory && !search) {
      return;
    }

    async function loadFilteredOffers() {
      setLoading(true);
      const localData = await getOffers({
        category: activeCategory || undefined,
        subcategory: activeSubcategory || undefined,
        search: search || undefined,
        sort,
      });

      let nextOffers = localData;

      if (nextOffers.length === 0 && (activeSubcategory || search)) {
        const liveData = await fetchBestBuyOffersLive({
          category: activeCategory,
          subcategory: activeSubcategory,
          search,
          limit: 12,
        });
        if (liveData.length > 0) {
          nextOffers = liveData;
        }
      }

      setOffers(sort === "score" ? rankOffersByScore(nextOffers).map(toBaseOffer) : nextOffers);
      setLoading(false);
    }

    void Promise.resolve().then(loadFilteredOffers);
  }, [activeCategory, activeSubcategory, search, sort]);

  useEffect(() => {
    if (!activeCategory && !activeSubcategory && search.trim().length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const activeCategoryName = CATEGORIES.find((category) => category.id === activeCategory)?.name || null;
      const activeSubcategoryName =
        CATEGORIES.flatMap((category) => category.subs).find((subcategory) => subcategory.id === activeSubcategory)?.name || null;

      if (activeSubcategoryName) {
        recordSearchSignal({
          label: activeSubcategoryName,
          category: activeCategory,
          subcategory: activeSubcategory,
          query: search || null,
        });
        return;
      }

      if (search.trim().length >= 2) {
        recordSearchSignal({
          label: search.trim(),
          category: activeCategory,
          subcategory: activeSubcategory,
          query: search.trim(),
        });
        return;
      }

      if (activeCategoryName) {
        recordSearchSignal({
          label: activeCategoryName,
          category: activeCategory,
          subcategory: activeSubcategory,
          query: null,
        });
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [activeCategory, activeSubcategory, search]);

  const activeCat = CATEGORIES.find((category) => category.id === activeCategory);
  const merchants = [...new Set(allOffers.map((offer) => offer.merchant))];
  const brands = [...new Set(allOffers.map((offer) => offer.brand))];
  const targetProjectId = projects[0]?.id || null;
  const targetProject = projects.find((project) => project.id === targetProjectId) || null;

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (selectedBrand !== "all" && offer.brand !== selectedBrand) return false;
      if (selectedMerchant !== "all" && offer.merchant !== selectedMerchant) return false;
      if (inStockOnly && offer.availability !== "Disponible") return false;
      if (priceBand === "budget" && offer.price > 500) return false;
      if (priceBand === "mid" && (offer.price < 500 || offer.price > 1000)) return false;
      if (priceBand === "premium" && offer.price < 1000) return false;
      return true;
    });
  }, [inStockOnly, offers, priceBand, selectedBrand, selectedMerchant]);

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
      return;
    }

    showMessage("Ajout impossible pour le moment");
  }

  function handleCompareOffer(offer: Offer) {
    const result = addOfferToCompareGroups(offer);

    if (result.status === "exists") {
      showMessage("Cette offre est deja dans la comparaison " + result.family.label);
    } else if (result.status === "full") {
      showMessage("La comparaison " + result.family.label + " contient deja 3 offres");
    } else {
      showMessage("Ajoutee a la comparaison " + result.family.label);
    }
  }

  function getSubCount(subcategoryId: string) {
    return allOffers.filter((offer) => offer.subcategory === subcategoryId).length;
  }

  return (
    <div className="space-y-6">
      <Toast message={message} />

      <div className="premium-surface flex items-center gap-2 rounded-[26px] px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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
          <button onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">
            Tout
          </button>
          <span className="text-gray-300">›</span>
          <button onClick={() => setActiveSubcategory(null)} className="text-xs px-3 py-1.5 rounded-full bg-blue-950 text-white font-medium">
            {activeCat?.name}
          </button>
          {activeSubcategory && (
            <>
              <span className="text-gray-300">›</span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-blue-950 text-white font-medium">
                {activeCat?.subs.find((subcategory) => subcategory.id === activeSubcategory)?.name}
              </span>
            </>
          )}
        </div>
      )}

      {!activeCategory && !search && (
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">Catalogue</p>
              <h3 className="section-title mt-2 text-2xl font-black text-slate-950">Choisissez une famille de produits</h3>
            </div>
            <div className="rounded-[22px] bg-slate-100 px-4 py-2 text-sm font-semibold text-blue-950">Vue par familles</div>
          </div>

          <div className="space-y-3">
            {CATEGORIES.map((category) => {
              return (
                <div key={category.id} onClick={() => setActiveCategory(category.id)} className="premium-card flex cursor-pointer items-center gap-4 rounded-[28px] p-5 transition-all group hover:translate-y-[-2px]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100 text-2xl group-hover:bg-slate-200 transition-colors">{category.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-slate-950">{category.name}</h4>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {category.subs.map((subcategory) => (
                        <span key={subcategory.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] text-slate-500">
                          {subcategory.name} ({getSubCount(subcategory.id)})
                        </span>
                      ))}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-950 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {activeCategory && !activeSubcategory && !search && activeCat && (
        <div>
          <h3 className="font-bold mb-3">{activeCat.name}</h3>
          <div className="space-y-3">
            {activeCat.subs.map((subcategory) => {
              const count = getSubCount(subcategory.id);

              return (
                <div key={subcategory.id} onClick={() => setActiveSubcategory(subcategory.id)} className="premium-card flex items-center gap-3 cursor-pointer rounded-[24px] p-4 transition-all group hover:translate-y-[-2px]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-slate-100 text-xl group-hover:bg-slate-200 transition-colors">{subcategory.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-950">{subcategory.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500">{count} offres disponibles</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-950 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(activeSubcategory || search) && (
        <div>
          <div className="premium-surface mb-3 rounded-[30px] p-5">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950" value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}>
                <option value="all">Toutes les marques</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950" value={selectedMerchant} onChange={(event) => setSelectedMerchant(event.target.value)}>
                <option value="all">Tous les marchands</option>
                {merchants.map((merchant) => <option key={merchant} value={merchant}>{merchant}</option>)}
              </select>
              <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950" value={priceBand} onChange={(event) => setPriceBand(event.target.value)}>
                <option value="all">Tous les budgets</option>
                <option value="budget">Moins de 500 €</option>
                <option value="mid">500 à 1 000 €</option>
                <option value="premium">1 000 € et plus</option>
              </select>
              <button onClick={() => setInStockOnly(!inStockOnly)} className={"rounded-xl px-3 py-2 text-xs font-semibold border transition-colors " + (inStockOnly ? "bg-slate-100 border-slate-300 text-blue-950" : "bg-white border-gray-200 text-gray-600")}>
                {inStockOnly ? "Offres disponibles" : "Toutes les offres"}
              </button>
            </div>
            {bestBuyAvailable && (
              <p className="mt-3 text-xs font-medium text-blue-950">
                Résultats live Best Buy affichés pour compléter le catalogue local.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{loading ? "Chargement..." : filteredOffers.length + " résultat" + (filteredOffers.length > 1 ? "s" : "")}</p>
            <div className="flex items-center gap-2">
              <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="score">Meilleur score</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode("list")} className={"px-2 py-1.5 " + (viewMode === "list" ? "bg-slate-100 text-blue-950" : "text-gray-400")}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button onClick={() => setViewMode("grid")} className={"px-2 py-1.5 " + (viewMode === "grid" ? "bg-slate-100 text-blue-950" : "text-gray-400")}>
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
            <EmptyState icon="🔍" title="Aucun résultat" description="Essayez d élargir vos critères." action={() => { setSearch(""); setActiveSubcategory(null); }} actionLabel="Réinitialiser" />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {filteredOffers.map((offer) => (
                <div key={offer.id} onClick={() => router.push("/explorer/" + offer.id)} className="premium-card cursor-pointer rounded-[26px] p-4 transition-all group hover:translate-y-[-2px]">
                  <div className="w-full h-24 rounded-[22px] bg-slate-100 flex items-center justify-center text-3xl mb-3 group-hover:bg-slate-200 transition-colors">
                    {getCategoryIcon(offer.category)}
                  </div>
                  <p className="text-[0.68rem] text-slate-400 font-bold uppercase tracking-[0.18em]">{offer.brand}</p>
                  <p className="font-black text-sm truncate text-slate-950 group-hover:text-blue-950 transition-colors">{offer.product}</p>
                  <p className="text-[0.68rem] text-slate-400 truncate">{offer.merchant}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm">{offer.price.toLocaleString("fr-FR")} EUR</span>
                    <ScoreCircle score={getOfferDisplayScore(offer)} size="xs" />
                  </div>
                  <div className="mt-1.5"><StatusBadge score={getOfferDisplayScore(offer)} /></div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleAddToProject(offer.id);
                      }}
                      className="text-[0.7rem] font-semibold bg-slate-100 text-blue-950 px-2.5 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      {targetProject ? "Projet" : user ? "Projet" : "Connexion"}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCompareOffer(offer);
                      }}
                      className="text-[0.7rem] font-semibold bg-white border border-gray-200 text-gray-700 px-2.5 py-2 rounded-lg hover:border-slate-400 transition-colors"
                    >
                      Comparer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOffers.map((offer, index) => (
                <div key={offer.id} onClick={() => router.push("/explorer/" + offer.id)} className="premium-card flex gap-4 rounded-[28px] p-4 transition-all cursor-pointer group hover:translate-y-[-2px]">
                  <div className="relative w-16 h-16 rounded-[22px] bg-slate-100 flex items-center justify-center text-2xl shrink-0 group-hover:bg-slate-200 transition-colors">
                    {getCategoryIcon(offer.category)}
                    {index < 3 && sort === "score" && <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-blue-950 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center shadow-sm">{index + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-[0.18em]">{offer.brand}</p>
                        <p className="font-black text-base truncate text-slate-950 group-hover:text-blue-950 transition-colors">{offer.product}</p>
                      </div>
                      <ScoreCircle score={getOfferDisplayScore(offer)} size="sm" />
                    </div>
                    <p className="text-sm text-slate-500">{offer.merchant} - {offer.availability}</p>
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
                        className="text-[0.7rem] font-semibold bg-slate-100 text-blue-950 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        {targetProject ? "Ajouter au projet" : user ? "Creer un projet" : "Se connecter"}
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCompareOffer(offer);
                        }}
                        className="text-[0.7rem] font-semibold bg-white border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg hover:border-slate-400 transition-colors"
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


