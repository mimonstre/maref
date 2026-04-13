"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppBreadcrumbs from "@/components/shared/AppBreadcrumbs";
import { EmptyState, LoadingSkeleton, Toast } from "@/components/shared/Score";
import ProductCard from "@/features/explorer/components/ProductCard";
import { CATEGORIES } from "@/lib/categories";
import { recordSearchSignal } from "@/lib/core/userSignals";
import { useTimedMessage } from "@/lib/hooks/useTimedMessage";
import { useExplorerCatalog } from "@/lib/hooks/useExplorerCatalog";

export default function ExplorerPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = useTimedMessage();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState<string | null>(() => searchParams.get("category"));
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(() => searchParams.get("subcategory"));
  const [sort, setSort] = useState("score");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState("all");
  const [priceBand, setPriceBand] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  const { allOffers, filteredOffers, products, brands, merchants, loading, bestBuyAvailable } = useExplorerCatalog({
    category: activeCategory,
    subcategory: activeSubcategory,
    search,
    sort,
    selectedBrand,
    selectedMerchant,
    priceBand,
    inStockOnly,
  });

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

  const countsBySubcategory = useMemo(() => {
    return allOffers.reduce<Record<string, number>>((accumulator, offer) => {
      accumulator[offer.subcategory] = (accumulator[offer.subcategory] || 0) + 1;
      return accumulator;
    }, {});
  }, [allOffers]);

  function resetFamilySelection() {
    setActiveCategory(null);
    setActiveSubcategory(null);
  }

  function buildExplorerHref(category?: string | null, subcategory?: string | null) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (subcategory) params.set("subcategory", subcategory);
    if (search.trim()) params.set("q", search.trim());
    const query = params.toString();
    return query ? `/explorer?${query}` : "/explorer";
  }

  function openProduct(productKey: string) {
    const product = products.find((item) => item.key === productKey);
    if (!product) return;
    router.push(
      `/explorer/${product.bestOffer.id}?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`,
    );
  }

  return (
    <div className="space-y-6">
      <Toast message={message} />

      <section className="premium-hero rounded-[32px] px-6 py-7 text-white md:px-8 md:py-8">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100">
              Explorer
            </p>
            <h1 className="section-title mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Choisir un produit proprement, avant de comparer les offres.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100/90 md:text-base">
              Commencez par une famille, entrez dans une sous-catégorie, puis ouvrez une fiche produit pour voir les offres marchandes réellement comparables.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-blue-100/75">Familles</p>
              <p className="mt-2 text-3xl font-black">{CATEGORIES.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-blue-100/75">Catalogue visible</p>
              <p className="mt-2 text-3xl font-black">{products.length}</p>
            </div>
          </div>
        </div>
      </section>

      <AppBreadcrumbs
        items={[
          { label: "Explorer", onClick: resetFamilySelection, current: !activeCategory && !activeSubcategory && !search },
          ...(activeCategory
            ? [
                {
                  label: activeCat?.name || "Famille",
                  href: buildExplorerHref(activeCategory, null),
                  current: !activeSubcategory,
                },
              ]
            : []),
          ...(activeSubcategory
            ? [
                {
                  label:
                    activeCat?.subs.find((subcategory) => subcategory.id === activeSubcategory)?.name || "Sous-catégorie",
                  current: true,
                },
              ]
            : []),
        ]}
      />

      <div className="premium-surface flex items-center gap-2 rounded-[26px] px-4 py-3.5 transition-all focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100/70">
        <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Produit, marque, référence, marchand..."
          className="flex-1 bg-transparent text-sm outline-none"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 transition-colors hover:text-slate-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {!activeCategory && !search && (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">Catalogue</p>
              <h3 className="section-title mt-2 text-2xl font-black text-slate-950">Choisissez une famille de produits</h3>
            </div>
            <div className="rounded-[22px] bg-slate-100 px-4 py-2 text-sm font-semibold text-blue-950">Vue par familles</div>
          </div>

          <div className="space-y-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="premium-card group flex w-full items-center gap-4 rounded-[30px] p-5 text-left transition-all hover:translate-y-[-2px] hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 text-2xl transition-colors group-hover:from-blue-50 group-hover:to-slate-100">
                  {category.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-black text-slate-950">{category.name}</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {category.subs.map((subcategory) => (
                      <span key={subcategory.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] text-slate-500">
                        {subcategory.name} ({countsBySubcategory[subcategory.id] || 0})
                      </span>
                    ))}
                  </div>
                </div>
                <svg className="h-5 w-5 text-slate-300 transition-colors group-hover:text-blue-950" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCategory && !activeSubcategory && !search && activeCat && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-950">{activeCat.name}</h3>
          {activeCat.subs.map((subcategory) => {
            const count = countsBySubcategory[subcategory.id] || 0;

            return (
              <button
                key={subcategory.id}
                onClick={() => setActiveSubcategory(subcategory.id)}
                className="premium-card group flex w-full items-center gap-3 rounded-[26px] p-4 text-left transition-all hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(15,23,42,0.10)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-slate-100 to-slate-200 text-xl transition-colors group-hover:from-blue-50 group-hover:to-slate-100">
                  {subcategory.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-950">{subcategory.name}</h4>
                  <p className="text-xs text-slate-500">{count} produits référencés</p>
                </div>
                <svg className="h-5 w-5 text-slate-300 transition-colors group-hover:text-blue-950" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {(activeSubcategory || search) && (
        <div>
          <div className="premium-surface mb-3 rounded-[30px] p-5">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950"
                value={selectedBrand}
                onChange={(event) => setSelectedBrand(event.target.value)}
              >
                <option value="all">Toutes les marques</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950"
                value={selectedMerchant}
                onChange={(event) => setSelectedMerchant(event.target.value)}
              >
                <option value="all">Tous les marchands</option>
                {merchants.map((merchant) => (
                  <option key={merchant} value={merchant}>
                    {merchant}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950"
                value={priceBand}
                onChange={(event) => setPriceBand(event.target.value)}
              >
                <option value="all">Tous les budgets</option>
                <option value="budget">Moins de 500 €</option>
                <option value="mid">500 à 1 000 €</option>
                <option value="premium">1 000 € et plus</option>
              </select>
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors " +
                  (inStockOnly ? "border-slate-300 bg-slate-100 text-blue-950" : "border-slate-200 bg-white text-slate-600")
                }
              >
                {inStockOnly ? "Offres disponibles" : "Toutes les offres"}
              </button>
            </div>
            {bestBuyAvailable && (
              <p className="mt-3 text-xs font-medium text-blue-950">
                Résultats live Best Buy affichés pour compléter le catalogue local.
              </p>
            )}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">
              {loading ? "Chargement..." : `${products.length} produit${products.length > 1 ? "s" : ""}`}
            </p>
            <div className="flex items-center gap-2">
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-950"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="score">Meilleurs signaux</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  onClick={() => setViewMode("list")}
                  className={"px-2 py-1.5 " + (viewMode === "list" ? "bg-slate-100 text-blue-950" : "text-slate-400")}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={"px-2 py-1.5 " + (viewMode === "grid" ? "bg-slate-100 text-blue-950" : "text-slate-400")}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Aucun résultat"
              description="Élargissez vos filtres ou changez de sous-catégorie."
              action={() => {
                setSearch("");
                setActiveSubcategory(null);
              }}
              actionLabel="Réinitialiser"
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.key}
                  product={product}
                  href={`/explorer/${product.bestOffer.id}?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`}
                  mode="grid"
                  onOpen={() => void openProduct(product.key)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <ProductCard
                  key={product.key}
                  product={product}
                  href={`/explorer/${product.bestOffer.id}?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`}
                  rank={sort === "score" ? index + 1 : null}
                  onOpen={() => void openProduct(product.key)}
                />
              ))}
            </div>
          )}

          {!loading && filteredOffers.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Chaque carte regroupe un produit. Les offres marchandes détaillées, les prix et les scores MAREF s&apos;affichent dans la fiche produit.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
