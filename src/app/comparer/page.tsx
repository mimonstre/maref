"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOffers } from "@/lib/queries";
import type { Offer } from "@/lib/data";

function ScoreCircle({ score, size = "md" }: { score: number; size?: string }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  const dim = size === "lg" ? "w-16 h-16 text-xl" : "w-10 h-10 text-sm";
  return (
    <div className={dim + " " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0"}>
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

function AxisBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "bg-emerald-700" : value >= 72 ? "bg-emerald-600" : value >= 58 ? "bg-lime-600" : value >= 42 ? "bg-yellow-500" : value >= 25 ? "bg-orange-500" : "bg-red-600";
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="w-8 text-[0.65rem] font-semibold text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full " + color} style={{ width: value + "%" }}></div>
      </div>
      <span className="w-6 text-[0.65rem] font-bold text-right">{value}</span>
    </div>
  );
}

const PEFAS_LABELS: Record<string, string> = { P: "Pert.", E: "Eco.", F: "Fluid.", A: "Assur.", S: "Stab." };

export default function ComparerPage() {
  const router = useRouter();
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers({}).then((data) => {
      setAllOffers(data);
      setLoading(false);
    });
  }, []);

  const selectedOffers = selected.map((id) => allOffers.find((o) => o.id === id)).filter(Boolean) as Offer[];
  const best = selectedOffers.length >= 2 ? selectedOffers.reduce((a, b) => (a.score > b.score ? a : b)) : null;

  const filtered = search
    ? allOffers.filter((o) => !selected.includes(o.id) && (o.product.toLowerCase().includes(search.toLowerCase()) || o.brand.toLowerCase().includes(search.toLowerCase())))
    : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Comparaison</h2>

      {/* Search to add */}
      {selected.length < 3 && (
        <div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="text"
              placeholder={"Ajouter une offre (" + (3 - selected.length) + " restante" + (3 - selected.length > 1 ? "s" : "") + ")..."}
              className="flex-1 bg-transparent outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <div className="bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 p-3">Aucun resultat</p>
              ) : (
                filtered.slice(0, 6).map((o) => (
                  <div
                    key={o.id}
                    onClick={() => { setSelected([...selected, o.id]); setSearch(""); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <span className="text-lg">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.brand} {o.product}</p>
                      <p className="text-xs text-gray-400">{o.merchant} · {o.price.toLocaleString("fr-FR")} EUR</p>
                    </div>
                    <ScoreCircle score={o.score} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {selected.length === 0 && !search && (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">⚖️</p>
          <h3 className="font-bold text-gray-600 mb-1">Aucune offre a comparer</h3>
          <p className="text-sm text-gray-400">Recherchez et ajoutez 2 ou 3 offres ci-dessus.</p>
        </div>
      )}

      {/* Mimo */}
      {selectedOffers.length >= 2 && best && (
        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
          <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
          <p className="text-sm text-gray-800 mt-1">
            Entre ces {selectedOffers.length} offres, le {best.brand} {best.product} se distingue avec un score de {best.score}/100. Il offre le meilleur equilibre dans votre contexte.
          </p>
        </div>
      )}

      {/* Comparison grid */}
      {selectedOffers.length > 0 && (
        <div className={"grid gap-3 " + (selectedOffers.length === 1 ? "grid-cols-1" : selectedOffers.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {selectedOffers.map((o) => (
            <div key={o.id} className={"bg-white rounded-xl border p-3 " + (best && o.id === best.id ? "border-emerald-500 ring-2 ring-emerald-100" : "border-gray-200")}>
              {best && o.id === best.id && (
                <span className="text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mb-2 inline-block">Meilleur choix</span>
              )}
              <div className="text-center mb-3">
                <p className="text-2xl mb-1">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</p>
                <p className="text-[0.65rem] text-gray-400 uppercase font-medium">{o.brand}</p>
                <p className="font-bold text-xs">{o.product}</p>
                <p className="text-[0.65rem] text-gray-400">{o.merchant}</p>
              </div>
              <div className="flex justify-center mb-3">
                <ScoreCircle score={o.score} size="lg" />
              </div>
              <div className="text-center mb-3">
                <StatusBadge score={o.score} />
              </div>
              <p className="text-center font-bold mb-3">{o.price.toLocaleString("fr-FR")} EUR</p>

              {/* PEFAS */}
              <div className="mb-3">
                {Object.entries(PEFAS_LABELS).map(([key, label]) => (
                  <AxisBar key={key} label={label} value={o.pefas[key as keyof typeof o.pefas]} />
                ))}
              </div>

              <div className="text-[0.7rem] text-gray-500 space-y-1 mb-3">
                <div className="flex justify-between"><span>Livraison</span><span className="font-medium">{o.delivery}</span></div>
                <div className="flex justify-between"><span>Garantie</span><span className="font-medium">{o.warranty}</span></div>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => router.push("/explorer/" + o.id)} className="flex-1 text-[0.7rem] font-semibold bg-white border border-gray-200 py-1.5 rounded-lg hover:border-emerald-300 transition-colors">
                  Fiche
                </button>
                <button onClick={() => setSelected(selected.filter((id) => id !== o.id))} className="flex-1 text-[0.7rem] font-semibold text-gray-500 bg-white border border-gray-200 py-1.5 rounded-lg hover:border-red-300 transition-colors">
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}