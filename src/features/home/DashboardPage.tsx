"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  FolderKanban,
  Heart,
  History,
  MapPin,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { LoadingSkeleton, NoDataBlock, ScoreCircle, StatusBadge } from "@/components/shared/Score";
import type { Project } from "@/features/projects/api";
import { getCategoryIcon } from "@/lib/categories";
import type { Offer } from "@/lib/core";
import type { SearchSignal } from "@/lib/core/userSignals";
import { analyzeProject } from "@/lib/projects/service";
import { getOfferDisplayScore, rankOffersByScore } from "@/lib/score/engine";

type HistoryOffer = {
  history_id?: string;
  offer_id: string;
  viewed_at: string;
  product: string;
  brand: string;
  price: number;
  score: number | null;
  category: string;
  merchant: string;
};

type DashboardPageProps = {
  userName: string;
  offers: Offer[];
  projects: Project[];
  projectOffers: Record<string, Offer[]>;
  favCount: number;
  loading: boolean;
  recentHistory: HistoryOffer[];
  recentSearches: SearchSignal[];
  userLocationLabel?: string | null;
};

type QuickLink = {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
};

const quickLinks: QuickLink[] = [
  { label: "Explorer", description: "Trouver des offres", href: "/explorer", icon: <Search className="h-5 w-5 text-blue-950" /> },
  { label: "Comparer", description: "Analyser par famille", href: "/comparer", icon: <SlidersHorizontal className="h-5 w-5 text-blue-950" /> },
  { label: "Favoris", description: "Retrouver vos favoris", href: "/favoris", icon: <Heart className="h-5 w-5 text-blue-950" /> },
  { label: "Projets", description: "Structurer une décision", href: "/projets", icon: <FolderKanban className="h-5 w-5 text-blue-950" /> },
  { label: "Guide", description: "Monter en compétence", href: "/guide", icon: <BookOpen className="h-5 w-5 text-blue-950" /> },
  { label: "Forum", description: "Poser une question", href: "/forum", icon: <MessageSquare className="h-5 w-5 text-blue-950" /> },
  { label: "Historique", description: "Reprendre vos analyses", href: "/historique", icon: <History className="h-5 w-5 text-blue-950" /> },
  { label: "Notifications", description: "Voir vos alertes", href: "/notifications", icon: <Bell className="h-5 w-5 text-blue-950" /> },
];

function getRecommendationPool(offers: Offer[], recentSearches: SearchSignal[]) {
  if (recentSearches.length === 0) {
    return rankOffersByScore(offers).filter((offer) => getOfferDisplayScore(offer) !== null).slice(0, 5);
  }

  const rankedSignals = recentSearches.slice(0, 6);
  const scored = offers.map((offer) => {
    const haystack = [offer.product, offer.brand, offer.category, offer.subcategory, offer.merchant].join(" ").toLowerCase();
    const signalScore = rankedSignals.reduce((acc, signal, index) => {
      const weight = Math.max(1, 6 - index);
      const label = signal.label.toLowerCase();
      const query = signal.query?.toLowerCase() || "";

      if (signal.subcategory && signal.subcategory === offer.subcategory) return acc + weight * 4;
      if (signal.category && signal.category === offer.category) return acc + weight * 2;
      if (query && haystack.includes(query)) return acc + weight * 3;
      if (label && haystack.includes(label)) return acc + weight * 2;
      return acc;
    }, 0);

    return { offer, signalScore };
  });

  return scored
    .filter((item) => item.signalScore > 0)
    .sort((a, b) => {
      if (b.signalScore !== a.signalScore) return b.signalScore - a.signalScore;
      return (getOfferDisplayScore(b.offer) || 0) - (getOfferDisplayScore(a.offer) || 0);
    })
    .slice(0, 5)
    .map((item) => item.offer);
}

