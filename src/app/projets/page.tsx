"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { getOffers } from "@/lib/queries";
import type { Offer } from "@/lib/data";

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  return (
    <div className={"w-10 h-10 text-sm " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0"}>
      {score}
    </div>
  );
}

type Project = {
  id: string;
  name: string;
  category: string;
  budget: string;
  state: string;
  objective: string;
  created_at: string;
};

export default function ProjetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Electromenager");
  const [formBudget, setFormBudget] = useState("");
  const [formObjective, setFormObjective] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate() {
    if (!formName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("projects").insert({
      name: formName,
      category: formCategory,
      budget: formBudget || "A definir",
      state: "En cours",
      objective: formObjective,
      user_id: user?.id || null,
    });
    if (!error) {
      setFormName("");
      setFormBudget("");
      setFormObjective("");
      setShowForm(false);
      await loadProjects();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("project_offers").delete().eq("project_id", id);
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vos projets</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
        >
          {showForm ? "Annuler" : "+ Creer"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 animate-fade-in-up">
          <div>
            <label className="block text-sm font-semibold mb-1">Nom du projet</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600"
              placeholder="Ex: Cuisine complete"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Categorie</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              <option>Electromenager</option>
              <option>Froid</option>
              <option>Televiseurs</option>
              <option>General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Budget</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600"
              placeholder="Ex: 2 000 EUR"
              value={formBudget}
              onChange={(e) => setFormBudget(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Objectif</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600"
              placeholder="Ex: Equiper la nouvelle cuisine"
              value={formObjective}
              onChange={(e) => setFormObjective(e.target.value)}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !formName.trim()}
            className="w-full bg-emerald-700 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? "Creation..." : "Creer le projet"}
          </button>
        </div>
      )}

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
        <span className="absolute -top-2 left-3 bg-emerald-700 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded">Mimo</span>
        <p className="text-sm text-gray-800 mt-1">
          Vos projets structurent vos decisions. Creez un projet, ajoutez des offres depuis l explorateur, et comparez-les pour faire le meilleur choix.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📁</p>
          <h3 className="font-bold text-gray-600 mb-1">Aucun projet</h3>
          <p className="text-sm text-gray-400">Creez votre premier projet pour structurer vos decisions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.category} · {p.budget}</p>
                </div>
                <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full " + (p.state === "En cours" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600")}>
                  {p.state}
                </span>
              </div>
              {p.objective && <p className="text-sm text-gray-600 mb-3">{p.objective}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/explorer")}
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  + Ajouter des offres
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}