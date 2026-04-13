"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartColumnIncreasing,
  Crosshair,
  Eye,
  Gauge,
  Layers3,
  Radar,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const differentiators = [
  {
    title: "Pas un cabinet classique",
    body: "MAREF ne livre pas un PDF figé après quelques interviews. Il transforme une décision d'achat en lecture exploitable, réutilisable et itérable.",
  },
  {
    title: "Pas un dashboard décoratif",
    body: "MAREF ne s'arrête pas aux volumes, parts de voix ou benchmarks génériques. Il cherche à expliquer pourquoi une offre gagne, perd ou n'entre même pas dans la décision.",
  },
  {
    title: "Pas un benchmark hors contexte",
    body: "MAREF lit le produit, l'offre, le marchand, le contexte projet et les critères réels d'arbitrage au même endroit.",
  },
];

const businessProblems = [
  "Vous ne savez pas pourquoi certains produits sont ignorés malgré un bon prix.",
  "Vos équipes lisent des données produit, mais pas la logique réelle de décision.",
  "Les outils actuels montrent des volumes ou des taux, sans expliquer ce qui convainc réellement.",
  "Vous perdez de l'argent sur des offres mal cadrées, mal présentées ou mal arbitrées.",
];

const services = [
  {
    name: "Diagnostic Décisionnel",
    price: "49 €",
    problem: "Comprendre ce qui brouille ou ralentit une décision produit.",
    output: "Lecture synthétique des angles de friction, critères manquants et signaux faibles.",
    why: "Vous voyez immédiatement où la décision se casse ou se dilue.",
  },
  {
    name: "Duel Concurrentiel",
    price: "149 €",
    problem: "Comparer deux références rivales sans bruit inutile.",
    output: "Lecture PEFAS, écart d'offre, angle de conviction et arbitrage final.",
    why: "Vous comprenez pourquoi une référence prend l'avantage sur l'autre.",
  },
  {
    name: "Projection Projet",
    price: "99 €",
    problem: "Tester une offre dans un scénario d'achat réel.",
    output: "Projection budget, cohérence de shortlist et rôle de l'offre dans la décision.",
    why: "Vous lisez une offre dans un vrai cadre, pas en abstraction.",
  },
  {
    name: "Analyse de Perte de Choix",
    price: "149 €",
    problem: "Identifier pourquoi une offre n'entre pas dans la shortlist.",
    output: "Lecture des points de rupture, pertes de confiance et causes d'exclusion.",
    why: "Vous savez ce qui fait perdre une décision avant même la comparaison finale.",
  },
  {
    name: "Radar de Conviction Produit",
    price: "Sur devis",
    problem: "Visualiser les zones qui portent ou affaiblissent la décision.",
    output: "Radar d'intensité décisionnelle par axe, promesse et clarté marchande.",
    why: "Vous voyez vite où votre produit convainc, hésite ou décroche.",
  },
  {
    name: "Simulation d'Arbitrage",
    price: "Sur devis",
    problem: "Observer comment une offre réagit selon plusieurs contextes d'achat.",
    output: "Variantes d'arbitrage selon budget, objectif, foyer et priorités.",
    why: "Vous testez plusieurs lectures réelles au lieu d'un seul cas théorique.",
  },
  {
    name: "Stress Test d'Offre",
    price: "199 €",
    problem: "Mesurer la robustesse d'une offre quand la décision devient exigeante.",
    output: "Points de fragilité, risques de rejet et zones de tension.",
    why: "Vous sécurisez ce qui peut réellement faire perdre la décision.",
  },
  {
    name: "Lecture Mimo Pro",
    price: "Sur devis",
    problem: "Obtenir une reformulation claire d'une décision complexe.",
    output: "Lecture rédigée, objections probables, axes forts et faibles, synthèse exploitable.",
    why: "Vous rendez la décision compréhensible pour un décideur, une équipe ou un client.",
  },
  {
    name: "Priorisation d'Amélioration",
    price: "Sur devis",
    problem: "Savoir quoi corriger en premier sur une offre ou une fiche.",
    output: "Plan d'amélioration ordonné par impact décisionnel.",
    why: "Vous arrêtez de corriger au hasard.",
  },
  {
    name: "Watchtower Concurrentielle",
    price: "Sur devis",
    problem: "Surveiller comment votre offre se positionne face aux alternatives visibles.",
    output: "Veille ciblée, lecture d'écarts et alertes d'affaiblissement décisionnel.",
    why: "Vous gardez un œil sur la pression concurrentielle qui compte vraiment.",
  },
  {
    name: "Pack Lancement Produit",
    price: "299 €",
    problem: "Lancer une offre sans angle décisionnel lisible.",
    output: "Lecture d'entrée, duel de référence, stress test et priorités d'amélioration.",
    why: "Vous lancez avec un cadre clair plutôt qu'avec des hypothèses fragiles.",
  },
  {
    name: "API de Lecture Décisionnelle",
    price: "Sur devis",
    problem: "Injecter la logique MAREF dans un flux produit externe.",
    output: "Lecture PEFAS, score, signaux de fiabilité et réponses décisionnelles exposées par API.",
    why: "Vous branchez MAREF à votre propre écosystème.",
  },
  {
    name: "Console Multi-Offres",
    price: "Sur devis",
    problem: "Suivre plusieurs offres ou familles dans une même logique d'analyse.",
    output: "Vue consolidée, regroupement par famille et lecture comparative pilotée.",
    why: "Vous gardez une vue claire quand les cas se multiplient.",
  },
  {
    name: "Score-as-a-Service",
    price: "Sur devis",
    problem: "Standardiser la lecture d'offres à grande échelle.",
    output: "Score MAREF calculé, axes PEFAS et couche de fiabilité exploitable dans vos systèmes.",
    why: "Vous industrialisez une lecture cohérente au lieu de bricoler des scores maison.",
  },
  {
    name: "Decision Room",
    price: "Sur devis",
    problem: "Arbitrer à plusieurs autour d'une même shortlist.",
    output: "Espace de décision partagé, vue projet, duel, synthèse et arbitrage final.",
    why: "Vous rendez la décision collective plus rapide et plus défendable.",
  },
];

