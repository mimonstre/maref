import { USER } from "@/lib/data";
import Link from "next/link";

export default function ProfilPage() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-700 text-white flex items-center justify-center text-2xl font-bold mx-auto">
          {USER.initials}
        </div>
        <h2 className="text-xl font-bold mt-3">{USER.name}</h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md bg-gradient-to-r from-emerald-700 to-emerald-600 text-white mt-2">
          {USER.grade} · Niveau {USER.level}
        </span>
        <div className="flex justify-center gap-1.5 flex-wrap mt-3">
          {USER.badges.map((b) => (
            <span key={b} className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">
          Votre profil influence chaque score. Budget {USER.budget.toLowerCase()}, priorite {USER.priority.toLowerCase()}, horizon {USER.horizon} : je pondere les axes en consequence pour vous donner des resultats personnalises.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm mb-3">Vos preferences</h3>
        {[
          ["Budget", USER.budget],
          ["Usage", USER.usage],
          ["Priorite", USER.priority],
          ["Horizon", USER.horizon],
          ["Tolerance risque", USER.risk],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{val}</span>
          </div>
        ))}
        <button className="mt-3 text-sm font-semibold text-emerald-700 border border-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
          Modifier mes preferences
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm mb-3">Activite et Communaute</h3>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-sm">Contributions</span>
          <span className="font-bold">{USER.contributions}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-sm">Reputation</span>
          <span className="font-bold">{USER.reputation}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm mb-2">Impact sur les resultats</h3>
        <p className="text-sm text-gray-600">
          Vos preferences modifient la ponderation des axes PEFAS et donc le classement des offres. Un profil Fiabilite + Prudent augmente le poids de l Assurance et de la Stabilite.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/" className="text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-emerald-300 transition-colors">
          Favoris
        </Link>
        <Link href="/" className="text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-emerald-300 transition-colors">
          Historique
        </Link>
        <Link href="/" className="text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-emerald-300 transition-colors">
          Parametres
        </Link>
      </div>
    </div>
  );
}