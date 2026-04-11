"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOfferById, getOffers, addFavorite, removeFavorite, getFavorites } from "@/lib/queries";
import { getOfferById, getOffers, addFavorite, removeFavorite, getFavorites, recordView } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/lib/data";

function ScoreCircle({ score, size = "md" }: { score: number; size?: string }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  const dim = size === "sm" ? "w-10 h-10 text-sm" : size === "lg" ? "w-20 h-20 text-2xl" : "w-14 h-14 text-lg";
  return <div className={dim + " " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"}>{score}</div>;
}

function StatusBadge({ score }: { score: number }) {
  const s =
    score >= 85 ? { l: "Excellent choix", c: "bg-emerald-100 text-emerald-800" }
    : score >= 72 ? { l: "Tres bon choix", c: "bg-emerald-50 text-emerald-700" }
    : score >= 58 ? { l: "Bon choix", c: "bg-lime-100 text-lime-700" }
    : score >= 42 ? { l: "A surveiller", c: "bg-yellow-100 text-yellow-700" }
    : score >= 25 ? { l: "Risque", c: "bg-orange-100 text-orange-700" }
    : { l: "Peu pertinent", c: "bg-red-100 text-red-700" };
  return <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + s.c}>{s.l}</span>;
}

function AxisBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "bg-emerald-700" : value >= 72 ? "bg-emerald-600" : value >= 58 ? "bg-lime-600" : value >= 42 ? "bg-yellow-500" : value >= 25 ? "bg-orange-500" : "bg-red-600";
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="w-24 text-xs font-semibold text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-all duration-700 " + color} style={{ width: value + "%" }}></div>
      </div>
      <span className={"w-8 text-xs font-bold text-right " + (value >= 58 ? "text-emerald-700" : value >= 42 ? "text-yellow-600" : "text-orange-600")}>{value}</span>
    </div>
  );
}

const PEFAS_INFO: Record<string, { name: string; desc: string }> = {
  P: { name: "Pertinence", desc: "Adequation entre le produit et votre besoin reel : usage, espace, contraintes techniques, attentes fonctionnelles." },
  E: { name: "Economie", desc: "Rapport entre le cout total (achat + usage + indirect) et la valeur reellement delivree." },
  F: { name: "Fluidite", desc: "Facilite d acces a l offre : disponibilite, delai, livraison, simplicite du parcours, politique de retour." },
  A: { name: "Assurance", desc: "Fiabilite de l ecosysteme : marque, marchand, garantie, SAV, reputation du distributeur." },
  S: { name: "Stabilite", desc: "Constance du produit et de l offre dans le temps : durabilite, historique de prix, fiabilite long terme." },
};

