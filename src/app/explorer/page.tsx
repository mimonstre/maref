"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOffers } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/lib/data";
import { ScoreCircle, StatusBadge, MimoCard, EmptyState, LoadingSkeleton } from "@/components/shared/Score";

const CATEGORIES = [
  {
    id: "electromenager", name: "Electromenager", icon: "🏠",
    subs: [
      { id: "lavage", name: "Lavage", icon: "🫧" },
      { id: "vaisselle", name: "Vaisselle", icon: "🍽" },
    ],
  },
  {
    id: "froid", name: "Froid", icon: "❄️",
    subs: [
      { id: "refrigerateurs", name: "Refrigerateurs", icon: "🧊" },
      { id: "congelation", name: "Congelation", icon: "🥶" },
      { id: "multidoor", name: "Multidoor / americain", icon: "🚪" },
    ],
  },
  {
    id: "televiseurs", name: "Televiseurs", icon: "📺",
    subs: [
      { id: "technologie", name: "Technologie", icon: "💡" },
      { id: "taille", name: "Taille", icon: "📐" },
      { id: "usage-tv", name: "Usage", icon: "🎮" },
    ],
  },
];

export default function ExplorerPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sort, setSort] = useState("score");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    getOffers({}).then((data) => { setAllOffers(data); setInitialLoaded(true); });
  }, []);

  useEffect(() => {
    if (activeSubcategory || search) {
      setLoading(true);
      getOffers({
        category: activeCategory || undefined,
        subcategory: activeSubcategory || undefined,
        search: search || undefined,
        sort,
      }).then((data) => { setOffers(data); setLoading(false); });
    }
  }, [activeCategory, activeSubcategory, search, sort]);

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  function getCatCount(catId: string) { return allOffers.filter((o) => o.category === catId).length; }
  function getSubCount(subId: string) { return allOffers.filter((o) => o.subcategory === subId).length; }
  function getCatAvgScore(catId: string) {
    const cat = allOffers.filter((o) => o.category === catId);
    return cat.length > 0 ? Math.round(cat.reduce((s, o) => s + o.score, 0) / cat.length) : 0;
  }
  function getSubAvgScore(subId: string) {
    const sub = allOffers.filter((o) => o.subcategory === subId);
    return sub.length > 0 ? Math.round(sub.reduce((s, o) => s + o.score, 0) / sub.length) : 0;
  }

  const merchants = [...new Set(allOffers.map((o) => o.merchant))];
  const brands = [...new Set(allOffers.map((o) => o.brand))];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-3 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
        <input type="text" placeholder="Produit, marque, reference, marchand..." className="flex-1 bg-transparent outline-none text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-700 text-white font-medium">{activeCat?.subs.find((s) => s.id === activeSubcategory)?.name}</span>
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
              const avg = getCatAvgScore(c.id);
              return (
                <div key={c.id} onClick={() => setActiveCategory(c.id)} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-emerald-50 transition-colors">{c.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{c.name}</h4>
                      {avg > 0 && <ScoreCircle score={avg} size="xs" />}
                    </div>
                    <p className="text-xs text-gray-500">{c.subs.length} sous-categories · {count} offres</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {c.subs.map((s) => (
                        <span key={s.id} className="text-[0.65rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s.name} ({getSubCount(s.id)})</span>
                      ))}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              );
            })}
          </div>

          {/* Quick stats */}
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

      {/* Subcategories */}
      {activeCategory && !activeSubcategory && !search && activeCat && (
        <div>
          <h3 className="font-bold mb-3">{activeCat.name}</h3>
          <div className="space-y-2.5">
            {activeCat.subs.map((s) => {
              const count = getSubCount(s.id);
              const avg = getSubAvgScore(s.id);
              return (
                <div key={s.id} onClick={() => setActiveSubcategory(s.id)} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-colors">{s.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{s.name}</h4>
                      {avg > 0 && <ScoreCircle score={avg} size="xs" />}
                    </div>
                    <p className="text-xs text-gray-500">{count} offres disponibles · Score moy. {avg}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              );
            })}
          </div>
          <MimoCard text={"La categorie " + activeCat.name + " contient " + getCatCount(activeCat.id) + " offres analysees avec un score moyen de " + getCatAvgScore(activeCat.id) + "/100. Selectionnez une sous-categorie pour voir les offres detaillees."} />
        </div>
      )}

      {/* Results */}
      {(activeSubcategory || search) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{loading ? "Chargement..." : offers.length + " resultat" + (offers.length > 1 ? "s" : "")}</p>
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
            <LoadingSkeleton count={4} />
          ) : offers.length === 0 ? (
            <EmptyState icon="🔍" title="Aucun resultat" description="Essayez d elargir vos criteres." action={() => { setSearch(""); setActiveSubcategory(null); }} actionLabel="Reinitialiser" />
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
                    {i < 3 && sort === "score" && <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-700 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center shadow-sm">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div><p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p><p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{o.product}</p></div>
                      <ScoreCircle score={o.score} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">{o.merchant} · {o.availability}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div><span className="font-bold">{o.price.toLocaleString("fr-FR")} EUR</span>{o.barredPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{o.barredPrice.toLocaleString("fr-FR")} EUR</span>}</div>
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