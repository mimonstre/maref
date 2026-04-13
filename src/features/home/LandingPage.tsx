"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Bot, FolderKanban, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { MimoCard, NoDataBlock } from "@/components/shared/Score";

type LandingPageProps = {
  categoryCards: Array<{ name: string; count: number; icon: React.ReactNode }>;
};

const featureCards = [
  {
    title: "Comprendre vite",
    description: "MAREF transforme des fiches confuses en lecture claire, utile et comparable.",
    icon: <BarChart3 className="h-5 w-5 text-blue-900" />,
  },
  {
    title: "Mimo vous guide",
    description: "L'assistant explique, nuance et aide à arbitrer selon votre vrai contexte.",
    icon: <Bot className="h-5 w-5 text-blue-900" />,
  },
  {
    title: "Projet d'achat",
    description: "Vous regroupez vos options dans un projet avec budget, objectif et shortlist.",
    icon: <FolderKanban className="h-5 w-5 text-blue-900" />,
  },
  {
    title: "Comparer proprement",
    description: "Chaque famille garde sa propre comparaison pour rester simple à lire.",
    icon: <Scale className="h-5 w-5 text-blue-900" />,
  },
];

const proofPoints = [
  "Un parcours clair : produit, offres, projet, comparaison, décision.",
  "Une lecture visible des forces et faiblesses au lieu de simples promesses.",
  "Un espace personnel qui garde vos repères utiles entre deux achats.",
];

export default function LandingPage({ categoryCards }: LandingPageProps) {
  return (
    <div className="space-y-6">
      <section className="premium-hero rounded-[36px] px-6 py-8 text-white md:px-10 md:py-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              L&apos;intelligence de vos choix
            </div>
            <h1 className="section-title mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Choisir le bon produit, puis la bonne offre, sans se perdre.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 md:text-base">
              MAREF structure vos achats importants. Vous explorez une famille, ouvrez une fiche produit, comparez les offres marchandes et tranchez avec plus de recul.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-950 shadow-[0_18px_36px_rgba(255,255,255,0.18)] transition-all hover:translate-y-[-1px]"
              >
                Ouvrir mon espace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explorer"
                className="rounded-2xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14"
              >
                Explorer les produits
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="premium-surface rounded-[30px] p-5 text-slate-900">
              <p className="section-kicker">Promesse claire</p>
              <h2 className="section-title mt-3 text-2xl font-black text-slate-950">Une aide concrète avant de dépenser.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                MAREF n&apos;ajoute pas du bruit. Il aide à comprendre ce que vous regardez, à garder les bonnes options et à comparer au bon moment.
              </p>
              <div className="mt-5 grid gap-2">
                {proofPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-900" />
                    <p className="text-sm text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="premium-panel rounded-[26px] p-4">
                <p className="section-kicker">Sans cadre</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Comparaisons mélangées</li>
                  <li>Lecture difficile</li>
                  <li>Décision fatigante</li>
                </ul>
              </div>
              <div className="premium-panel rounded-[26px] p-4">
                <p className="section-kicker">Avec MAREF</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Produits regroupés proprement</li>
                  <li>Offres lisibles</li>
                  <li>Décision mieux guidée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-surface rounded-[32px] p-6">
          <p className="section-kicker">Ce que vous faites ici</p>
          <h2 className="section-title mt-2 text-3xl font-black text-slate-950">Un parcours simple, utile, et réellement exploitable.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {featureCards.map((card) => (
              <div key={card.title} className="premium-card hover-lift rounded-[26px] p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-blue-100 p-2">{card.icon}</div>
                  <h3 className="font-semibold text-slate-900">{card.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <MimoCard text="MAREF ne cherche pas à impressionner avec des chiffres décoratifs. La valeur vient d'une lecture plus claire, plus structurée et plus utile pour trancher." />
          <NoDataBlock
            title="Une approche honnête"
            description="Le site évite les promesses gonflées, les faux plans et les signaux artificiels. Ce qui s'affiche doit rester compréhensible et utile."
          />
        </div>
      </section>

      <section className="premium-surface rounded-[32px] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">Catalogue</p>
            <h2 className="section-title mt-2 text-3xl font-black text-slate-950">Familles disponibles</h2>
          </div>
          <Link href="/explorer" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-950">
            Ouvrir l&apos;explorer
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((category) => (
            <Link key={category.name} href="/explorer" className="premium-card hover-lift rounded-[28px] p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-blue-100 text-blue-900">
                {category.icon}
              </div>
              <p className="mt-4 text-lg font-bold text-slate-950">{category.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {category.count} références visibles dans cette famille.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
