"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOfferById, getOffers, addFavorite, removeFavorite, getFavorites, recordView } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/lib/data";
import { ScoreCircle, StatusBadge, AxisBar, MimoCard, Toast, LoadingSkeleton, EmptyState } from "@/components/shared/Score";

const PEFAS_INFO: Record<string, { name: string; desc: string }> = {
  P: { name: "Pertinence", desc: "Adequation entre le produit et votre besoin reel : usage, espace, contraintes techniques, attentes fonctionnelles." },
  E: { name: "Economie", desc: "Rapport entre le cout total (achat + usage + indirect) et la valeur reellement delivree." },
  F: { name: "Fluidite", desc: "Facilite d acces a l offre : disponibilite, delai, livraison, simplicite du parcours, politique de retour." },
  A: { name: "Assurance", desc: "Fiabilite de l ecosysteme : marque, marchand, garantie, SAV, reputation du distributeur." },
  S: { name: "Stabilite", desc: "Constance du produit et de l offre dans le temps : durabilite, historique de prix, fiabilite long terme." },
};

type Project = { id: string; name: string; category: string };

function generateMimoAnalysis(offer: Offer): string {
  const strong: string[] = [];
  const weak: string[] = [];

  if (offer.pefas.P >= 75) strong.push("pertinence elevee pour votre profil");
  if (offer.pefas.E >= 75) strong.push("excellent rapport cout/valeur");
  if (offer.pefas.F >= 75) strong.push("acces fluide et conditions favorables");
  if (offer.pefas.A >= 75) strong.push("ecosysteme fiable (marque + marchand)");
  if (offer.pefas.S >= 75) strong.push("bonne stabilite dans le temps");

  if (offer.pefas.P < 55) weak.push("la pertinence pour votre usage est limitee");
  if (offer.pefas.E < 55) weak.push("le rapport cout/valeur est en dessous de la moyenne");
  if (offer.pefas.F < 55) weak.push("les conditions d acces sont contraignantes");
  if (offer.pefas.A < 55) weak.push("la fiabilite de l ecosysteme est incertaine");
  if (offer.pefas.S < 55) weak.push("la stabilite a long terme n est pas garantie");

  let text = offer.brand + " " + offer.product + " obtient un score de " + offer.score + "/100 chez " + offer.merchant + ". ";

  if (strong.length > 0) {
    text += "Points forts : " + strong.join(", ") + ". ";
  }
  if (weak.length > 0) {
    text += "Points d attention : " + weak.join(", ") + ". ";
  }

  if (offer.score >= 85) {
    text += "C est l une des meilleures offres disponibles dans cette categorie. Le positionnement est solide sur la majorite des axes.";
  } else if (offer.score >= 72) {
    text += "L offre est bien positionnee globalement. Quelques axes meritent verification mais l ensemble reste favorable.";
  } else if (offer.score >= 58) {
    text += "L offre est dans la moyenne. Comparez avec les alternatives avant de decider — des options mieux equilibrees peuvent exister.";
  } else if (offer.score >= 42) {
    text += "Plusieurs indicateurs sont en tension. Le rapport entre le prix et la valeur delivree n est pas optimal dans votre contexte.";
  } else {
    text += "Cette offre presente des faiblesses significatives sur plusieurs axes. Une alternative serait fortement recommandee.";
  }

  return text;
}

function generatePriceHistory(price: number): number[] {
  const pts: number[] = [];
  let p = price * (1 + (Math.random() * 0.15 - 0.05));
  for (let i = 0; i < 12; i++) {
    p = Math.max(price * 0.82, Math.min(price * 1.2, p + (Math.random() * 40 - 20)));
    pts.push(Math.round(p));
  }
  pts[11] = price;
  return pts;
}

