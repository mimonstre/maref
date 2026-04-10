"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/data";
import { getOffers } from "@/lib/queries";
import type { Offer } from "@/lib/data";

function ScoreCircle({ score, size = "sm" }: { score: number; size?: string }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  const dim = size === "xs" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return <div className={dim + " " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"}>{score}</div>;
}

function StatusBadge({ score }: { score: number }) {
  const s =
    score >= 85 ? { l: "Excellent", c: "bg-emerald-100 text-emerald-800" }
    : score >= 72 ? { l: "Tres bon", c: "bg-emerald-50 text-emerald-700" }
    : score >= 58 ? { l: "Bon choix", c: "bg-lime-100 text-lime-700" }
    : score >= 42 ? { l: "A surveiller", c: "bg-yellow-100 text-yellow-700" }
    : score >= 25 ? { l: "Risque", c: "bg-orange-100 text-orange-700" }
    : { l: "Peu pertinent", c: "bg-red-100 text-red-700" };
  return <span className={"text-[0.65rem] font-semibold px-2 py-0.5 rounded-full " + s.c}>{s.l}</span>;
}

export default function ExplorerPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sort, setSort] = useState("score");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);

  useEffect(() => {
    getOffers({}).then((data) => setAllOffers(data));
  }, []);

  useEffect(() => {
    if (activeSubcategory || search) {
      setLoading(true);
      getOffers({
        category: activeCategory || undefined,
        subcategory: activeSubcategory || undefined,
        search: search || undefined,
        sort: sort,
      }).then((data) => {
        setOffers(data);
        setLoading(false);
      });
    }
  }, [activeCategory, activeSubcategory, search, sort]);

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  function getCatCount(catId: string) {
    return allOffers.filter((o) => o.category === catId).length;
  }
  function getSubCount(subId: string) {
    return allOffers.filter((o) => o.subcategory === subId).length;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-3 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
        <input
          type="text"
          placeholder="Produit, marque, reference, marchand..."
          className="flex-1 bg-transparent outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      {activeCategory && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">Tout</button>
          <span className="text-gray-300">›</span>
          <button onClick={() => setActiveSubcategory(null)} className="text-xs px-3 py-1.5 rounded-full bg-emerald-700 text-white font-medium">{activeCat?.name}</button>
          {activeSubcategory && (
            <>
              <span className="text-gray-300">›</span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-700 text-white font-medium">
                {activeCat?.subs.find((s) => s.id === activeSubcategory)?.name}
              </span>
            </>
          )}
        </div>
      )}

      {/* Categories */}
      {!activeCategory && !search && (
        <div>
          <h3 className="font-bold mb-3">Categories</h3>
          <div className="space-y-2.5">
            {CATEGORIES.map((c) => {
              const count = getCatCount(c.id);
              return (
                <div key={c.id} onClick={() => setActiveCategory(c.id)} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-emerald-50 transition-colors">{c.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold">{c.name}</h4>
                    <p className="text-xs text-gray-500">{c.subs.length} sous-categories · {count} offres</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {c.subs.map((s) => (
                        <span key={s.id} className="text-[0.65rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s.name}</span>
                      ))}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">{allOffers.length}</p>
              <p className="text-[0.65rem] text-gray-500">Offres totales</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">6</p>
              <p className="text-[0.65rem] text-gray-500">Marchands</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">10</p>
              <p className="text-[0.65rem] text-gray-500">Marques</p>
            </div>
          </div>
        </div>
      )}

      {/* Subcategories */}
      {activeCategory && !activeSubcategory && !search && activeCat && (
        <div>
          <h3 className="font-bold mb-3">{activeCat.name}</h3>
          <div className="space-y-2.5">
            {activeCat.subs.map((s) => {
              const count = getSubCount(s.id);
              return (
                <div key={s.id} onClick={() => setActiveSubcategory(s.id)} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-colors">{s.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{s.name}</h4>
                    <p className="text-xs text-gray-500">{count} offres disponibles</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              );
            })}
          </div>

          {/* Mimo suggestion */}
          <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm mt-4">
            <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
            <p className="text-sm text-gray-800 mt-2">Selectionnez une sous-categorie pour voir les offres analysees. Chaque offre est evaluee selon les 5 axes PEFAS adaptes a votre profil.</p>
          </div>
        </div>
      )}

      {/* Results */}
      {(activeSubcategory || search) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">
              {loading ? "Chargement..." : offers.length + " resultat" + (offers.length > 1 ? "s" : "")}
            </p>
            <div className="flex items-center gap-2">
              <select className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="score">Meilleur score</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix decroissant</option>
              </select>
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("list")} className={"px-2 py-1.5 " + (viewMode === "list" ? "bg-emerald-50 text-emerald-700" : "text-gray-400")}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                </button>
                <button onClick={() => setViewMode("grid")} className={"px-2 py-1.5 " + (viewMode === "grid" ? "bg-emerald-50 text-emerald-700" : "text-gray-400")}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-3.5 animate-pulse">
                  <div className={viewMode === "grid" ? "h-20 bg-gray-200 rounded-lg mb-2" : "flex gap-3"}>
                    {viewMode === "list" && <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0"></div>}
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">🔍</p>
              <h3 className="font-bold text-gray-600 mb-1">Aucun resultat</h3>
              <p className="text-sm text-gray-400 mb-4">Essayez d elargir vos criteres.</p>
              <button onClick={() => { setSearch(""); setActiveSubcategory(null); }} className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                Reinitialiser
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-2.5">
              {offers.map((o) => (
                <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group">
                  <div className="w-full h-20 rounded-lg bg-gray-50 flex items-center justify-center text-3xl mb-2 group-hover:bg-emerald-50 transition-colors">
                    {o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}
                  </div>
                  <p className="text-[0.65rem] text-gray-400 font-medium uppercase">{o.brand}</p>
                  <p className="font-semibold text-xs truncate group-hover:text-emerald-700 transition-colors">{o.product}</p>
                  <p className="text-[0.65rem] text-gray-400 truncate">{o.merchant}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm">{o.price.toLocaleString("fr-FR")} EUR</span>
                    <ScoreCircle score={o.score} size="xs" />
                  </div>
                  <div className="mt-1.5"><StatusBadge score={o.score} /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {offers.map((o, i) => (
                <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group">
                  <div className="relative w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-emerald-50 transition-colors">
                    {o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}
                    {i < 3 && sort === "score" && (
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-700 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center shadow-sm">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p>
                        <p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{o.product}</p>
                      </div>
                      <ScoreCircle score={o.score} />
                    </div>
                    <p className="text-xs text-gray-400">{o.merchant} · {o.availability}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <span className="font-bold">{o.price.toLocaleString("fr-FR")} EUR</span>
                        {o.barredPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{o.barredPrice.toLocaleString("fr-FR")} EUR</span>}
                      </div>
                      <StatusBadge score={o.score} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{o.mimoShort}</p>
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