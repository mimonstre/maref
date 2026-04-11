"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getProjectsWithOffers, type Project } from "@/features/projects/api";
import { deriveUserJourney } from "@/lib/core";
import { generateMimo } from "@/lib/mimo/engine";
import { getOffers, getFavorites } from "@/lib/queries";
import { analyzeProject } from "@/lib/projects/service";
import { averageOfferScore, getOfferDisplayScore, rankOffersByScore } from "@/lib/score/engine";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/lib/data";
import Link from "next/link";
import { ScoreCircle, StatusBadge, MimoCard, LoadingSkeleton } from "@/components/shared/Score";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [topicCount, setTopicCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, Offer[]>>({});

  useEffect(() => {
    async function load() {
      const all = await getOffers({});
      setAllOffers(all);
      const favs = await getFavorites();
      setFavCount(favs.length);
      const projectsData = await getProjectsWithOffers();
      setProjects(projectsData.projects);
      setProjectOffers(projectsData.projectOffers);
      setProjectCount(projectsData.projects.length);
      const { count: tc } = await supabase.from("forum_topics").select("*", { count: "exact", head: true });
      setTopicCount(tc || 0);
      setLoading(false);
    }
    load();
  }, []);

  const userName = user?.user_metadata?.name || "Utilisateur";
  const topOffers = rankOffersByScore(allOffers).slice(0, 5);
  const cheapOffers = [...allOffers].sort((a, b) => a.price - b.price).slice(0, 3);
  const avgScore = averageOfferScore(allOffers);
  const catCounts = {
    electromenager: allOffers.filter(o => o.category === "electromenager").length,
    froid: allOffers.filter(o => o.category === "froid").length,
    televiseurs: allOffers.filter(o => o.category === "televiseurs").length,
  };
  const merchants = [...new Set(allOffers.map(o => o.merchant))];
  const brands = [...new Set(allOffers.map(o => o.brand))];
  const bestProject = projects
    .map((project) => ({
      project,
      analysis: analyzeProject({
        projectId: project.id,
        projectName: project.name,
        projectCategory: project.category,
        projectBudget: project.budget,
        projectObjective: project.objective,
        existingOffers: projectOffers[project.id] || [],
      }),
    }))
    .filter((item) => item.analysis.totalOffers > 0)
    .sort((a, b) => b.analysis.averageScore - a.analysis.averageScore)[0];
  const dashboardMimo = bestProject
    ? generateMimo({
        mode: "dashboard",
        project: {
          projectId: bestProject.project.id,
          projectName: bestProject.project.name,
          projectCategory: bestProject.project.category,
          projectBudget: bestProject.project.budget,
          projectObjective: bestProject.project.objective,
          existingOffers: projectOffers[bestProject.project.id] || [],
        },
      })
    : "Bienvenue " + userName + ". Creez un projet ou ajoutez vos premieres offres pour obtenir une recommandation contextualisee.";
  const journey = deriveUserJourney(projects, projectOffers);

  // ========== LANDING ==========
  if (!authLoading && !user) {
    return (
      <div className="space-y-10 -mt-4">
        <div className="text-center py-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 rounded-3xl -z-10"></div>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ScoreCircle score={87} size="2xl" />
              <div className="absolute -right-2 -bottom-1 bg-white rounded-full px-2 py-0.5 shadow-md border border-gray-100">
                <span className="text-[0.65rem] font-bold text-emerald-700">PEFAS</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">L intelligence decisionnelle<br/>au service de vos achats</h1>
          <p className="text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">MAREF evalue la pertinence reelle d une offre dans votre situation. Pas une note. Pas un avis. Une analyse structuree et personnalisee.</p>
          <div className="flex justify-center gap-3 mt-8">
            <Link href="/login" className="bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg text-sm">Commencer gratuitement</Link>
            <Link href="/explorer" className="bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:border-emerald-300 transition-all text-sm shadow-sm">Explorer</Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm"><p className="text-lg font-extrabold text-emerald-700">{allOffers.length}</p><p className="text-[0.65rem] text-gray-500">Offres</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm"><p className="text-lg font-extrabold text-emerald-700">{merchants.length}</p><p className="text-[0.65rem] text-gray-500">Marchands</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm"><p className="text-lg font-extrabold text-emerald-700">{brands.length}</p><p className="text-[0.65rem] text-gray-500">Marques</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm"><p className="text-lg font-extrabold text-emerald-700">5</p><p className="text-[0.65rem] text-gray-500">Axes PEFAS</p></div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-center mb-4">Pourquoi MAREF change tout</h2>
          <div className="grid grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-red-50 p-5">
              <h4 className="font-bold text-sm mb-3 text-red-800">Sans MAREF</h4>
              <div className="space-y-2.5 text-xs text-red-700">
                {["Le prix seul ne reflete pas la valeur", "Comparateurs sans contexte personnel", "Avis subjectifs et manipulables", "Marketplaces au service du vendeur", "Trop d infos, pas assez de clarte"].map(t => (
                  <div key={t} className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span><span>{t}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-50 p-5">
              <h4 className="font-bold text-sm mb-3 text-emerald-800">Avec MAREF</h4>
              <div className="space-y-2.5 text-xs text-emerald-700">
                {["Score multi-dimensionnel sur 100", "5 axes PEFAS personnalises", "Analyse selon votre profil", "Cout total etendu calcule", "Interpretation claire par Mimo"].map(t => (
                  <div key={t} className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>{t}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-center mb-1">Un score, 5 axes, une decision eclairee</h3>
          <p className="text-xs text-gray-500 text-center mb-5">Chaque offre est analysee selon 5 dimensions</p>
          <div className="max-w-sm mx-auto space-y-3">
            {[{ k: "P", n: "Pertinence", v: 82, d: "Adequation a votre besoin" }, { k: "E", n: "Economie", v: 71, d: "Rapport cout / valeur" }, { k: "F", n: "Fluidite", v: 88, d: "Facilite d acces" }, { k: "A", n: "Assurance", v: 76, d: "Fiabilite globale" }, { k: "S", n: "Stabilite", v: 69, d: "Durabilite dans le temps" }].map(a => (
              <div key={a.k}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 text-[0.65rem] font-bold flex items-center justify-center">{a.k}</span>
                    <span className="text-xs font-semibold">{a.n}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">{a.v}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-600 rounded-full" style={{ width: a.v + "%" }}></div></div>
                <p className="text-[0.65rem] text-gray-400 mt-0.5">{a.d}</p>
              </div>
            ))}
          </div>
        </div>

        <MimoCard text="Cette offre presente un bon equilibre global. Le cout d usage sur 5 ans reste maitrise, et le marchand offre des conditions solides. Attention cependant a la garantie limitee a 1 an — un point a negocier ou compenser." />

        <div>
          <h2 className="text-lg font-bold text-center mb-4">Un produit complet</h2>
          <div className="grid grid-cols-2 gap-3">
            {[{ i: "🎯", t: "Score MAREF", d: "Score global sur 100" }, { i: "📊", t: "PEFAS", d: "5 axes structures" }, { i: "🤖", t: "Mimo", d: "Interpretation personnalisee" }, { i: "📁", t: "Projets", d: "Structurez vos decisions" }, { i: "📚", t: "Guide & Quiz", d: "Apprenez a decider" }, { i: "⚖️", t: "Comparaison", d: "Confrontez les offres" }, { i: "💬", t: "Forum", d: "Communaute active" }, { i: "🛡️", t: "Neutralite", d: "Aucun biais commercial" }].map(f => (
              <div key={f.t} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all">
                <p className="text-2xl mb-2">{f.i}</p>
                <h4 className="font-bold text-xs mb-0.5">{f.t}</h4>
                <p className="text-[0.7rem] text-gray-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-center mb-4">Categories</h2>
          <div className="grid grid-cols-3 gap-3">
            {[{ i: "🏠", n: "Electromenager", c: catCounts.electromenager }, { i: "❄️", n: "Froid", c: catCounts.froid }, { i: "📺", n: "Televiseurs", c: catCounts.televiseurs }].map(cat => (
              <div key={cat.n} onClick={() => router.push("/explorer")} className="bg-white rounded-xl border border-gray-200 p-5 text-center cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all">
                <p className="text-3xl mb-2">{cat.i}</p>
                <h4 className="font-bold text-xs">{cat.n}</h4>
                <p className="text-[0.65rem] text-gray-400 mt-0.5">{cat.c} offres</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🛡️</p>
          <h3 className="font-bold text-lg">Neutralite absolue</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">MAREF ne vend rien. Aucune commission. L acces B2C est et restera gratuit.</p>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
          <span className="text-[0.7rem] font-bold bg-white/10 px-2.5 py-1 rounded-md">MAREF Pro</span>
          <h3 className="font-bold text-lg mt-3">Pour les professionnels</h3>
          <p className="text-sm text-gray-400 mt-2">Insights marche, benchmarks, API decisionnelle.</p>
          <Link href="/pro" className="inline-block mt-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">Decouvrir →</Link>
        </div>

        <div className="text-center py-6">
          <h3 className="font-bold text-lg">Pret a mieux decider ?</h3>
          <Link href="/login" className="inline-block bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-emerald-800 transition-all shadow-md mt-4 text-sm">Creer mon compte</Link>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
          <p className="text-lg font-extrabold tracking-tight">MAREF</p>
          <p className="text-xs text-gray-400 mt-1">L intelligence decisionnelle appliquee a l achat.</p>
          <p className="text-[0.65rem] text-gray-600 mt-3">2026 MAREF. Tous droits reserves.</p>
        </div>
      </div>
    );
  }

  // ========== ACCUEIL CONNECTE ==========
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">{userName.charAt(0)}</div>
          <div>
            <h2 className="text-lg font-bold">Bonjour, {userName} 👋</h2>
            <p className="text-emerald-200 text-sm">Votre espace decisionnel</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="bg-white/10 rounded-lg p-2 text-center"><p className="text-lg font-bold">{favCount}</p><p className="text-[0.65rem] text-emerald-200">Favoris</p></div>
          <div className="bg-white/10 rounded-lg p-2 text-center"><p className="text-lg font-bold">{projectCount}</p><p className="text-[0.65rem] text-emerald-200">Projets</p></div>
          <div className="bg-white/10 rounded-lg p-2 text-center"><p className="text-lg font-bold">{allOffers.length}</p><p className="text-[0.65rem] text-emerald-200">Offres</p></div>
          <div className="bg-white/10 rounded-lg p-2 text-center"><p className="text-lg font-bold">{avgScore}</p><p className="text-[0.65rem] text-emerald-200">Score moy.</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-bold text-emerald-700 uppercase tracking-wide">Parcours decisionnel</p>
            <h3 className="font-bold mt-1">{journey.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{journey.description}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0">
            {journey.progress}/5
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full" style={{ width: journey.progress * 20 + "%" }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-3">{journey.hint}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Link href={journey.primaryAction.href} className="text-xs font-semibold bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
            {journey.primaryAction.label}
          </Link>
          {journey.secondaryAction && (
            <Link href={journey.secondaryAction.href} className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-300 transition-colors">
              {journey.secondaryAction.label}
            </Link>
          )}
        </div>
      </div>

      <MimoCard text={dashboardMimo} />

      {bestProject && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-bold text-emerald-700 uppercase tracking-wide">Projet prioritaire</p>
              <h3 className="font-bold mt-1">{bestProject.project.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{bestProject.project.objective || "Projet en cours d analyse."}</p>
            </div>
            {bestProject.analysis.averageScore > 0 && <ScoreCircle score={bestProject.analysis.averageScore} />}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-emerald-700">{bestProject.analysis.totalOffers}</p>
              <p className="text-[0.65rem] text-gray-500">Offres</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-emerald-700">{bestProject.analysis.budgetStatus}</p>
              <p className="text-[0.65rem] text-gray-500">Budget</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-emerald-700">
                {bestProject.analysis.bestOffer ? bestProject.analysis.bestOffer.brand : "-"}
              </p>
              <p className="text-[0.65rem] text-gray-500">Meilleur choix</p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-3 mt-4">
            <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded">Mimo</span>
            <p className="text-xs text-gray-700 mt-2 leading-relaxed">{bestProject.analysis.recommendation}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <Link href="/projets" className="text-xs font-semibold bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
              Ouvrir le projet
            </Link>
            {bestProject.analysis.totalOffers >= 2 && (
              <Link href={"/comparer?project=" + bestProject.project.id + "&ids=" + (projectOffers[bestProject.project.id] || []).map((offer) => offer.id).join(",")} className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-300 transition-colors">
                Comparer maintenant
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2.5">
        {[{ i: "🔍", l: "Explorer", h: "/explorer", c: "hover:border-emerald-300" }, { i: "⚖️", l: "Comparer", h: "/comparer", c: "hover:border-blue-300" }, { i: "❤️", l: "Favoris", h: "/favoris", c: "hover:border-red-300" }, { i: "📁", l: "Projets", h: "/projets", c: "hover:border-yellow-300" }].map(a => (
          <Link key={a.l} href={a.h} className={"bg-white rounded-xl border border-gray-200 p-3.5 text-center hover:shadow-md transition-all " + a.c}>
            <p className="text-xl">{a.i}</p>
            <p className="text-[0.7rem] font-semibold mt-1">{a.l}</p>
          </Link>
        ))}
      </div>

      {/* Categories overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold">Categories</span>
          <Link href="/explorer" className="text-xs font-semibold text-emerald-700">Explorer</Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{ i: "🏠", n: "Electromenager", c: catCounts.electromenager }, { i: "❄️", n: "Froid", c: catCounts.froid }, { i: "📺", n: "Televiseurs", c: catCounts.televiseurs }].map(cat => (
            <div key={cat.n} onClick={() => router.push("/explorer")} className="bg-white rounded-xl border border-gray-200 p-3 text-center cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all">
              <p className="text-xl">{cat.i}</p>
              <p className="text-xs font-semibold mt-1">{cat.n}</p>
              <p className="text-[0.65rem] text-gray-400">{cat.c} offres</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div><span className="font-bold">Meilleures offres</span><p className="text-xs text-gray-500">Par score MAREF</p></div>
          <Link href="/explorer" className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Tout voir</Link>
        </div>
        {loading ? <LoadingSkeleton count={3} /> : (
          <div className="space-y-2.5">
            {topOffers.map((o, i) => (
              <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group">
                <div className="relative w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-emerald-50 transition-colors">
                  {o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}
                  {i < 3 && <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-700 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center shadow-sm">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div><p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p><p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{o.product}</p></div>
                    <ScoreCircle score={getOfferDisplayScore(o)} size="sm" />
                  </div>
                  <p className="text-xs text-gray-400">{o.merchant} · {o.availability}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div><span className="font-bold">{o.price.toLocaleString("fr-FR")} EUR</span>{o.barredPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{o.barredPrice.toLocaleString("fr-FR")} EUR</span>}</div>
                    <StatusBadge score={getOfferDisplayScore(o)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3"><span className="font-bold">Petits prix</span></div>
        <div className="grid grid-cols-3 gap-2.5">
          {cheapOffers.map(o => (
            <div key={o.id} onClick={() => router.push("/explorer/" + o.id)} className="bg-white rounded-xl border border-gray-200 p-3 text-center hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
              <p className="text-2xl mb-1">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</p>
              <p className="text-[0.65rem] text-gray-400 uppercase font-medium">{o.brand}</p>
              <p className="text-xs font-semibold truncate">{o.product}</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">{o.price.toLocaleString("fr-FR")} EUR</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[{ i: "📚", t: "Guide", d: "7 modules", h: "/guide" }, { i: "💬", t: "Forum", d: topicCount + " discussions", h: "/forum" }, { i: "🤖", t: "Mimo", d: "Assistant", h: "/assistant" }, { i: "⚖️", t: "Comparer", d: "Multi-offres", h: "/comparer" }, { i: "🕐", t: "Historique", d: "Consultations", h: "/historique" }, { i: "🔔", t: "Notifications", d: "Alertes", h: "/notifications" }].map(l => (
          <Link key={l.t} href={l.h} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-3">
            <span className="text-2xl">{l.i}</span>
            <div><h4 className="font-bold text-sm">{l.t}</h4><p className="text-[0.7rem] text-gray-500">{l.d}</p></div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-lg">
        <span className="text-[0.7rem] font-bold bg-white/10 px-2.5 py-1 rounded-md">MAREF Pro</span>
        <h4 className="font-bold mt-2">Insights marche</h4>
        <p className="text-xs text-gray-400 mt-1">Benchmarks, rapports, API</p>
        <Link href="/pro" className="inline-block mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300">Decouvrir →</Link>
      </div>
    </div>
  );
}
