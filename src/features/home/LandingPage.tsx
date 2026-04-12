"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Bot, FolderKanban, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { MimoCard, NoDataBlock } from "@/components/shared/Score";

type LandingPageProps = {
  categoryCards: Array<{ name: string; count: number; icon: React.ReactNode }>;
};

const featureCards = [
  {
    title: "Score contextualise",
    description: "Le score n apparait que si les donnees sont suffisantes, avec une lecture claire et exploitable.",
    icon: <BarChart3 className="h-5 w-5 text-blue-700" />,
  },
  {
    title: "Mimo prudent",
    description: "L assistant explique les limites de l information et refuse les raccourcis trompeurs.",
    icon: <Bot className="h-5 w-5 text-blue-700" />,
  },
  {
    title: "Projet decisionnel",
    description: "Chaque short-list vit dans un projet, avec un contexte, un objectif et un budget reel.",
    icon: <FolderKanban className="h-5 w-5 text-blue-700" />,
  },
  {
    title: "Comparaison multi-familles",
    description: "Les produits sont compares par famille pour garder une analyse lisible et logique.",
    icon: <Scale className="h-5 w-5 text-blue-700" />,
  },
];

export default function LandingPage({ categoryCards }: LandingPageProps) {
  return (
    <div className="space-y-6">
      <section className="premium-hero rounded-[32px] px-6 py-8 text-white md:px-10 md:py-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Intelligence decisionnelle honnete
            </div>
            <h1 className="section-title mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
              Une interface qui aide vraiment a choisir, pas juste a naviguer.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 md:text-base">
              MAREF structure l achat comme un systeme de decision. Les donnees sont tracees, les limites sont visibles et
              les recommandations n existent que quand elles peuvent etre justifiees.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-900 shadow-[0_18px_36px_rgba(255,255,255,0.18)] transition-all hover:translate-y-[-1px]"
              >
                Ouvrir mon espace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explorer"
                className="rounded-2xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14"
              >
                Explorer les offres
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="premium-surface rounded-[28px] p-5 text-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Signal principal</p>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-950">Décider avec contexte</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Projet, budget, axes PEFAS, comparaison par famille et niveau de fiabilité visible dans chaque écran.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-50 p-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-blue-700/80">Ce qui compte</p>
                  <p className="mt-2 text-sm text-slate-700">Des arbitrages clairs, des données traçables et un parcours décisionnel lisible.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Ce qui est retiré</p>
                  <p className="mt-2 text-sm text-slate-700">Les compteurs décoratifs, les faux signaux de volume et les métriques qui n’aident pas à choisir.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="premium-panel rounded-[26px] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-700" />
                  <p className="text-sm font-bold text-slate-900">Ce que MAREF refuse</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Promesses sans source</li>
                  <li>Scores affiches par habitude</li>
                  <li>Comparaisons hors contexte</li>
                </ul>
              </div>
              <div className="premium-panel rounded-[26px] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-700" />
                  <p className="text-sm font-bold text-slate-900">Ce que MAREF apporte</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Familles de comparaison claires</li>
                  <li>Dashboard oriente action</li>
                  <li>Lecture de fiabilite visible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-surface rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Ce que le produit fait vraiment</p>
              <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Une expérience plus proche d’un cockpit que d’un catalogue</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {featureCards.map((card) => (
              <div key={card.title} className="premium-card rounded-[24px] p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-blue-50 p-2">{card.icon}</div>
                  <h3 className="font-semibold text-slate-900">{card.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <MimoCard text="MAREF ne cherche pas a impressionner par des artifices. La valeur vient d une lecture plus claire, plus rigoureuse et plus actionnable des options disponibles." />
          <NoDataBlock
            title="MAREF Pro reste volontairement sobre"
            description="L offre professionnelle n est pas encore presentee comme un produit commercial pret. Le site ne montre plus de faux chiffres, faux plans ni faux engagements."
          />
        </div>
      </section>

      <section className="premium-surface rounded-[30px] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Catalogue actif</p>
            <h2 className="section-title mt-2 text-2xl font-black text-slate-950">Familles disponibles</h2>
          </div>
          <Link href="/explorer" className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
            Ouvrir l explorer
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((category) => (
            <Link key={category.name} href="/explorer" className="premium-card rounded-[26px] p-5 transition-all hover:translate-y-[-2px]">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-blue-50 text-blue-700">
                {category.icon}
              </div>
              <p className="mt-4 text-lg font-bold text-slate-950">{category.name}</p>
              <p className="mt-1 text-sm text-slate-500">Entrer dans cette famille pour explorer les sous-catégories pertinentes.</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
