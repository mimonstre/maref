"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  name: string;
  category: string;
  budget: string;
  state: string;
  objective: string;
  created_at: string;
};

type ProjectOffer = {
  id: string;
  product: string;
  brand: string;
  price: number;
  score: number;
  category: string;
  merchant: string;
};

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 85 ? "bg-emerald-700" : score >= 72 ? "bg-emerald-600" : score >= 58 ? "bg-lime-600" : score >= 42 ? "bg-yellow-500" : score >= 25 ? "bg-orange-500" : "bg-red-600";
  return (
    <div className={"w-10 h-10 text-sm " + color + " rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"}>
      {score}
    </div>
  );
}

export default function ProjetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, ProjectOffer[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Electromenager");
  const [formBudget, setFormBudget] = useState("");
  const [formObjective, setFormObjective] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadProjects() {
    setLoading(true);
    const { data: projData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (projData) {
      setProjects(projData);
      const offersMap: Record<string, ProjectOffer[]> = {};
      for (const p of projData) {
        const { data: poData } = await supabase
          .from("project_offers")
          .select("offer_id")
          .eq("project_id", p.id);
        if (poData && poData.length > 0) {
          const offerIds = poData.map((po: { offer_id: string }) => po.offer_id);
          const { data: offersData } = await supabase
            .from("offers")
            .select("id, product, brand, price, score, category, merchant")
            .in("id", offerIds);
          if (offersData) offersMap[p.id] = offersData;
        } else {
          offersMap[p.id] = [];
        }
      }
      setProjectOffers(offersMap);
    }
    setLoading(false);
  }

  useEffect(() => { loadProjects(); }, []);

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
      setFormName(""); setFormBudget(""); setFormObjective("");
      setShowForm(false);
      setMessage("Projet cree");
      setTimeout(() => setMessage(""), 2000);
      await loadProjects();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("project_offers").delete().eq("project_id", id);
    await supabase.from("projects").delete().eq("id", id);
    setDeleteConfirm(null);
    setMessage("Projet supprime");
    setTimeout(() => setMessage(""), 2000);
    await loadProjects();
  }

  async function removeOfferFromProject(projectId: string, offerId: string) {
    await supabase.from("project_offers").delete().eq("project_id", projectId).eq("offer_id", offerId);
    setMessage("Offre retiree du projet");
    setTimeout(() => setMessage(""), 2000);
    await loadProjects();
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {message && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          {message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Vos projets</h2>
          <p className="text-sm text-gray-500">{projects.length} projet{projects.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
        >
          {showForm ? "Annuler" : "+ Creer"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-sm animate-fade-in-up">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nom du projet *</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" placeholder="Ex: Cuisine complete" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Categorie</label>
            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              <option>Electromenager</option>
              <option>Froid</option>
              <option>Televiseurs</option>
              <option>General</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Budget</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" placeholder="Ex: 2 000 EUR" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Objectif</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" placeholder="Ex: Equiper la nouvelle cuisine" value={formObjective} onChange={(e) => setFormObjective(e.target.value)} />
          </div>
          <button onClick={handleCreate} disabled={saving || !formName.trim()} className="w-full bg-emerald-700 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm shadow-md">
            {saving ? "Creation..." : "Creer le projet"}
          </button>
        </div>
      )}

      {/* Mimo */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2">
          Vos projets structurent vos decisions. Creez un projet, explorez les offres, et ajoutez-les depuis les fiches produit pour construire votre analyse.
        </p>
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📁</p>
          <h3 className="font-bold text-gray-600 mb-1">Aucun projet</h3>
          <p className="text-sm text-gray-400 mb-4">Creez votre premier projet pour structurer vos decisions.</p>
          <button onClick={() => setShowForm(true)} className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
            + Creer un projet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const offers = projectOffers[p.id] || [];
            const avgScore = offers.length > 0 ? Math.round(offers.reduce((sum, o) => sum + o.score, 0) / offers.length) : 0;
            const totalPrice = offers.reduce((sum, o) => sum + o.price, 0);

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.category} · {p.budget}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {avgScore > 0 && <ScoreCircle score={avgScore} />}
                    <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + (p.state === "En cours" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600")}>
                      {p.state}
                    </span>
                  </div>
                </div>

                {p.objective && <p className="text-sm text-gray-600 mb-3">{p.objective}</p>}

                {/* Stats */}
                {offers.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-emerald-700">{offers.length}</p>
                      <p className="text-[0.6rem] text-gray-500">Offres</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-emerald-700">{avgScore}</p>
                      <p className="text-[0.6rem] text-gray-500">Score moy.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-emerald-700">{totalPrice.toLocaleString("fr-FR")} EUR</p>
                      <p className="text-[0.6rem] text-gray-500">Total</p>
                    </div>
                  </div>
                )}

                {/* Offers list */}
                {offers.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Offres du projet</p>
                    {offers.map((o) => (
                      <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/explorer/" + o.id)}>
                          <span className="text-sm">{o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}</span>
                          <div>
                            <p className="text-sm font-medium hover:text-emerald-700 transition-colors">{o.brand} {o.product}</p>
                            <p className="text-xs text-gray-400">{o.merchant} · {o.price.toLocaleString("fr-FR")} EUR</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreCircle score={o.score} />
                          <button onClick={() => removeOfferFromProject(p.id, o.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => router.push("/explorer")} className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                    + Ajouter des offres
                  </button>
                  {offers.length >= 2 && (
                    <button onClick={() => router.push("/comparer")} className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      Comparer
                    </button>
                  )}
                  {deleteConfirm === p.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-white bg-red-500 px-3 py-1.5 rounded-lg">Confirmer</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">Annuler</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(p.id)} className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}