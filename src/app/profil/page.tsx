"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getFavorites } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favCount, setFavCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [budget, setBudget] = useState("Modere");
  const [priority, setPriority] = useState("Fiabilite");
  const [horizon, setHorizon] = useState("3-5 ans");
  const [usage, setUsage] = useState("Usage quotidien");
  const [risk, setRisk] = useState("Prudent");

  useEffect(() => {
    async function load() {
      const favs = await getFavorites();
      setFavCount(favs.length);
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      setProjectCount(count || 0);
    }
    load();
  }, []);

  if (authLoading) return null;
  if (!user) { router.push("/login"); return null; }

  const userName = user.user_metadata?.name || "Utilisateur";
  const initials = userName.charAt(0).toUpperCase();
  const email = user.email || "";
  const joined = new Date(user.created_at || "").toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const badges = ["Premier score", "Explorateur", "Comparateur"];
  const level = 3;
  const grade = "Analyste";

  const impactText = priority === "Fiabilite"
    ? "Votre priorite Fiabilite renforce le poids des axes Assurance et Stabilite dans chaque score."
    : priority === "Prix"
    ? "Votre priorite Prix renforce le poids de l axe Economie dans chaque score."
    : "Votre profil equilibre les 5 axes PEFAS de maniere homogene.";

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white text-center shadow-lg">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mx-auto border-2 border-white/30">
          {initials}
        </div>
        <h2 className="text-xl font-bold mt-3">{userName}</h2>
        <p className="text-emerald-200 text-sm">{email}</p>
        <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg mt-3">
          <span className="text-sm">🏆</span>
          <span className="text-sm font-bold">{grade}</span>
          <span className="text-xs text-emerald-200">· Niveau {level}</span>
        </div>
        <div className="flex justify-center gap-2 flex-wrap mt-3">
          {badges.map((b) => (
            <span key={b} className="text-[0.65rem] font-medium bg-white/10 px-2 py-0.5 rounded-full">{b}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">{favCount}</p>
          <p className="text-[0.65rem] text-gray-500">Favoris</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">{projectCount}</p>
          <p className="text-[0.65rem] text-gray-500">Projets</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">12</p>
          <p className="text-[0.65rem] text-gray-500">Contributions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">4.2</p>
          <p className="text-[0.65rem] text-gray-500">Reputation</p>
        </div>
      </div>

      {/* Mimo */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2 leading-relaxed">
          {impactText} Avec un horizon de {horizon} et une tolerance {risk.toLowerCase()}, je calibre chaque recommandation pour correspondre a votre contexte.
        </p>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Vos preferences</h3>
          <button
            onClick={() => setEditing(!editing)}
            className={"text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors " + (editing ? "bg-gray-100 text-gray-600" : "text-emerald-700 border border-emerald-700 hover:bg-emerald-50")}
          >
            {editing ? "Annuler" : "Modifier"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Budget</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option>Serre</option>
                <option>Modere</option>
                <option>Confortable</option>
                <option>Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Priorite</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>Prix</option>
                <option>Fiabilite</option>
                <option>Simplicite</option>
                <option>Performance</option>
                <option>Durabilite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Usage</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={usage} onChange={(e) => setUsage(e.target.value)}>
                <option>Usage leger</option>
                <option>Usage quotidien</option>
                <option>Usage intensif</option>
                <option>Usage professionnel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Horizon</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                <option>1-2 ans</option>
                <option>3-5 ans</option>
                <option>5-8 ans</option>
                <option>8+ ans</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tolerance au risque</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={risk} onChange={(e) => setRisk(e.target.value)}>
                <option>Prudent</option>
                <option>Equilibre</option>
                <option>Audacieux</option>
              </select>
            </div>
            <button onClick={() => setEditing(false)} className="w-full bg-emerald-700 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors text-sm">
              Enregistrer
            </button>
          </div>
        ) : (
          <div>
            {[
              ["Budget", budget, "💰"],
              ["Usage", usage, "⚡"],
              ["Priorite", priority, "🎯"],
              ["Horizon", horizon, "📅"],
              ["Tolerance risque", risk, "🛡️"],
            ].map(([label, val, icon]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Impact */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-2">Impact sur les resultats</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Vos preferences modifient la ponderation des axes PEFAS et donc le classement des offres. Chaque modification de votre profil recalibre automatiquement les scores et les recommandations.
        </p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {[
            { key: "P", label: "Pert.", weight: priority === "Performance" ? "Fort" : "Normal" },
            { key: "E", label: "Eco.", weight: priority === "Prix" ? "Fort" : "Normal" },
            { key: "F", label: "Fluid.", weight: priority === "Simplicite" ? "Fort" : "Normal" },
            { key: "A", label: "Assur.", weight: priority === "Fiabilite" ? "Fort" : "Normal" },
            { key: "S", label: "Stab.", weight: priority === "Durabilite" ? "Fort" : "Normal" },
          ].map((a) => (
            <div key={a.key} className={"text-center p-2 rounded-lg border " + (a.weight === "Fort" ? "border-emerald-300 bg-emerald-50" : "border-gray-100 bg-gray-50")}>
              <p className="text-xs font-bold">{a.key}</p>
              <p className="text-[0.6rem] text-gray-500">{a.label}</p>
              <p className={"text-[0.6rem] font-semibold mt-0.5 " + (a.weight === "Fort" ? "text-emerald-700" : "text-gray-400")}>{a.weight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-3">Activite recente</h3>
        <div className="space-y-3">
          {[
            { icon: "🔍", text: "5 offres consultees cette semaine", time: "Aujourd hui" },
            { icon: "❤️", text: favCount + " offres en favoris", time: "Mis a jour" },
            { icon: "📁", text: projectCount + " projets en cours", time: "Actif" },
            { icon: "💬", text: "3 contributions au forum", time: "Cette semaine" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <span className="text-lg">{a.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.text}</p>
              </div>
              <span className="text-[0.7rem] text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/favoris" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">❤️</span>
          <span className="text-sm font-semibold">Mes favoris</span>
        </Link>
        <Link href="/projets" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">📁</span>
          <span className="text-sm font-semibold">Mes projets</span>
        </Link>
        <Link href="/assistant" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className="text-sm font-semibold">Assistant Mimo</span>
        </Link>
        <Link href="/forum" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="text-sm font-semibold">Forum</span>
        </Link>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-3">Compte</h3>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Email</span>
          <span className="text-sm font-medium">{email}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-gray-600">Membre depuis</span>
          <span className="text-sm font-medium">{joined}</span>
        </div>
      </div>
    </div>
  );
}