type Project = { id: string; name: string; category: string };

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
  const [projectMessage, setProjectMessage] = useState("");
  const [favMessage, setFavMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const o = await getOfferById(params.id as string);
      if (o) { recordView(o.id); }
      setOffer(o);
      if (o) {
        const all = await getOffers({ subcategory: o.subcategory });
        setAlternatives(all.filter((a: Offer) => a.id !== o.id).slice(0, 3));
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
      setFavMessage("Retire des favoris");
    } else {
      await addFavorite(offer.id);
      setIsFav(true);
      setFavMessage("Ajoute aux favoris");
    }
    setTimeout(() => setFavMessage(""), 2000);
  }

  async function addToProject(projectId: string) {
    if (!offer) return;
    const { data: existing } = await supabase.from("project_offers").select("id").eq("project_id", projectId).eq("offer_id", offer.id);
    if (existing && existing.length > 0) {
      setProjectMessage("Deja dans ce projet");
    } else {
      await supabase.from("project_offers").insert({ project_id: projectId, offer_id: offer.id });
      const proj = projects.find((p) => p.id === projectId);
      setProjectMessage("Ajoute a " + (proj?.name || "projet"));
    }
    setShowProjectMenu(false);
    setTimeout(() => setProjectMessage(""), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-20">
        <p className="text-3xl mb-3">😕</p>
        <h3 className="font-bold text-gray-600 mb-1">Offre introuvable</h3>
        <button onClick={() => router.back()} className="text-sm text-emerald-700 font-semibold mt-2">Retour</button>
      </div>
    );
  }

  const catIcon = offer.category === "electromenager" ? "🏠" : offer.category === "froid" ? "❄️" : "📺";
  const mimoLong = offer.score >= 72
    ? "Cette offre se distingue par un equilibre rare entre performance, fiabilite et cout total. Le marchand offre des conditions solides, et le produit est reconnu pour sa durabilite. Pour votre profil, c est l un des meilleurs positionnements disponibles dans cette categorie."
    : offer.score >= 58
    ? "L offre est dans la moyenne haute. Le produit remplit les fonctions essentielles, mais le cout total etendu ou certaines conditions marchandes peuvent reduire l avantage percu. Comparez avec les alternatives avant de decider."
    : "Plusieurs axes sont en tension. Le rapport entre le prix demande et la valeur reelle livree n est pas optimal. Le cout total etendu peut etre significativement superieur au prix affiche. Une alternative serait preferable.";
  const costUsage = Math.round(offer.price * 0.08);
  const costTotal = offer.price + costUsage * 4;

  return (
    <div className="space-y-4">
      {/* Toast messages */}
      {favMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          {favMessage}
        </div>
      )}
      {projectMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          {projectMessage}
        </div>
      )}

      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Retour
      </button>

      {/* Identity */}
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl shrink-0">{catIcon}</div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{offer.brand}</p>
          <h2 className="text-lg font-bold">{offer.product}</h2>
          <p className="text-xs text-gray-500">{offer.model} · {offer.subcategory}</p>
          <span className="inline-block text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium mt-1">{offer.merchant}</span>
        </div>
      </div>

      {/* Price */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold">{offer.price.toLocaleString("fr-FR")} EUR</span>
            {offer.barredPrice && <span className="text-sm text-gray-400 line-through ml-2">{offer.barredPrice.toLocaleString("fr-FR")} EUR</span>}
          </div>
          <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full " + (offer.availability === "En stock" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-700")}>{offer.availability}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div><p className="text-xs text-gray-400">Livraison</p><p className="text-sm font-medium">{offer.delivery}</p></div>
          <div><p className="text-xs text-gray-400">Delai</p><p className="text-sm font-medium">48h</p></div>
          <div><p className="text-xs text-gray-400">Retour</p><p className="text-sm font-medium">30 jours</p></div>
          <div><p className="text-xs text-gray-400">Garantie</p><p className="text-sm font-medium">{offer.warranty}</p></div>
        </div>
      </div>

      {/* Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <ScoreCircle score={offer.score} size="lg" />
          <div className="flex-1">
            <p className="font-bold text-sm">Score MAREF</p>
            <StatusBadge score={offer.score} />
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{offer.confidence}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{offer.freshness}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mimo */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">{mimoLong}</p>
      </div>

      {/* PEFAS */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm mb-3">Analyse PEFAS</h3>
        {Object.entries(PEFAS_INFO).map(([key, info]) => (
          <div key={key} className="cursor-pointer" onClick={() => setActiveAxis(activeAxis === key ? null : key)}>
            <AxisBar label={info.name} value={offer.pefas[key as keyof typeof offer.pefas]} />
            {activeAxis === key && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-600">{info.desc}</p>
                <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-3 mt-2">
                  <span className="absolute -top-2 left-2 bg-emerald-700 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded">Mimo</span>
                  <p className="text-xs text-gray-700 mt-1">
                    Sur l axe {info.name}, cette offre obtient {offer.pefas[key as keyof typeof offer.pefas]}/100. {offer.pefas[key as keyof typeof offer.pefas] >= 70 ? "C est un point fort." : offer.pefas[key as keyof typeof offer.pefas] >= 50 ? "Resultat correct, des alternatives pourraient faire mieux." : "Point d attention — verifiez les details."}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reasons */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-bold text-sm mb-2 text-emerald-700">Points forts</h4>
        {offer.reasons.map((r, i) => (
          <div key={i} className="py-1.5 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            {r}
          </div>
        ))}
      </div>

      {/* Vigilances */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-bold text-sm mb-2 text-yellow-600">Points de vigilance</h4>
        {offer.vigilances.map((v, i) => (
          <div key={i} className="py-1.5 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            {v}
          </div>
        ))}
      </div>

      {/* Extended cost */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-bold text-sm mb-3">Cout total etendu</h4>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm">Cout d achat</span>
          <span className="font-semibold text-sm">{offer.price.toLocaleString("fr-FR")} EUR</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm">Cout d usage estime / an</span>
          <span className="font-semibold text-sm">{costUsage} EUR</span>
        </div>
        <div className="flex items-center justify-between py-2 pt-3 border-t-2 border-gray-200">
          <span className="font-bold text-sm">Cout total sur 4 ans</span>
          <span className="font-extrabold text-emerald-700">{costTotal.toLocaleString("fr-FR")} EUR</span>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3">Alternatives</h3>
          {alternatives.map((o) => (
            <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3.5 mb-2.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">{catIcon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase">{o.brand}</p>
                <p className="font-semibold text-sm truncate">{o.product}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-sm">{o.price.toLocaleString("fr-FR")} EUR</span>
                  <ScoreCircle score={o.score} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={toggleFav} className={"text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors " + (isFav ? "bg-emerald-700 text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-300")}>
          {isFav ? "Sauvegarde ❤️" : "Sauvegarder"}
        </button>
        <button onClick={() => router.push("/comparer")} className="text-sm font-semibold px-4 py-2.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">
          Comparer
        </button>
        <div className="relative">
          <button onClick={() => setShowProjectMenu(!showProjectMenu)} className="text-sm font-semibold px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-emerald-300 transition-colors">
            Ajouter au projet
          </button>
          {showProjectMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)}></div>
              <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-scale-in">
                {projects.length === 0 ? (
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-500 mb-2">Aucun projet</p>
                    <button onClick={() => router.push("/projets")} className="text-xs font-semibold text-emerald-700">Creer un projet</button>
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