const packages = [
  {
    name: "Pulse",
    price: "99 €/mois",
    description: "Entrée simple pour poser une lecture décisionnelle utile sur des cas ponctuels.",
    includes: ["1 à 2 diagnostics par mois", "Duel concurrentiel ciblé", "Lecture Mimo Pro légère"],
  },
  {
    name: "Operator",
    price: "349 €/mois",
    description: "Pilotage métier pour suivre plusieurs produits, offres et arbitrages réels.",
    includes: ["Suivi multi-cas", "Projection projet", "Stress test et priorisation d'amélioration"],
  },
  {
    name: "Core",
    price: "990 à 2 500 €/mois",
    description: "Intégration profonde de la lecture décisionnelle dans vos flux produit et vos équipes.",
    includes: ["API de lecture décisionnelle", "Console multi-offres", "Decision Room et accompagnement Core"],
  },
];

const premiumInputs = [
  "Votre produit, votre offre ou votre shortlist",
  "Votre contexte : budget, objectif, cible, pression concurrentielle",
  "Les alternatives visibles ou les offres déjà suivies",
];

const premiumComputes = [
  "Lecture PEFAS et axes de conviction",
  "Fragilités d'offre, signaux de perte de choix et stress test",
  "Lecture Mimo Pro pour reformuler la décision",
];

const premiumOutputs = [
  "Pourquoi une offre gagne, perd ou se fait ignorer",
  "Ce qu'il faut corriger en priorité",
  "Ce qui peut être décidé immédiatement",
];

