"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FolderKanban,
  PanelTop,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Workflow,
} from "lucide-react";
import { IncompleteDataWarning, MimoCard, NoDataBlock } from "@/components/shared/Score";

const realServices = [
  {
    title: "Audit de parcours décisionnel",
    description:
      "Cadrage du besoin, hiérarchisation des critères et structuration d&apos;un parcours projet pour éviter les comparaisons floues ou trop larges.",
    icon: <PanelTop className="h-5 w-5 text-blue-700" />,
  },
  {
    title: "Comparatifs multi-critères",
    description:
      "Comparaison par famille de produits avec lecture PEFAS, écarts techniques, arbitrages budget et recommandations argumentées.",
    icon: <SlidersHorizontal className="h-5 w-5 text-blue-700" />,
  },
  {
    title: "Gouvernance de la donnée produit",
    description:
      "Qualification des sources, niveau de fiabilité, cohérence des champs et assainissement des fiches pour éviter les faux signaux.",
    icon: <ShieldCheck className="h-5 w-5 text-blue-700" />,
  },
  {
    title: "Espaces projet pilotés",
    description:
      "Création de short-lists projet, scénarios d&apos;arbitrage et restitution claire pour un foyer, une équipe ou un décideur.",
    icon: <FolderKanban className="h-5 w-5 text-blue-700" />,
  },
  {
    title: "Ateliers d&apos;aide à la décision",
    description:
      "Animation d&apos;une short-list, arbitrage entre plusieurs offres et reformulation d&apos;une décision compréhensible et défendable.",
    icon: <Workflow className="h-5 w-5 text-blue-700" />,
  },
];

export default function ProPage() {
  return (
    <div className="space-y-6">
      <section className="premium-hero rounded-[32px] px-6 py-8 text-white md:px-8 md:py-10">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100">
              <Building2 className="h-3.5 w-3.5" />
              MAREF Pro
            </div>
            <h1 className="section-title mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Une offre premium d&apos;aide à la décision, claire et crédible.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100/90 md:text-base">
              MAREF Pro s&apos;adresse aux besoins où il faut structurer une décision d&apos;achat, clarifier une short-list,
              fiabiliser une lecture d&apos;offre ou cadrer un arbitrage produit. Cette page présente uniquement des
              services réellement tenables aujourd&apos;hui.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/explorer"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-950 shadow-[0_18px_36px_rgba(255,255,255,0.18)] transition-all hover:translate-y-[-1px]"
              >
                Découvrir le produit
              </Link>
              <Link
                href="/projets"
                className="rounded-2xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14"
              >
                Voir un cas d&apos;usage
              </Link>
            </div>
          </div>

          <div className="premium-surface rounded-[28px] p-5 text-slate-900">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Positionnement</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Offre d&apos;accompagnement décisionnel</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pas d&apos;abonnement fictif, pas de faux clients, pas de promesse enterprise artificielle. MAREF Pro est
              présenté comme un service premium d&apos;aide à la décision appuyé sur le produit actuel.
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">Pour qui</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Foyers exigeants, décideurs, équipes achat, accompagnement de sélection produit.
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">Ce que cela apporte</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Une décision plus claire, plus traçable, plus argumentée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {realServices.map((service) => (
          <div key={service.title} className="premium-card rounded-[26px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">{service.icon}</div>
            <h2 className="mt-4 text-base font-bold text-slate-950">{service.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <MimoCard text="MAREF Pro a du sens quand il sert à rendre une décision plus claire, plus traçable et plus argumentée. Il ne remplace pas un cabinet de conseil ni une plateforme enterprise complète : il structure, éclaire et fiabilise la décision." />

        <div className="premium-surface rounded-[30px] p-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Ce qui est réellement livré</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Structurer un parcours projet puis filtrer, comparer et arbitrer par famille.</li>
            <li>Produire une lecture PEFAS plus lisible et plus défendable.</li>
            <li>Afficher le niveau de fiabilité et refuser les analyses quand la donnée manque.</li>
            <li>Consolider une short-list et préparer une décision assumée.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="premium-card rounded-[26px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-700" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-950">Cadrage initial</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Clarifier le besoin, les contraintes et les critères non négociables avant toute comparaison.
          </p>
        </div>
        <div className="premium-card rounded-[26px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
            <SlidersHorizontal className="h-5 w-5 text-blue-700" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-950">Analyse et arbitrage</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Comparer proprement plusieurs options et rendre les compromis lisibles pour décider sans flou.
          </p>
        </div>
        <div className="premium-card rounded-[26px] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
            <ArrowRight className="h-5 w-5 text-blue-700" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-950">Restitution claire</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Formuler une décision compréhensible, défendable et directement actionnable par le client ou l&apos;équipe.
          </p>
        </div>
      </section>

      <NoDataBlock
        title="Ce qui n&apos;est volontairement pas vendu aujourd&apos;hui"
        description="Abonnement automatique, portail client autonome, intégrations catalogue industrialisées, SLA contractuel et reporting multi-tenant complet ne sont pas encore exposés comme promesses commerciales."
      />

      <IncompleteDataWarning
        title="Une offre premium, mais factuelle"
        description="Cette page reste volontairement concrète : services compréhensibles, résultats attendus, et niveau de maturité assumé."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold">Ce que vous pouvez utiliser immédiatement</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <Link
            href="/explorer"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Explorer les produits
          </Link>
          <Link
            href="/projets"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Structurer un projet
          </Link>
          <Link
            href="/comparer"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Tester le comparateur
          </Link>
        </div>
      </div>
    </div>
  );
}
