"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getOffers, getFavorites } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/lib/data";
import Link from "next/link";

function ScoreCircle({ score, size = "md" }: { score: number; size?: string }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  const dim = size === "sm" ? "w-10 h-10 text-sm" : size === "xl" ? "w-24 h-24 text-3xl" : size === "lg" ? "w-16 h-16 text-xl" : "w-14 h-14 text-lg";
  return <div className={dim + " " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg"}>{score}</div>;
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

function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3.5 text-center hover:shadow-md transition-all">
      <p className="text-lg mb-0.5">{icon}</p>
      <p className="text-lg font-extrabold text-emerald-700">{value}</p>
      <p className="text-[0.7rem] text-gray-500">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [topOffers, setTopOffers] = useState<Offer[]>([]);
  const [cheapOffers, setCheapOffers] = useState<Offer[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const all = await getOffers({ sort: "score" });
      setTopOffers(all.slice(0, 5));
      const cheap = [...all].sort((a, b) => a.price - b.price);
      setCheapOffers(cheap.slice(0, 3));
      const favs = await getFavorites();
      setFavCount(favs.length);
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      setProjectCount(count || 0);
      setLoading(false);
    }
    load();
  }, []);

  const userName = user?.user_metadata?.name || "Utilisateur";

  // ========== LANDING (non connecte) ==========
  if (!authLoading && !user) {
    return (
      <div className="space-y-10 -mt-4">
        {/* Hero */}
        <div className="text-center py-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 rounded-3xl -z-10"></div>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ScoreCircle score={87} size="xl" />
              <div className="absolute -right-2 -bottom-1 bg-white rounded-full px-2 py-0.5 shadow-md border border-gray-100">
                <span className="text-[0.65rem] font-bold text-emerald-700">PEFAS</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">L intelligence decisionnelle<br/>au service de vos achats</h1>
          <p className="text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">MAREF evalue la pertinence reelle d une offre dans votre situation. Pas une note. Pas un avis. Une analyse structuree et personnalisee.</p>
          <div className="flex justify-center gap-3 mt-8">
            <Link href="/login" className="bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg text-sm">
              Commencer gratuitement
            </Link>
            <Link href="/explorer" className="bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:border-emerald-300 transition-all text-sm shadow-sm">
              Explorer
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard value="28" label="Offres analysees" icon="📊" />
          <StatCard value="5" label="Axes PEFAS" icon="🎯" />
          <StatCard value="6" label="Marchands" icon="🏪" />
        </div>

        {/* Problem / Solution */}
        <div>
          <h2 className="text-lg font-bold text-center mb-4">Pourquoi MAREF change tout</h2>
          <div className="grid grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-red-50 p-5">
              <h4 className="font-bold text-sm mb-3 text-red-800">Sans MAREF</h4>
              <div className="space-y-2.5 text-xs text-red-700">
                <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span><span>Le prix seul ne reflete pas la valeur</span></div>
                <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span><span>Comparateurs sans contexte personnel</span></div>
                <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span><span>Avis subjectifs et manipulables</span></div>
                <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span><span>Marketplaces au service du vendeur</span></div>
                <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span><span>Trop d infos, pas assez de clarte</span></div>
              </div>
            </div>
            <div className="bg-emerald-50 p-5">
              <h4 className="font-bold text-sm mb-3 text-emerald-800">Avec MAREF</h4>
              <div className="space-y-2.5 text-xs text-emerald-700">
                <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>Score multi-dimensionnel sur 100</span></div>
                <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>5 axes PEFAS personnalises</span></div>
                <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>Analyse selon votre profil</span></div>
                <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>Cout total etendu calcule</span></div>
                <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>Interpretation claire par Mimo</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* PEFAS Demo */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-center mb-1">Un score, 5 axes, une decision eclairee</h3>
          <p className="text-xs text-gray-500 text-center mb-5">Chaque offre est analysee selon 5 dimensions complementaires</p>
          <div className="max-w-sm mx-auto space-y-3">
            {[
              { key: "P", name: "Pertinence", val: 82, desc: "Adequation a votre besoin" },
              { key: "E", name: "Economie", val: 71, desc: "Rapport cout / valeur" },
              { key: "F", name: "Fluidite", val: 88, desc: "Facilite d acces" },
              { key: "A", name: "Assurance", val: 76, desc: "Fiabilite globale" },
              { key: "S", name: "Stabilite", val: 69, desc: "Durabilite dans le temps" },
            ].map((a) => (
              <div key={a.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 text-[0.65rem] font-bold flex items-center justify-center">{a.key}</span>
                    <span className="text-xs font-semibold">{a.name}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">{a.val}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: a.val + "%" }}></div>
                </div>
                <p className="text-[0.65rem] text-gray-400 mt-0.5">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mimo Demo */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
          <p className="text-sm text-gray-800 mt-2 leading-relaxed">Cette offre presente un bon equilibre global. Le cout d usage sur 5 ans reste maitrise, et le marchand offre des conditions solides. Attention cependant a la garantie limitee a 1 an — un point a negocier ou compenser.</p>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold text-center mb-4">Un produit complet et structurant</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🎯", title: "Score MAREF", desc: "Score global contextualise sur 100 points" },
              { icon: "📊", title: "PEFAS", desc: "5 axes d analyse structures et ponderes" },
              { icon: "🤖", title: "Mimo", desc: "Interpretation claire et personnalisee" },
              { icon: "📁", title: "Projets", desc: "Organisez et structurez vos decisions" },
              { icon: "📚", title: "Guide & Formation", desc: "Apprenez a mieux decider" },
              { icon: "⚖️", title: "Comparaison", desc: "Confrontez les offres en detail" },
              { icon: "💬", title: "Forum", desc: "Echangez avec la communaute" },
              { icon: "🛡️", title: "Neutralite", desc: "Aucune commission, aucun biais" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all">
                <p className="text-2xl mb-2">{f.icon}</p>
                <h4 className="font-bold text-xs mb-0.5">{f.title}</h4>
                <p className="text-[0.7rem] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-lg font-bold text-center mb-4">Categories disponibles</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🏠", name: "Electromenager", count: "9 offres" },
              { icon: "❄️", name: "Froid", count: "10 offres" },
              { icon: "📺", name: "Televiseurs", count: "9 offres" },
            ].map((c) => (
              <div key={c.name} onClick={() => router.push("/explorer")} className="bg-white rounded-xl border border-gray-200 p-5 text-center cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all">
                <p className="text-3xl mb-2">{c.icon}</p>
                <h4 className="font-bold text-xs">{c.name}</h4>
                <p className="text-[0.65rem] text-gray-400 mt-0.5">{c.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Neutrality */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🛡️</p>
          <h3 className="font-bold text-lg">Neutralite absolue</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">MAREF ne vend rien. MAREF ne pousse pas a l achat. MAREF ne recoit aucune commission. L acces B2C est et restera gratuit.</p>
        </div>

        {/* Pro teaser */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
          <span className="text-[0.7rem] font-bold bg-white/10 px-2.5 py-1 rounded-md">MAREF Pro</span>
          <h3 className="font-bold text-lg mt-3">Pour les professionnels et les marques</h3>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">Accedez a des insights marche, des benchmarks categoriels et des rapports decisionnels bases sur les donnees MAREF.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {["📊 Dashboard", "📡 API", "📋 Rapports"].map((f) => (
              <div key={f} className="bg-white/5 rounded-lg p-2.5 text-center">
                <p className="text-xs font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center py-6">
          <h3 className="font-bold text-lg">Pret a mieux decider ?</h3>
          <p className="text-sm text-gray-500 mt-1">Rejoignez MAREF gratuitement.</p>
          <Link href="/login" className="inline-block bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-emerald-800 transition-all shadow-md mt-4 text-sm">
            Creer mon compte
          </Link>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
          <p className="text-lg font-extrabold tracking-tight">MAREF</p>
          <p className="text-xs text-gray-400 mt-1">L intelligence decisionnelle appliquee a l achat.</p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-[0.7rem] text-gray-500">Explorer</span>
            <span className="text-[0.7rem] text-gray-500">Guide</span>
            <span className="text-[0.7rem] text-gray-500">Forum</span>
            <span className="text-[0.7rem] text-gray-500">Contact</span>
          </div>
          <p className="text-[0.65rem] text-gray-600 mt-3">2026 MAREF. Tous droits reserves.</p>
        </div>
      </div>
    );
  }

  // ========== ACCUEIL CONNECTE ==========
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">{userName.charAt(0)}</div>
          <div>
            <h2 className="text-lg font-bold">Bonjour, {userName} 👋</h2>
            <p className="text-emerald-200 text-sm">Votre espace decisionnel est a jour.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{favCount}</p>
            <p className="text-[0.65rem] text-emerald-200">Favoris</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{projectCount}</p>
            <p className="text-[0.65rem] text-emerald-200">Projets</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">28</p>
            <p className="text-[0.65rem] text-emerald-200">Offres</p>
          </div>
        </div>
      </div>

      {/* Mimo */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2 leading-relaxed">Bienvenue {userName}. Vous avez {favCount} offres en favoris et {projectCount} projets en cours. Explorez les nouvelles offres ou affinez vos comparaisons pour avancer dans vos decisions.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { icon: "🔍", label: "Explorer", href: "/explorer", color: "hover:border-emerald-300" },
          { icon: "⚖️", label: "Comparer", href: "/comparer", color: "hover:border-blue-300" },
          { icon: "❤️", label: "Favoris", href: "/favoris", color: "hover:border-red-300" },
          { icon: "📁", label: "Projets", href: "/projets", color: "hover:border-yellow-300" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className={"bg-white rounded-xl border border-gray-200 p-3.5 text-center hover:shadow-md transition-all " + a.color}>
            <p className="text-xl">{a.icon}</p>
            <p className="text-[0.7rem] font-semibold mt-1">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Top offers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold">Meilleures offres</span>
            <p className="text-xs text-gray-500">Classees par score MAREF</p>
          </div>
          <Link href="/explorer" className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Tout voir</Link>
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
        ) : (
          <div className="space-y-2.5">
            {topOffers.map((o, i) => (
              <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group">
                <div className="relative w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                  {o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}
                  {i < 3 && (
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-700 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p>
                      <p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{o.product}</p>
                    </div>
                    <ScoreCircle score={o.score} size="sm" />
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

      {/* Petit prix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold">Petits prix</span>
            <p className="text-xs text-gray-500">Les offres les plus accessibles</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {cheapOffers.map((o) => (
            <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3 text-center hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
              <p className="text-2xl mb-1">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</p>
              <p className="text-[0.65rem] text-gray-400 uppercase font-medium">{o.brand}</p>
              <p className="text-xs font-semibold truncate">{o.product}</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">{o.price.toLocaleString("fr-FR")} EUR</p>
              <div className="mt-1"><ScoreCircle score={o.score} size="sm" /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/guide" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h4 className="font-bold text-sm">Guide MAREF</h4>
              <p className="text-[0.7rem] text-gray-500">7 modules disponibles</p>
            </div>
          </div>
        </Link>
        <Link href="/forum" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h4 className="font-bold text-sm">Forum</h4>
              <p className="text-[0.7rem] text-gray-500">4 discussions actives</p>
            </div>
          </div>
        </Link>
        <Link href="/assistant" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h4 className="font-bold text-sm">Assistant Mimo</h4>
              <p className="text-[0.7rem] text-gray-500">Posez vos questions</p>
            </div>
          </div>
        </Link>
        <Link href="/comparer" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h4 className="font-bold text-sm">Comparer</h4>
              <p className="text-[0.7rem] text-gray-500">Confrontez les offres</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Pro teaser */}
      <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-lg">
        <span className="text-[0.7rem] font-bold bg-white/10 px-2.5 py-1 rounded-md">MAREF Pro</span>
        <h4 className="font-bold mt-2">Insights marche pour professionnels</h4>
        <p className="text-xs text-gray-400 mt-1">Benchmarks, rapports, API decisionnelle</p>
      </div>
    </div>
  );
}