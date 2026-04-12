"use client";

import Link from "next/link";
import { Building2, FolderKanban, PanelTop, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { IncompleteDataWarning, MimoCard, NoDataBlock } from "@/components/shared/Score";

const realServices = [
  {
    title: "Audit de parcours décisionnel",
    description:
      "Cadrage du besoin, priorisation des critères et structure projet pour éviter les comparaisons floues ou trop larges.",
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
      "Création de short-lists projet, scénarios d’arbitrage et restitution claire pour une équipe, un foyer ou un décideur.",
    icon: <FolderKanban className="h-5 w-5 text-blue-700" />,
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
              Une offre orientée accompagnement décisionnel, pas une promesse marketing vide.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100/90 md:text-base">
              MAREF Pro peut déjà servir à cadrer un besoin, organiser des comparatifs plus sérieux, fiabiliser des fiches
              produits et structurer une décision plus défendable. Cette page ne montre que des usages réellement cohérents
              avec le produit actuel.
            </p>
          </div>

          <div className="premium-surface rounded-[28px] p-5 text-slate-900">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Position actuelle</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Offre d’accompagnement crédible</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pas d’abonnement fictif, pas de faux clients, pas de SLA inventé. MAREF Pro est présenté comme une capacité
              d’accompagnement et d’outillage, pas comme un SaaS enterprise déjà industrialisé.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {realServices.map((service) => (
          <div key={service.title} className="premium-card rounded-[26px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
              {service.icon}
            </div>
            <h2 className="mt-4 text-base font-bold text-slate-950">{service.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <MimoCard text="MAREF Pro a du sens quand il sert à rendre une décision plus claire, plus traçable et plus argumentée. Il ne doit pas être présenté comme une plateforme enterprise complète tant que la collecte et l’administration des données réelles ne sont pas industrialisées." />

        <div className="premium-surface rounded-[30px] p-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Ce qui est réellement prêt</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Structurer un parcours projet puis filtrer, comparer et arbitrer par famille.</li>
            <li>Produire une lecture PEFAS plus lisible et plus défendable.</li>
            <li>Afficher le niveau de fiabilité et refuser les analyses quand la donnée manque.</li>
            <li>Créer une base catalogue plus propre à condition d’alimenter de vraies sources.</li>
          </ul>
        </div>
      </section>

      <NoDataBlock
        title="Ce qui n’est pas encore vendu comme service produit"
        description="Abonnement automatique, portail client autonome, intégrations catalogue industrialisées, SLA contractuel et reporting multi-tenant complet ne sont pas encore exposés comme promesses commerciales."
      />

      <IncompleteDataWarning
        title="Pro restera volontairement sobre"
        description="Cette page restera factuelle tant que les flux de données réelles, l’administration des comptes et la prestation associée ne sont pas suffisamment cadrés."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold">Ce que vous pouvez utiliser immédiatement</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <Link
            href="/explorer"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Explorer les offres
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
