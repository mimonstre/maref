"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOfferById, getOffers, addFavorite, removeFavorite, getFavorites, recordView } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/lib/data";
import { ScoreCircle, StatusBadge, AxisBar, MimoCard, Toast, LoadingSkeleton } from "@/components/shared/Score";

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
  const [toastMsg, setToastMsg] = useState("");

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
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <LoadingSkeleton count={2} type="simple" />
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
      <Toast message={toastMsg} />

      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Retour
      </button>

      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl shrink-0">{catIcon}</div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{offer.brand}</p>
          <h2 className="text-lg font-bold">{offer.product}</h2>
          <p className="text-xs text-gray-500">{offer.model} · {offer.subcategory}</p>
          <span className="inline-block text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium mt-1">{offer.merchant}</span>
        </div>
      </div>

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

      <MimoCard text={mimoLong} />

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm mb-3">Analyse PEFAS</h3>
        {Object.entries(PEFAS_INFO).map(([key, info]) => (
          <div key={key}>
            <AxisBar label={info.name} value={offer.pefas[key as keyof typeof offer.pefas]} onClick={() => setActiveAxis(activeAxis === key ? null : key)} />
            {activeAxis === key && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-600">{info.desc}</p>
                <MimoCard
                  compact
                  text={"Sur l axe " + info.name + ", cette offre obtient " + offer.pefas[key as keyof typeof offer.pefas] + "/100. " + (offer.pefas[key as keyof typeof offer.pefas] >= 70 ? "C est un point fort." : offer.pefas[key as keyof typeof offer.pefas] >= 50 ? "Resultat correct, des alternatives pourraient faire mieux." : "Point d attention — verifiez les details.")}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-bold text-sm mb-2 text-emerald-700">Points forts</h4>
        {offer.reasons.map((r, i) => (
          <div key={i} className="py-1.5 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            {r}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-bold text-sm mb-2 text-yellow-600">Points de vigilance</h4>
        {offer.vigilances.map((v, i) => (
          <div key={i} className="py-1.5 border-b border-gray-100 last:border-0 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            {v}
          </div>
        ))}
      </div>

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