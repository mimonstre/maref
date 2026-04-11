"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOffers, getOfferById } from "@/lib/queries";
import type { Offer } from "@/lib/data";
import { ScoreCircle, StatusBadge, AxisBar, MimoCard, EmptyState, LoadingSkeleton } from "@/components/shared/Score";

const PEFAS_LABELS: Record<string, string> = { P: "Pertinence", E: "Economie", F: "Fluidite", A: "Assurance", S: "Stabilite" };

export default function ComparerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getOffers({});
      setAllOffers(data);

      // Pre-fill from URL params
      const ids = searchParams.get("ids");
      if (ids) {
        const idList = ids.split(",").filter(Boolean);
        setSelected(idList.slice(0, 3));
      }
      setLoading(false);
    }
    load();
  }, [searchParams]);

  const selectedOffers = selected.map((id) => allOffers.find((o) => o.id === id)).filter(Boolean) as Offer[];
  const best = selectedOffers.length >= 2 ? selectedOffers.reduce((a, b) => (a.score > b.score ? a : b)) : null;
  const worst = selectedOffers.length >= 2 ? selectedOffers.reduce((a, b) => (a.score < b.score ? a : b)) : null;

  const filtered = search
    ? allOffers.filter((o) => !selected.includes(o.id) && (o.product.toLowerCase().includes(search.toLowerCase()) || o.brand.toLowerCase().includes(search.toLowerCase()) || o.merchant.toLowerCase().includes(search.toLowerCase())))
    : [];

  function generateCompareMimo(): string {
    if (selectedOffers.length < 2 || !best || !worst) return "Ajoutez au moins 2 offres pour obtenir une analyse comparative.";

    const priceDiff = Math.abs(best.price - worst.price);
    const scoreDiff = best.score - worst.score;

    let text = "Comparaison de " + selectedOffers.length + " offres. ";
    text += "Le " + best.brand + " " + best.product + " se distingue avec un score de " + best.score + "/100";

    if (scoreDiff > 15) {
      text += ", nettement superieur aux autres options. ";
    } else if (scoreDiff > 5) {
      text += ", legerement au-dessus. ";
    } else {
      text += ". Les scores sont tres proches — la decision depend de vos priorites. ";
    }

    // Find which axis differs the most
    let maxAxisDiff = 0;
    let maxAxisKey = "P";
    Object.keys(PEFAS_LABELS).forEach((key) => {
      const vals = selectedOffers.map((o) => o.pefas[key as keyof typeof o.pefas]);
      const diff = Math.max(...vals) - Math.min(...vals);
      if (diff > maxAxisDiff) { maxAxisDiff = diff; maxAxisKey = key; }
    });

    if (maxAxisDiff > 20) {
      text += "La plus grande difference se situe sur l axe " + PEFAS_LABELS[maxAxisKey] + " (ecart de " + maxAxisDiff + " points). ";
    }

    if (priceDiff > 100) {
      text += "L ecart de prix est de " + priceDiff.toLocaleString("fr-FR") + " EUR — verifiez si la difference de score justifie cet ecart.";
    } else {
      text += "Les prix sont proches, donc privilegiez le meilleur score global.";
    }

    return text;
  }

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Comparaison</h2>
        <p className="text-sm text-gray-500">{selectedOffers.length} offre{selectedOffers.length > 1 ? "s" : ""} selectionnee{selectedOffers.length > 1 ? "s" : ""}</p>
      </div>

      {/* Search to add */}
      {selected.length < 3 && (
        <div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="text" placeholder={"Ajouter une offre (" + (3 - selected.length) + " place" + (3 - selected.length > 1 ? "s" : "") + " restante" + (3 - selected.length > 1 ? "s" : "") + ")..."} className="flex-1 bg-transparent outline-none text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>}
          </div>
          {search && (
            <div className="bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 p-3">Aucun resultat</p>
              ) : (
                filtered.slice(0, 6).map((o) => (
                  <div key={o.id} onClick={() => { setSelected([...selected, o.id]); setSearch(""); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                    <span className="text-lg">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.brand} {o.product}</p>
                      <p className="text-xs text-gray-400">{o.merchant} · {o.price.toLocaleString("fr-FR")} EUR</p>
                    </div>
                    <ScoreCircle score={o.score} size="xs" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {selected.length === 0 && !search && (
        <EmptyState icon="⚖️" title="Aucune offre a comparer" description="Recherchez et ajoutez 2 ou 3 offres ci-dessus, ou ajoutez des offres depuis les fiches produit." />
      )}

      {/* Mimo comparative */}
      {selectedOffers.length >= 2 && (
        <MimoCard text={generateCompareMimo()} />
      )}

      {/* Summary bar */}
      {selectedOffers.length >= 2 && best && worst && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <p className="text-[0.65rem] text-emerald-600 font-medium">Meilleur choix</p>
            <p className="text-sm font-bold text-emerald-800">{best.brand} {best.product}</p>
            <p className="text-xs text-emerald-600">Score {best.score} · {best.price.toLocaleString("fr-FR")} EUR</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
            <p className="text-[0.65rem] text-yellow-600 font-medium">A surveiller</p>
            <p className="text-sm font-bold text-yellow-800">{worst.brand} {worst.product}</p>
            <p className="text-xs text-yellow-600">Score {worst.score} · {worst.price.toLocaleString("fr-FR")} EUR</p>
          </div>
        </div>
      )}

      {/* Comparison grid */}
      {selectedOffers.length > 0 && (
        <div className={"grid gap-3 " + (selectedOffers.length === 1 ? "grid-cols-1" : selectedOffers.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {selectedOffers.map((o) => (
            <div key={o.id} className={"bg-white rounded-2xl border p-4 shadow-sm " + (best && o.id === best.id ? "border-emerald-500 ring-2 ring-emerald-100" : "border-gray-200")}>
              {best && o.id === best.id && (
                <span className="text-[0.6rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mb-2 inline-block">Recommande</span>
              )}
              <div className="text-center mb-3">
                <p className="text-2xl mb-1">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</p>
                <p className="text-[0.6rem] text-gray-400 uppercase font-medium">{o.brand}</p>
                <p className="font-bold text-xs leading-tight">{o.product}</p>
                <p className="text-[0.6rem] text-gray-400 mt-0.5">{o.merchant}</p>
              </div>
              <div className="flex justify-center mb-2"><ScoreCircle score={o.score} size="lg" /></div>
              <div className="text-center mb-3"><StatusBadge score={o.score} /></div>
              <p className="text-center font-bold text-lg mb-3">{o.price.toLocaleString("fr-FR")} EUR</p>
              {o.barredPrice && <p className="text-center text-xs text-gray-400 line-through -mt-2 mb-3">{o.barredPrice.toLocaleString("fr-FR")} EUR</p>}

              {/* PEFAS mini */}
              <div className="mb-3 space-y-1">
                {Object.entries(PEFAS_LABELS).map(([key, label]) => {
                  const val = o.pefas[key as keyof typeof o.pefas];
                  const color = val >= 70 ? "bg-emerald-600" : val >= 50 ? "bg-yellow-500" : "bg-orange-500";
                  const isBestOnAxis = selectedOffers.length >= 2 && val === Math.max(...selectedOffers.map(s => s.pefas[key as keyof typeof s.pefas]));
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-12 text-[0.6rem] font-semibold text-gray-500">{label.substring(0, 5)}.</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={"h-full rounded-full " + color} style={{ width: val + "%" }}></div>
                      </div>
                      <span className={"w-6 text-[0.6rem] font-bold text-right " + (isBestOnAxis ? "text-emerald-700" : "text-gray-500")}>{val}</span>
                      {isBestOnAxis && selectedOffers.length >= 2 && <span className="text-[0.5rem]">🏆</span>}
                    </div>
                  );
                })}
              </div>

              <div className="text-[0.65rem] text-gray-500 space-y-1 mb-3">
                <div className="flex justify-between"><span>Livraison</span><span className="font-medium text-gray-700">{o.delivery}</span></div>
                <div className="flex justify-between"><span>Garantie</span><span className="font-medium text-gray-700">{o.warranty}</span></div>
                <div className="flex justify-between"><span>Disponibilite</span><span className="font-medium text-gray-700">{o.availability}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                  <span className="font-semibold">Cout total 4 ans</span>
                  <span className="font-bold text-emerald-700">{(o.price + Math.round(o.price * 0.08) * 4).toLocaleString("fr-FR")} EUR</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => router.push("/explorer/" + o.id)} className="flex-1 text-[0.65rem] font-semibold bg-white border border-gray-200 py-2 rounded-lg hover:border-emerald-300 transition-colors">
                  Fiche
                </button>
                <button onClick={() => setSelected(selected.filter((id) => id !== o.id))} className="flex-1 text-[0.65rem] font-semibold text-red-500 bg-white border border-gray-200 py-2 rounded-lg hover:border-red-300 transition-colors">
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Axis comparison table */}
      {selectedOffers.length >= 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Comparaison par axe</h3>
          {Object.entries(PEFAS_LABELS).map(([key, label]) => {
            const vals = selectedOffers.map((o) => ({ name: o.brand + " " + o.product, val: o.pefas[key as keyof typeof o.pefas] }));
            const maxVal = Math.max(...vals.map(v => v.val));
            return (
              <div key={key} className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
                {vals.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <span className="w-24 text-[0.65rem] text-gray-500 truncate">{v.name.split(" ").slice(0, 2).join(" ")}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={"h-full rounded-full " + (v.val === maxVal ? "bg-emerald-600" : "bg-gray-400")} style={{ width: v.val + "%" }}></div>
                    </div>
                    <span className={"w-7 text-xs font-bold text-right " + (v.val === maxVal ? "text-emerald-700" : "text-gray-500")}>{v.val}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Price comparison */}
      {selectedOffers.length >= 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Comparaison economique</h3>
          <div className="space-y-2">
            {selectedOffers.sort((a, b) => a.price - b.price).map((o, i) => {
              const costTotal = o.price + Math.round(o.price * 0.08) * 4;
              const cheapest = i === 0;
              return (
                <div key={o.id} className={"flex items-center justify-between p-2.5 rounded-lg " + (cheapest ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50")}>
                  <div>
                    <p className="text-xs font-semibold">{o.brand} {o.product}</p>
                    <p className="text-[0.65rem] text-gray-400">{o.merchant}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{o.price.toLocaleString("fr-FR")} EUR</p>
                    <p className="text-[0.6rem] text-gray-400">Total 4 ans : {costTotal.toLocaleString("fr-FR")} EUR</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}