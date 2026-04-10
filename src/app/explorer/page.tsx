"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/data";
import { getOffers } from "@/lib/queries";
import type { Offer } from "@/lib/data";

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  return (
    <div className={"w-10 h-10 text-sm " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0"}>
      {score}
    </div>
  );
}

function StatusBadge({ score }: { score: number }) {
  const s =
    score >= 85 ? { l: "Excellent choix", c: "bg-emerald-100 text-emerald-800" }
    : score >= 72 ? { l: "Tres bon choix", c: "bg-emerald-50 text-emerald-700" }
    : score >= 58 ? { l: "Bon choix", c: "bg-lime-100 text-lime-700" }
    : score >= 42 ? { l: "A surveiller", c: "bg-yellow-100 text-yellow-700" }
    : score >= 25 ? { l: "Risque", c: "bg-orange-100 text-orange-700" }
    : { l: "Peu pertinent", c: "bg-red-100 text-red-700" };
  return <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + s.c}>{s.l}</span>;
}

export default function ExplorerPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sort, setSort] = useState("score");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
        <input
          type="text"
          placeholder="Rechercher un produit, une marque..."
          className="flex-1 bg-transparent outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>

      {activeCategory && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">Tout</button>
          <span className="text-gray-300">›</span>
          <button onClick={() => setActiveSubcategory(null)} className="text-xs px-3 py-1 rounded-full bg-emerald-700 text-white font-medium">{activeCat?.name}</button>
          {activeSubcategory && (
            <>
              <span className="text-gray-300">›</span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-700 text-white font-medium">
                {activeCat?.subs.find((s) => s.id === activeSubcategory)?.name}
              </span>
            </>
          )}
        </div>
      )}

      {!activeCategory && !search && (
        <div>
          <h3 className="font-bold text-sm mb-3">Categories</h3>
          {CATEGORIES.map((c) => (
            <div key={c.id} onClick={() => setActiveCategory(c.id)} className="bg-white rounded-xl border border-gray-200 p-4 mb-2.5 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{c.name}</h4>
                <p className="text-xs text-gray-500">{c.subs.length} sous-categories · {c.count} offres</p>
              </div>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          ))}
        </div>
      )}

      {activeCategory && !activeSubcategory && !search && activeCat && (
        <div>
          <h3 className="font-bold text-sm mb-3">{activeCat.name}</h3>
          {activeCat.subs.map((s) => (
            <div key={s.id} onClick={() => setActiveSubcategory(s.id)} className="bg-white rounded-xl border border-gray-200 p-4 mb-2.5 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all">
              <span className="text-xl">{s.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{s.name}</h4>
                <p className="text-xs text-gray-500">{s.count} offres</p>
              </div>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          ))}
        </div>
      )}

      {(activeSubcategory || search) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              {loading ? "Chargement..." : offers.length + " resultats"}
            </p>
            <select className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="score">Meilleur score</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix decroissant</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 animate-pulse">
                  <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🔍</p>
              <h3 className="font-bold text-gray-600 mb-1">Aucun resultat</h3>
              <p className="text-sm text-gray-400">Essayez d elargir vos criteres.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {offers.map((o) => (
                <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                    {o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p>
                    <p className="font-semibold text-sm truncate">{o.product}</p>
                    <p className="text-xs text-gray-400">{o.merchant} · {o.availability}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <span className="font-bold">{o.price.toLocaleString("fr-FR")} EUR</span>
                        {o.barredPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{o.barredPrice.toLocaleString("fr-FR")} EUR</span>}
                      </div>
                      <ScoreCircle score={o.score} />
                    </div>
                    <div className="mt-1"><StatusBadge score={o.score} /></div>
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