export default function DashboardPage({
  userName,
  offers,
  projects,
  projectOffers,
  favCount,
  loading,
  recentHistory,
  recentSearches,
  userLocationLabel,
}: DashboardPageProps) {
  const recommendationPool = getRecommendationPool(offers, recentSearches);
  const totalProjectOffers = Object.values(projectOffers).reduce((acc, items) => acc + items.length, 0);
  const trackedBrands = new Set(Object.values(projectOffers).flat().map((offer) => offer.brand)).size;

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
    .filter((item) => item.analysis.totalOffers > 0)[0];

  const bestProjectOffers = bestProject ? projectOffers[bestProject.project.id] || [] : [];
  const projectTotalCost = bestProjectOffers.reduce((acc, offer) => acc + offer.price, 0);
  const projectReferences = Array.from(new Set(bestProjectOffers.map((offer) => offer.model || offer.product))).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="premium-hero rounded-[32px] px-6 py-8 text-white md:px-8 md:py-10">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard décisionnel
            </div>
            <h1 className="section-title mt-5 text-4xl font-black tracking-tight md:text-5xl">Bonjour, {userName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/90 md:text-base">
              Votre accueil MAREF met en avant ce qui peut vraiment faire avancer votre décision aujourd&apos;hui.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/explorer" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-950 shadow-[0_18px_36px_rgba(255,255,255,0.18)] transition-all hover:translate-y-[-1px]">
                Explorer les offres
              </Link>
              <Link href="/projets" className="rounded-2xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14">
                Ouvrir mes projets
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[26px] bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-blue-100/80">Favoris</p>
              <p className="mt-3 text-3xl font-black">{favCount}</p>
            </div>
            <div className="rounded-[26px] bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-blue-100/80">Projets</p>
              <p className="mt-3 text-3xl font-black">{projects.length}</p>
            </div>
            <div className="rounded-[26px] bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-blue-100/80">Offres suivies</p>
              <p className="mt-3 text-3xl font-black">{totalProjectOffers}</p>
            </div>
            <div className="rounded-[26px] bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-blue-100/80">Marques</p>
              <p className="mt-3 text-3xl font-black">{trackedBrands}</p>
            </div>
          </div>
        </div>
      </section>

      {bestProject && (
        <section className="premium-surface rounded-[30px] p-6">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">Projet prioritaire</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="section-title text-2xl font-black text-slate-950">{bestProject.project.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{bestProject.project.objective || "Projet en cours d analyse."}</p>
                </div>
                {bestProject.analysis.averageScore > 0 && <ScoreCircle score={bestProject.analysis.averageScore} />}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/projets" className="rounded-2xl bg-gradient-to-r from-blue-950 to-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition-all hover:translate-y-[-1px]">
                  Ouvrir le projet
                </Link>
                {bestProject.analysis.totalOffers >= 2 && (
                  <Link href={`/comparer?project=${bestProject.project.id}&ids=${bestProjectOffers.map((offer) => offer.id).join(",")}`} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400">
                    Comparer maintenant
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="premium-card rounded-[24px] p-4 text-center">
                <p className="text-2xl font-black text-blue-950">{bestProject.analysis.totalOffers}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Offres</p>
              </div>
              <div className="premium-card rounded-[24px] p-4 text-center">
                <p className="text-base font-black text-blue-950">{projectTotalCost.toLocaleString("fr-FR")} EUR</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Coût total</p>
              </div>
              <div className="premium-card rounded-[24px] p-4 text-center">
                <p className="text-base font-black text-blue-950">
                  {Array.from(new Set(bestProjectOffers.map((offer) => offer.brand))).slice(0, 3).join(", ") || "-"}
                </p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Marques</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">Références du projet</p>
                <p className="mt-1 text-sm text-slate-600">
                  {projectReferences.length > 0 ? projectReferences.join(" • ") : "Aucune référence rattachée pour le moment."}
                </p>
              </div>
              {userLocationLabel && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-blue-950" />
                  {userLocationLabel}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="premium-surface rounded-[30px] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">Accès rapides</p>
            <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Tout ce qu il faut pour avancer vite</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <Link key={item.label} href={item.href} className="premium-card rounded-[24px] p-4 transition-all hover:translate-y-[-2px]">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-slate-100">{item.icon}</div>
              <p className="mt-4 text-base font-bold text-slate-950">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="premium-surface rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">Historique</p>
              <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Vos 5 dernières offres consultées</h2>
            </div>
            <Link href="/historique" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400">
              Voir tout
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : recentHistory.length === 0 ? (
            <NoDataBlock title="Aucune consultation récente" description="Ouvrez quelques fiches produit et votre historique apparaîtra ici automatiquement." />
          ) : (
            <div className="space-y-3">
              {Array.from(new Map(recentHistory.map((offer) => [offer.offer_id, offer])).values()).slice(0, 5).map((offer) => (
                <Link key={offer.history_id || offer.offer_id} href={`/explorer/${offer.offer_id}`} className="premium-card group flex gap-4 rounded-[24px] p-4 transition-all hover:translate-y-[-2px]">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-slate-100 text-2xl">
                    {getCategoryIcon(offer.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">{offer.brand}</p>
                        <p className="truncate text-base font-bold text-slate-950 transition-colors group-hover:text-blue-950">{offer.product}</p>
                      </div>
                      <ScoreCircle score={offer.score} size="sm" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{offer.merchant}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-lg font-black text-slate-950">{offer.price.toLocaleString("fr-FR")} EUR</span>
                      <StatusBadge score={offer.score} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="premium-surface rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-950">Le meilleur pour vous</p>
              <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Recommandations qui évoluent avec vos recherches</h2>
            </div>
          </div>
          {recommendationPool.length === 0 ? (
            <NoDataBlock title="Pas encore assez de signaux" description="Explorez quelques familles ou recherchez des références : MAREF affinera cette zone automatiquement." />
          ) : (
            <div className="space-y-3">
              {recommendationPool.slice(0, 4).map((offer) => (
                <Link key={offer.id} href={`/explorer/${offer.id}`} className="premium-card flex gap-4 rounded-[24px] p-4 transition-all hover:translate-y-[-2px]">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-slate-100 text-2xl">
                    {getCategoryIcon(offer.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">{offer.brand}</p>
                        <p className="truncate text-base font-bold text-slate-950">{offer.product}</p>
                      </div>
                      <ScoreCircle score={getOfferDisplayScore(offer)} size="sm" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{offer.merchant}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-lg font-black text-slate-950">{offer.price.toLocaleString("fr-FR")} EUR</span>
                      <StatusBadge score={getOfferDisplayScore(offer)} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