function PriceChart({ history, currentPrice }: { history: number[]; currentPrice: number }) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const path = history.map((v, i) => {
    const x = (i / 11) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");

  const trend = currentPrice < history[0] ? "En baisse" : currentPrice > history[0] ? "En hausse" : "Stable";
  const trendColor = trend === "En baisse" ? "bg-emerald-100 text-emerald-800" : trend === "En hausse" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm">Historique de prix</h4>
        <span className={"text-[0.65rem] font-semibold px-2 py-0.5 rounded-full " + trendColor}>{trend}</span>
      </div>
      <svg viewBox="0 0 100 100" className="w-full" style={{ height: 80 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e8b57" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2e8b57" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={path + " L100,100 L0,100 Z"} fill="url(#priceGrad)" />
        <path d={path} fill="none" stroke="#2e8b57" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[0.65rem] text-gray-400">-12 mois</span>
        <div className="flex gap-3">
          <span className="text-[0.65rem] text-gray-400">Min: {min.toLocaleString("fr-FR")} EUR</span>
          <span className="text-[0.65rem] text-gray-400">Max: {max.toLocaleString("fr-FR")} EUR</span>
        </div>
        <span className="text-[0.65rem] text-gray-400">Aujourd hui</span>
      </div>
    </div>
  );
}

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
  const [toastMsg, setToastMsg] = useState("");
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [showAllReasons, setShowAllReasons] = useState(false);
  const [showAllVigilances, setShowAllVigilances] = useState(false);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      const o = await getOfferById(params.id as string);
      setOffer(o);
      if (o) {
        recordView(o.id);
        setPriceHistory(generatePriceHistory(o.price));
        const all = await getOffers({ subcategory: o.subcategory });
        setAlternatives(all.filter((a: Offer) => a.id !== o.id).sort((a, b) => b.score - a.score).slice(0, 4));
        const favs = await getFavorites();
        setIsFav(favs.includes(o.id));
      }
      const { data } = await supabase.from("projects").select("id, name, category").order("created_at", { ascending: false });
      if (data) setProjects(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function toggleFav() {
    if (!offer) return;
    if (isFav) {
      await removeFavorite(offer.id);
      setIsFav(false);
      showToast("Retire des favoris");
    } else {
      await addFavorite(offer.id);
      setIsFav(true);
      showToast("Ajoute aux favoris");
    }
  }

  async function addToProject(projectId: string) {
    if (!offer) return;
    const { data: existing } = await supabase.from("project_offers").select("id").eq("project_id", projectId).eq("offer_id", offer.id);
    if (existing && existing.length > 0) {
      showToast("Deja dans ce projet");
    } else {
      await supabase.from("project_offers").insert({ project_id: projectId, offer_id: offer.id });
      const proj = projects.find((p) => p.id === projectId);
      showToast("Ajoute a " + (proj?.name || "projet"));
    }
    setShowProjectMenu(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="flex gap-4 animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-1/3"></div><div className="h-5 bg-gray-200 rounded w-2/3"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div>
        </div>
        <LoadingSkeleton count={3} type="simple" />
      </div>
    );
  }

  if (!offer) {
    return <EmptyState icon="😕" title="Offre introuvable" description="Cette offre n existe pas ou a ete supprimee." action={() => router.push("/explorer")} actionLabel="Retour a l Explorer" />;
  }

  const catIcon = offer.category === "electromenager" ? "🏠" : offer.category === "froid" ? "❄️" : "📺";
  const mimoText = generateMimoAnalysis(offer);
  const costUsage = Math.round(offer.price * 0.08);
  const costTotal = offer.price + costUsage * 4;
  const bestAxis = Object.entries(offer.pefas).sort((a, b) => b[1] - a[1])[0];
  const worstAxis = Object.entries(offer.pefas).sort((a, b) => a[1] - b[1])[0];

  return (
    <div className="space-y-4">
      <Toast message={toastMsg} />

      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Retour
      </button>

      {/* Identity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="w-24 h-24 rounded-xl bg-gray-50 flex items-center justify-center text-4xl shrink-0">{catIcon}</div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{offer.brand}</p>
            <h2 className="text-lg font-bold">{offer.product}</h2>
            <p className="text-xs text-gray-500">{offer.model}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">{offer.merchant}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">{offer.subcategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-extrabold">{offer.price.toLocaleString("fr-FR")} EUR</span>
            {offer.barredPrice && <span className="text-sm text-gray-400 line-through ml-2">{offer.barredPrice.toLocaleString("fr-FR")} EUR</span>}
            {offer.barredPrice && <span className="text-xs font-semibold text-emerald-700 ml-2">-{Math.round((1 - offer.price / offer.barredPrice) * 100)}%</span>}
          </div>
          <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + (offer.availability === "En stock" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-700")}>{offer.availability}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Livraison", value: offer.delivery },
            { label: "Delai", value: "48h" },
            { label: "Retour", value: "30 jours" },
            { label: "Garantie", value: offer.warranty },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-[0.6rem] text-gray-400">{item.label}</p>
              <p className="text-xs font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <ScoreCircle score={offer.score} size="lg" />
          <div className="flex-1">
            <p className="font-bold">Score MAREF</p>
            <StatusBadge score={offer.score} />
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">Confiance : {offer.confidence}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">{offer.freshness}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-emerald-50 rounded-lg p-2.5">
            <p className="text-[0.65rem] text-emerald-600 font-medium">Meilleur axe</p>
            <p className="text-sm font-bold text-emerald-800">{PEFAS_INFO[bestAxis[0]]?.name} ({bestAxis[1]})</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2.5">
            <p className="text-[0.65rem] text-yellow-600 font-medium">Axe a surveiller</p>
            <p className="text-sm font-bold text-yellow-800">{PEFAS_INFO[worstAxis[0]]?.name} ({worstAxis[1]})</p>
          </div>
        </div>
      </div>

      {/* Mimo */}
      <MimoCard text={mimoText} />

      {/* PEFAS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">Analyse PEFAS</h3>
        {Object.entries(PEFAS_INFO).map(([key, info]) => (
          <div key={key}>
            <AxisBar label={info.name} value={offer.pefas[key as keyof typeof offer.pefas]} onClick={() => setActiveAxis(activeAxis === key ? null : key)} />
            {activeAxis === key && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-600 mb-2">{info.desc}</p>
                <MimoCard compact text={"Sur l axe " + info.name + " (" + offer.pefas[key as keyof typeof offer.pefas] + "/100) : " + (offer.pefas[key as keyof typeof offer.pefas] >= 75 ? "c est un point fort de cette offre. Ce score est au-dessus de la moyenne de la categorie." : offer.pefas[key as keyof typeof offer.pefas] >= 55 ? "resultat correct mais pas exceptionnel. Des alternatives pourraient mieux performer sur cet axe." : "c est un point faible. Verifiez si cela impacte votre decision selon vos priorites.")} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reasons */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h4 className="font-bold text-sm mb-2 text-emerald-700">Points forts ({offer.reasons.length})</h4>
        {(showAllReasons ? offer.reasons : offer.reasons.slice(0, 3)).map((r, i) => (
          <div key={i} className="py-2 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            {r}
          </div>
        ))}
        {offer.reasons.length > 3 && (
          <button onClick={() => setShowAllReasons(!showAllReasons)} className="text-xs font-semibold text-emerald-700 mt-2 hover:underline">
            {showAllReasons ? "Voir moins" : "Voir tout (" + offer.reasons.length + ")"}
          </button>
        )}
      </div>

      {/* Vigilances */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h4 className="font-bold text-sm mb-2 text-yellow-600">Points de vigilance ({offer.vigilances.length})</h4>
        {(showAllVigilances ? offer.vigilances : offer.vigilances.slice(0, 2)).map((v, i) => (
          <div key={i} className="py-2 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            {v}
          </div>
        ))}
        {offer.vigilances.length > 2 && (
          <button onClick={() => setShowAllVigilances(!showAllVigilances)} className="text-xs font-semibold text-yellow-600 mt-2 hover:underline">
            {showAllVigilances ? "Voir moins" : "Voir tout (" + offer.vigilances.length + ")"}
          </button>
        )}
      </div>

      {/* Extended cost */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h4 className="font-bold text-sm mb-3">Cout total etendu</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Cout d achat</span>
            <span className="font-semibold text-sm">{offer.price.toLocaleString("fr-FR")} EUR</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Cout d usage estime / an</span>
            <span className="font-semibold text-sm">{costUsage} EUR</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Cout usage sur 4 ans</span>
            <span className="font-semibold text-sm">{(costUsage * 4).toLocaleString("fr-FR")} EUR</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
            <span className="font-bold">Cout total sur 4 ans</span>
            <span className="font-extrabold text-lg text-emerald-700">{costTotal.toLocaleString("fr-FR")} EUR</span>
          </div>
        </div>
      </div>

      {/* Price history */}
      {priceHistory.length > 0 && <PriceChart history={priceHistory} currentPrice={offer.price} />}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Alternatives ({alternatives.length})</h3>
            <button onClick={() => router.push("/explorer")} className="text-xs font-semibold text-emerald-700">Voir tout</button>
          </div>
          <div className="space-y-2">
            {alternatives.map((o) => (
              <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-50 transition-colors">{catIcon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div><p className="text-[0.65rem] text-gray-400 uppercase font-medium">{o.brand}</p><p className="font-semibold text-xs truncate group-hover:text-emerald-700">{o.product}</p></div>
                    <ScoreCircle score={o.score} size="xs" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-xs">{o.price.toLocaleString("fr-FR")} EUR</span>
                    <span className="text-[0.6rem] text-gray-400">{o.merchant}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          <button onClick={toggleFav} className={"flex-1 text-sm font-semibold px-4 py-3 rounded-xl transition-colors " + (isFav ? "bg-emerald-700 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-300")}>
            {isFav ? "Sauvegarde ❤️" : "❤️ Sauvegarder"}
          </button>
          <button onClick={() => router.push("/comparer?ids=" + offer.id)} className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">
            ⚖️ Comparer
          </button>
        </div>
        <div className="relative mt-2">
          <button onClick={() => setShowProjectMenu(!showProjectMenu)} className="w-full text-sm font-semibold px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-emerald-300 transition-colors">
            📁 Ajouter au projet
          </button>
          {showProjectMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)}></div>
              <div className="absolute bottom-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-scale-in">
                {projects.length === 0 ? (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-500 mb-2">Aucun projet</p>
                    <button onClick={() => router.push("/projets")} className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">Creer un projet</button>
                  </div>
                ) : (
                  projects.map((p) => (
                    <button key={p.id} onClick={() => addToProject(p.id)} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-gray-400 ml-1.5">{p.category}</span>
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