export default function ProPage() {
  return (
    <div className="space-y-6">
      <section className="premium-hero rounded-[36px] px-6 py-8 text-white md:px-10 md:py-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-blue-100">
              <Building2 className="h-3.5 w-3.5" />
              MAREF Pro
            </div>
            <h1 className="section-title mt-5 text-4xl font-black tracking-tight md:text-6xl">
              Comprendre pourquoi un produit est choisi, ignoré ou rejeté dans une décision réelle.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100/90 md:text-base">
              MAREF n&apos;est ni un cabinet classique, ni un dashboard générique, ni un benchmark décoratif. C&apos;est un moteur de vérité décisionnelle appliqué à l&apos;achat.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/assistant" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-950 shadow-[0_18px_36px_rgba(255,255,255,0.18)] transition-all hover:translate-y-[-1px]">
                Parler à Mimo Pro
              </Link>
              <Link href="/explorer" className="rounded-2xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14">
                Tester un diagnostic
              </Link>
            </div>
          </div>

          <div className="premium-surface rounded-[30px] p-6 text-slate-900">
            <p className="section-kicker">Pourquoi c&apos;est nouveau</p>
            <h2 className="section-title mt-2 text-2xl font-black text-slate-950">MAREF ne mesure pas seulement un marché. Il lit une décision.</h2>
            <div className="mt-4 space-y-3">
              {differentiators.map((item) => (
                <div key={item.title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="premium-surface rounded-[32px] p-6">
          <p className="section-kicker">Le problème côté entreprise</p>
          <h2 className="section-title mt-2 text-3xl font-black text-slate-950">Vos outils actuels décrivent des signaux. Ils n&apos;expliquent pas la décision.</h2>
          <div className="mt-5 space-y-3">
            {businessProblems.map((problem) => (
              <div key={problem} className="flex items-start gap-3 rounded-[22px] bg-slate-50 px-4 py-3">
                <SearchCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-900" />
                <p className="text-sm leading-6 text-slate-700">{problem}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="premium-card rounded-[28px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
              <Gauge className="h-5 w-5 text-blue-900" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">Lecture décisionnelle</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              MAREF montre où une décision se construit, se renforce ou se perd.
            </p>
          </div>
          <div className="premium-card rounded-[28px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
              <Radar className="h-5 w-5 text-blue-900" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">Modèle PEFAS</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Une lecture structurée de la pertinence, de l&apos;économie, de la fluidité, de l&apos;assurance et du signal.
            </p>
          </div>
          <div className="premium-card rounded-[28px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
              <Bot className="h-5 w-5 text-blue-900" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">Mimo Pro</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Une couche d&apos;interprétation capable d&apos;expliquer la décision, pas seulement de résumer une fiche.
            </p>
          </div>
          <div className="premium-card rounded-[28px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-blue-50">
              <Layers3 className="h-5 w-5 text-blue-900" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">Logique projet</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Une offre n&apos;est jamais lue seule. MAREF la replace dans un contexte d&apos;usage, de budget et de shortlist.
            </p>
          </div>
        </div>
      </section>

      <section className="premium-surface rounded-[32px] p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Services</p>
            <h2 className="section-title mt-2 text-3xl font-black text-slate-950">Un catalogue clair de services décisionnels.</h2>
          </div>
          <div className="rounded-[22px] bg-slate-100 px-4 py-2 text-sm font-semibold text-blue-950">
            Valeur business lisible
          </div>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {services.map((service) => (
            <div key={service.name} className="premium-card rounded-[28px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-slate-950">{service.name}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-950">{service.price}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-2.5">
                  <Sparkles className="h-4 w-4 text-blue-900" />
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6">
                <div>
                  <p className="font-bold text-slate-900">Problème résolu</p>
                  <p className="text-slate-600">{service.problem}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Output concret</p>
                  <p className="text-slate-600">{service.output}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Pourquoi c&apos;est utile</p>
                  <p className="text-slate-600">{service.why}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-surface rounded-[32px] p-6">
          <p className="section-kicker">Expérience client</p>
          <h2 className="section-title mt-2 text-3xl font-black text-slate-950">Ce que le client entre. Ce que MAREF calcule. Ce qu&apos;il peut décider.</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="premium-card rounded-[26px] p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[18px] bg-blue-50">
                <BriefcaseBusiness className="h-4 w-4 text-blue-900" />
              </div>
              <p className="text-sm font-bold text-slate-950">Ce que le client entre</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {premiumInputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="premium-card rounded-[26px] p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[18px] bg-blue-50">
                <ChartColumnIncreasing className="h-4 w-4 text-blue-900" />
              </div>
              <p className="text-sm font-bold text-slate-950">Ce que MAREF calcule</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {premiumComputes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="premium-card rounded-[26px] p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[18px] bg-blue-50">
                <Crosshair className="h-4 w-4 text-blue-900" />
              </div>
              <p className="text-sm font-bold text-slate-950">Ce qu&apos;il comprend et décide</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {premiumOutputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="premium-surface rounded-[32px] p-6">
          <p className="section-kicker">Différenciation radicale</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="font-bold text-slate-950">Plus rapide</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Parce que MAREF met directement la décision au centre, au lieu de produire une couche supplémentaire de reporting.</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="font-bold text-slate-950">Plus utile</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Parce que la sortie n&apos;est pas seulement descriptive. Elle permet d&apos;agir, corriger, arbitrer ou repositionner immédiatement.</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="font-bold text-slate-950">Non comparable</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Parce que MAREF lit une décision réelle. Pas uniquement un produit, un prix ou un benchmark concurrentiel hors contexte.</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="font-bold text-slate-950">Pas du conseil classique</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Parce que le moteur reste réutilisable, outillé et plus proche d&apos;un produit SaaS premium que d&apos;une mission ponctuelle isolée.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-surface rounded-[32px] p-6">
        <div className="mb-5">
          <p className="section-kicker">Packaging</p>
          <h2 className="section-title mt-2 text-3xl font-black text-slate-950">Trois niveaux de relation avec MAREF.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((plan) => (
            <div key={plan.name} className="premium-card rounded-[30px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-slate-950">{plan.name}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-950">{plan.price}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-2.5">
                  <Workflow className="h-4 w-4 text-blue-900" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-900" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Link href="/assistant" className="premium-card hover-lift rounded-[26px] p-5">
          <Bot className="h-5 w-5 text-blue-900" />
          <p className="mt-4 text-sm font-bold text-slate-950">Parler à Mimo Pro</p>
          <p className="mt-2 text-sm text-slate-600">Obtenir une première lecture conversationnelle.</p>
        </Link>
        <Link href="/explorer" className="premium-card hover-lift rounded-[26px] p-5">
          <Activity className="h-5 w-5 text-blue-900" />
          <p className="mt-4 text-sm font-bold text-slate-950">Tester un diagnostic</p>
          <p className="mt-2 text-sm text-slate-600">Entrer dans le moteur produit et lire un cas réel.</p>
        </Link>
        <Link href="/comparer" className="premium-card hover-lift rounded-[26px] p-5">
          <Eye className="h-5 w-5 text-blue-900" />
          <p className="mt-4 text-sm font-bold text-slate-950">Voir un duel concurrentiel</p>
          <p className="mt-2 text-sm text-slate-600">Comparer deux ou trois offres dans un cadre clair.</p>
        </Link>
        <Link href="/projets" className="premium-card hover-lift rounded-[26px] p-5">
          <Layers3 className="h-5 w-5 text-blue-900" />
          <p className="mt-4 text-sm font-bold text-slate-950">Demander une démo</p>
          <p className="mt-2 text-sm text-slate-600">Voir un projet structuré avec lecture décisionnelle.</p>
        </Link>
        <Link href="/assistant" className="premium-card hover-lift rounded-[26px] p-5">
          <ArrowRight className="h-5 w-5 text-blue-900" />
          <p className="mt-4 text-sm font-bold text-slate-950">Accéder à Core</p>
          <p className="mt-2 text-sm text-slate-600">Discuter d&apos;une intégration profonde ou d&apos;un pilotage métier.</p>
        </Link>
      </section>
    </div>
  );
}
