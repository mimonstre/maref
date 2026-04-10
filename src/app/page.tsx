"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getOffers } from "@/lib/queries";
import type { Offer } from "@/lib/data";
import Link from "next/link";

function ScoreCircle({ score, size = "md" }: { score: number; size?: string }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  const dim = size === "sm" ? "w-10 h-10 text-sm" : size === "xl" ? "w-24 h-24 text-3xl" : "w-14 h-14 text-lg";
  return <div className={dim + " " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0"}>{score}</div>;
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

function AxisBarMini({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "bg-emerald-700" : value >= 72 ? "bg-emerald-600" : value >= 58 ? "bg-lime-600" : value >= 42 ? "bg-yellow-500" : "bg-orange-500";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 text-[0.6rem] font-semibold text-gray-400">{label}</span>
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full " + color} style={{ width: value + "%" }}></div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [topOffers, setTopOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers({ sort: "score" }).then((data) => {
      setTopOffers(data.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const userName = user?.user_metadata?.name || "Utilisateur";

  // Landing for non-authenticated users
  if (!authLoading && !user) {
    return (
      <div className="space-y-8 -mt-4">
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <ScoreCircle score={87} size="xl" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">L intelligence decisionnelle au service de vos achats</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">MAREF evalue la pertinence reelle d une offre dans votre situation. Pas une note. Pas un avis. Une analyse structuree et personnalisee.</p>
          <div className="flex justify-center gap-3 mt-6">
            <Link href="/login" className="bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-emerald-800 transition-colors text-sm">
              Commencer gratuitement
            </Link>
            <Link href="/explorer" className="bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg hover:border-emerald-300 transition-colors text-sm">
              Explorer
            </Link>
          </div>
        </div>

        {/* Problem / Solution */}
        <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-red-50 p-4">
            <h4 className="font-bold text-sm mb-2 text-red-800">Aujourd hui</h4>
            <div className="space-y-1.5 text-xs text-red-700">
              <p>✗ Le prix seul ne suffit pas</p>
              <p>✗ Comparateurs sans contexte</p>
              <p>✗ Avis subjectifs et manipulables</p>
              <p>✗ Marketplaces biaisees</p>
            </div>
          </div>
          <div className="bg-emerald-50 p-4">
            <h4 className="font-bold text-sm mb-2 text-emerald-800">Avec MAREF</h4>
            <div className="space-y-1.5 text-xs text-emerald-700">
              <p>✓ Score multi-dimensionnel</p>
              <p>✓ 5 axes PEFAS structures</p>
              <p>✓ Analyse selon votre profil</p>
              <p>✓ Interpretation par Mimo</p>
            </div>
          </div>
        </div>

        {/* PEFAS Demo */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-center mb-4">Un score, 5 axes, une decision eclairee</h3>
          <div className="max-w-sm mx-auto space-y-2">
            {[["P", "Pertinence", 82], ["E", "Economie", 71], ["F", "Fluidite", 88], ["A", "Assurance", 76], ["S", "Stabilite", 69]].map(([key, name, val]) => (
              <div key={key as string} className="flex items-center gap-2">
                <span className="w-20 text-xs font-semibold text-gray-600">{name as string}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: (val as number) + "%" }}></div>
                </div>
                <span className="w-7 text-xs font-bold text-right">{val as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mimo Demo */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
          <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
          <p className="text-sm text-gray-800 mt-1">Cette offre presente un bon equilibre global. Le cout d usage sur 5 ans reste maitrise, et le marchand offre des conditions solides. Attention cependant a la garantie limitee a 1 an.</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🎯", title: "Score MAREF", desc: "Score global contextualise sur 100" },
            { icon: "📊", title: "PEFAS", desc: "5 axes d analyse structures" },
            { icon: "🤖", title: "Mimo", desc: "Interpretation claire et personnalisee" },
            { icon: "📁", title: "Projets", desc: "Organisez vos decisions d achat" },
            { icon: "📚", title: "Guide", desc: "Apprenez a mieux decider" },
            { icon: "⚖️", title: "Comparaison", desc: "Confrontez les offres en detail" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-3.5 text-center hover:shadow-md transition-all">
              <p className="text-2xl mb-1">{f.icon}</p>
              <h4 className="font-bold text-xs">{f.title}</h4>
              <p className="text-[0.7rem] text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Neutrality */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <p className="text-lg mb-1">🛡️</p>
          <h3 className="font-bold">Neutralite absolue</h3>
          <p className="text-sm text-gray-600 mt-1">MAREF ne vend rien. MAREF ne pousse pas a l achat. L acces est et restera gratuit.</p>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-bold text-sm mb-3">Categories disponibles</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🏠", name: "Electromenager" },
              { icon: "❄️", name: "Froid" },
              { icon: "📺", name: "Televiseurs" },
            ].map((c) => (
              <div key={c.name} onClick={() => router.push("/explorer")} className="bg-white rounded-xl border border-gray-200 p-4 text-center cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all">
                <p className="text-2xl mb-1">{c.icon}</p>
                <h4 className="font-bold text-xs">{c.name}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white rounded-xl p-6 text-center">
          <p className="text-lg font-extrabold tracking-tight">MAREF</p>
          <p className="text-xs text-gray-400 mt-1">L intelligence decisionnelle appliquee a l achat.</p>
          <p className="text-[0.65rem] text-gray-500 mt-3">2026 MAREF. Tous droits reserves.</p>
        </div>
      </div>
    );
  }

  // Authenticated home
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Bonjour, {userName} 👋</h2>
        <p className="text-sm text-gray-500">Votre espace decisionnel est a jour.</p>
      </div>

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">Bienvenue {userName}. Explorez les offres disponibles et commencez a structurer vos decisions d achat avec le moteur MAREF.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: "🔍", label: "Explorer", href: "/explorer" },
          { icon: "⚖️", label: "Comparer", href: "/comparer" },
          { icon: "❤️", label: "Favoris", href: "/favoris" },
          { icon: "📁", label: "Projets", href: "/projets" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white rounded-xl border border-gray-200 p-3 text-center hover:shadow-md hover:border-emerald-300 transition-all">
            <p className="text-xl">{a.icon}</p>
            <p className="text-[0.7rem] font-semibold mt-1">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Top offers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm">Meilleures offres</span>
          <Link href="/explorer" className="text-xs font-semibold text-emerald-700">Tout voir</Link>
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
            {topOffers.map((o) => (
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
                    <ScoreCircle score={o.score} size="sm" />
                  </div>
                  <div className="mt-1"><StatusBadge score={o.score} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide teaser */}
      <Link href="/guide" className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div className="flex-1">
            <h4 className="font-bold text-sm">Guide MAREF</h4>
            <p className="text-xs text-gray-500">Apprenez a mieux decider avec nos modules</p>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </div>
      </Link>

      {/* Pro teaser */}
      <div className="bg-gray-900 text-white rounded-xl p-4">
        <span className="text-[0.65rem] font-bold bg-white/10 px-2 py-0.5 rounded">MAREF Pro</span>
        <h4 className="font-bold mt-2">Insights marche pour professionnels</h4>
        <p className="text-xs text-gray-400 mt-1">Benchmarks, rapports, API decisionnelle</p>
      </div>
    </div>
  );
}