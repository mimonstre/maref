"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  FolderKanban,
  Heart,
  History,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { LoadingSkeleton, MimoCard, ScoreCircle, StatusBadge } from "@/components/shared/Score";
import type { Project } from "@/features/projects/api";
import { getCategoryIcon } from "@/lib/categories";
import type { Offer } from "@/lib/core";
import { deriveUserJourney } from "@/lib/core";
import { analyzeProject } from "@/lib/projects/service";
import { rankOffersByScore } from "@/lib/score/engine";

type DashboardPageProps = {
  userName: string;
  offers: Offer[];
  projects: Project[];
  projectOffers: Record<string, Offer[]>;
  favCount: number;
  topicCount: number;
  loading: boolean;
};

type QuickLink = {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
};

const quickLinks: QuickLink[] = [
  { label: "Explorer", description: "Trouver des offres", href: "/explorer", icon: <Search className="h-5 w-5 text-blue-700" /> },
  { label: "Comparer", description: "Analyser par famille", href: "/comparer", icon: <SlidersHorizontal className="h-5 w-5 text-blue-700" /> },
  { label: "Favoris", description: "Retrouver vos sauvegardes", href: "/favoris", icon: <Heart className="h-5 w-5 text-blue-700" /> },
  { label: "Projets", description: "Structurer une decision", href: "/projets", icon: <FolderKanban className="h-5 w-5 text-blue-700" /> },
  { label: "Guide", description: "Monter en competence", href: "/guide", icon: <BookOpen className="h-5 w-5 text-blue-700" /> },
  { label: "Forum", description: "Poser une question", href: "/forum", icon: <MessageSquare className="h-5 w-5 text-blue-700" /> },
  { label: "Historique", description: "Reprendre vos analyses", href: "/historique", icon: <History className="h-5 w-5 text-blue-700" /> },
  { label: "Notifications", description: "Voir vos alertes", href: "/notifications", icon: <Bell className="h-5 w-5 text-blue-700" /> },
];

export default function DashboardPage({ userName, offers, projects, projectOffers, favCount, topicCount, loading }: DashboardPageProps) {
  const topOffers = rankOffersByScore(offers).filter((offer) => offer.displayScore !== null).slice(0, 4);
  const cheapOffers = [...offers].sort((a, b) => a.price - b.price).slice(0, 3);
  const journey = deriveUserJourney(projects, projectOffers);

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
    .sort((a, b) => (b.analysis.averageScore || 0) - (a.analysis.averageScore || 0))[0];

  const dashboardMimo = bestProject
    ? bestProject.analysis.recommendation
    : "Creez un projet ou ajoutez des offres pour obtenir une recommandation contextualisee.";

  return (
    <div className="space-y-6">
      <section className="premium-hero rounded-[32px] px-6 py-8 text-white md:px-8 md:py-10">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard decisionnel
            </div>
            <h1 className="section-title mt-5 text-4xl font-black tracking-tight md:text-5xl">Bonjour, {userName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/90 md:text-base">
              Votre cockpit MAREF se concentre sur les projets actifs, les comparaisons utiles et les actions reelles a mener ensuite.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={journey.primaryAction.href} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-900 shadow-[0_18px_36px_rgba(255,255,255,0.18)] transition-all hover:translate-y-[-1px]">
                {journey.primaryAction.label}
              </Link>
              {journey.secondaryAction && (
                <Link href={journey.secondaryAction.href} className="rounded-2xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14">
                  {journey.secondaryAction.label}
                </Link>
              )}
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
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-blue-100/80">Discussions</p>
              <p className="mt-3 text-3xl font-black">{topicCount}</p>
            </div>
            <div className="rounded-[26px] bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-blue-100/80">Étape</p>
              <p className="mt-3 text-3xl font-black">{journey.progress}/5</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-surface rounded-[30px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Parcours decisionnel</p>
              <h2 className="section-title mt-2 text-2xl font-black text-slate-950">{journey.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{journey.description}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-blue-50 text-lg font-black text-blue-800">
              {journey.progress}/5
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500" style={{ width: `${journey.progress * 20}%` }}></div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{journey.hint}</p>
        </div>

        <MimoCard text={dashboardMimo} />
      </section>

      {bestProject && (
        <section className="premium-surface rounded-[30px] p-6">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Projet prioritaire</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="section-title text-2xl font-black text-slate-950">{bestProject.project.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{bestProject.project.objective || "Projet en cours d analyse."}</p>
                </div>
                {bestProject.analysis.averageScore > 0 && <ScoreCircle score={bestProject.analysis.averageScore} />}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/projets" className="rounded-2xl bg-gradient-to-r from-blue-700 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)] transition-all hover:translate-y-[-1px]">
                  Ouvrir le projet
                </Link>
                {bestProject.analysis.totalOffers >= 2 && (
                  <Link href={`/comparer?project=${bestProject.project.id}&ids=${(projectOffers[bestProject.project.id] || []).map((offer) => offer.id).join(",")}`} className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300">
                    Comparer maintenant
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="premium-card rounded-[24px] p-4 text-center">
                <p className="text-2xl font-black text-blue-700">{bestProject.analysis.totalOffers}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Offres</p>
              </div>
              <div className="premium-card rounded-[24px] p-4 text-center">
                <p className="text-base font-black text-blue-700">{bestProject.analysis.budgetStatus}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Budget</p>
              </div>
              <div className="premium-card rounded-[24px] p-4 text-center">
                <p className="text-base font-black text-blue-700">{bestProject.analysis.bestOffer ? bestProject.analysis.bestOffer.brand : "-"}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Leader</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="premium-surface rounded-[30px] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Acces rapides</p>
            <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Tout ce qu il faut pour avancer vite</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <Link key={item.label} href={item.href} className="premium-card rounded-[24px] p-4 transition-all hover:translate-y-[-2px]">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">{item.icon}</div>
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
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Offres les plus solides</p>
              <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Top du catalogue visible</h2>
            </div>
            <Link href="/explorer" className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
              Tout voir
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="space-y-3">
              {topOffers.map((offer, index) => (
                <Link key={offer.id} href={`/explorer/${offer.id}`} className="premium-card group flex gap-4 rounded-[24px] p-4 transition-all hover:translate-y-[-2px]">
                  <div className="relative flex h-18 w-18 shrink-0 items-center justify-center rounded-[22px] bg-blue-50 text-2xl">
                    {getCategoryIcon(offer.category)}
                    <span className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-[0.68rem] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">{offer.brand}</p>
                        <p className="truncate text-base font-bold text-slate-950 transition-colors group-hover:text-blue-700">{offer.product}</p>
                      </div>
                      <ScoreCircle score={offer.displayScore} size="sm" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{offer.merchant} - {offer.availability}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-lg font-black text-slate-950">{offer.price.toLocaleString("fr-FR")} EUR</span>
                      <StatusBadge score={offer.displayScore} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="premium-surface rounded-[30px] p-6">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Repères rapides</p>
            <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Points d’entrée utiles</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {cheapOffers.map((offer) => (
                <Link key={offer.id} href={`/explorer/${offer.id}`} className="premium-card rounded-[22px] p-4 text-center transition-all hover:translate-y-[-2px]">
                  <div className="flex justify-center text-2xl text-blue-700">{getCategoryIcon(offer.category)}</div>
                  <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">{offer.brand}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-900">{offer.product}</p>
                  <p className="mt-3 text-sm font-black text-blue-700">{offer.price.toLocaleString("fr-FR")} EUR</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
