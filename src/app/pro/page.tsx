"use client";

import Link from "next/link";
import { Building2, PanelTop, ShieldCheck } from "lucide-react";
import { IncompleteDataWarning, NoDataBlock } from "@/components/shared/Score";

const plannedCapabilities = [
  "Acces encadre a des analyses consolidees de catalogues",
  "Exports et vues partageables pour equipes produit ou achat",
  "Pilotage plus fin de la fiabilite et des sources de donnees",
];

export default function ProPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-center text-white shadow-lg">
        <span className="rounded-md bg-white/10 px-3 py-1 text-[0.7rem] font-bold">MAREF Pro</span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Programme professionnel en preparation</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
          Cette offre n est pas encore commercialisee. Nous ne montrons donc ni faux tarifs, ni faux clients, ni
          promesses d activation automatique.
        </p>
      </div>

      <NoDataBlock
        title="Aucune offre Pro publiquement ouverte"
        description="Si vous cherchez un produit B2B exploitable aujourd hui, cette page sert seulement a cadrer l intention. Aucun abonnement ni essai ne peut encore etre active depuis MAREF."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <PanelTop className="h-5 w-5 text-blue-700" />
          <h2 className="mt-3 font-bold">Etat actuel</h2>
          <p className="mt-2 text-sm text-gray-600">
            Le produit principal reste oriente utilisateur final et aide a la decision individuelle.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <Building2 className="h-5 w-5 text-blue-700" />
          <h2 className="mt-3 font-bold">Ce qui est envisage</h2>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            {plannedCapabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-blue-700" />
          <h2 className="mt-3 font-bold">Position de verite</h2>
          <p className="mt-2 text-sm text-gray-600">
            Toute future offre Pro devra etre adossee a des sources explicites, a des donnees auditees et a des
            conditions commerciales reelles avant d etre publiee ici.
          </p>
        </div>
      </div>

      <IncompleteDataWarning
        title="Page volontairement sobre"
        description="Les elements marketing avances ont ete retires car ils donnaient une impression de produit commercial pret alors que l infrastructure B2B n est pas encore livree."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold">Ce que vous pouvez faire maintenant</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <Link
            href="/"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Revenir a l accueil
          </Link>
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
            Travailler sur mes projets
          </Link>
        </div>
      </div>
    </div>
  );
}
