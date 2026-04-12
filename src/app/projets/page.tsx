"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ScoreCircle, Toast } from "@/components/shared/Score";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
import { deriveUserJourney } from "@/lib/core";
import { analyzeProject } from "@/lib/projects/service";
import { useTimedMessage } from "@/lib/hooks/useTimedMessage";
import {
  createProject,
  deleteProject,
  getProjectsWithOffers,
  removeOfferFromProject,
  type Project,
  type ProjectOffer,
} from "@/features/projects/api";

export default function ProjetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { message, showMessage } = useTimedMessage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, ProjectOffer[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Gros electromenager");
  const [formBudget, setFormBudget] = useState("");
  const [formObjective, setFormObjective] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function loadProjects() {
    setLoading(true);
    const data = await getProjectsWithOffers();
    setProjects(data.projects);
    setProjectOffers(data.projectOffers);
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(loadProjects);
  }, []);

  const projectAnalyses = useMemo(
    () =>
      Object.fromEntries(
        projects.map((project) => [
          project.id,
          analyzeProject({
            projectId: project.id,
            projectName: project.name,
            projectCategory: project.category,
            projectBudget: project.budget,
            projectObjective: project.objective,
            existingOffers: projectOffers[project.id] || [],
          }),
        ]),
      ),
    [projectOffers, projects],
  );

  async function handleCreate() {
    if (!formName.trim()) return;

    setSaving(true);
    const success = await createProject({
      name: formName,
      category: formCategory,
      budget: formBudget,
      objective: formObjective,
      userId: user?.id || null,
    });

    if (success) {
      setFormName("");
      setFormBudget("");
      setFormObjective("");
      setShowForm(false);
      showMessage("Projet cree");
      await loadProjects();
    }

    setSaving(false);
  }

  async function handleDelete(projectId: string) {
    await deleteProject(projectId);
    setDeleteConfirm(null);
    showMessage("Projet supprime");
    await loadProjects();
  }

  async function handleRemoveOffer(projectId: string, offerId: string) {
    await removeOfferFromProject(projectId, offerId);
    showMessage("Offre retiree du projet");
    await loadProjects();
  }

  const matureProjects = projects.filter((project) => (projectOffers[project.id] || []).length >= 2).length;
  const actionableProjects = projects.filter((project) => (projectOffers[project.id] || []).length > 0).length;
  const journey = deriveUserJourney(projects, projectOffers);

  return (
    <div className="space-y-5">
      <Toast message={message} />

      <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Vos projets</h2>
            <p className="text-sm text-blue-200 mt-1">
              {projects.length} projet{projects.length > 1 ? "s" : ""} dont {actionableProjects} en analyse et {matureProjects} pret{matureProjects > 1 ? "s" : ""} a comparer.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm font-semibold bg-white text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            {showForm ? "Annuler" : "+ Creer"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold">{projects.length}</p>
            <p className="text-[0.65rem] text-blue-100">Projets</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold">{actionableProjects}</p>
            <p className="text-[0.65rem] text-blue-100">Avec offres</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold">{matureProjects}</p>
            <p className="text-[0.65rem] text-blue-100">Comparables</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-sm animate-fade-in-up">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nom du projet *</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" placeholder="Ex: Cuisine complete" value={formName} onChange={(event) => setFormName(event.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Categorie</label>
            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={formCategory} onChange={(event) => setFormCategory(event.target.value)}>
              {CATEGORIES.map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
              <option>General</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Budget cible</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" placeholder="Ex: 2 000 EUR" value={formBudget} onChange={(event) => setFormBudget(event.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Objectif</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" placeholder="Ex: Equiper la nouvelle cuisine" value={formObjective} onChange={(event) => setFormObjective(event.target.value)} />
          </div>
          <button onClick={handleCreate} disabled={saving || !formName.trim()} className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 text-sm shadow-md">
            {saving ? "Creation..." : "Creer le projet"}
          </button>
        </div>
      )}

      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-blue-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2">
          Un projet MAREF n est pas une simple liste. C est un cadre de decision avec budget, objectif, priorites et recommandation finale. Plus vous ajoutez d offres pertinentes, plus l analyse devient fiable.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-bold text-blue-700 uppercase tracking-wide">Etape actuelle</p>
            <h3 className="font-bold mt-1">{journey.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{journey.description}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold shrink-0">
            {journey.progress}/5
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: journey.progress * 20 + "%" }}></div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={() => router.push(journey.primaryAction.href)} className="text-xs font-semibold bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            {journey.primaryAction.label}
          </button>
          {journey.secondaryAction && (
            <button onClick={() => router.push(journey.secondaryAction.href)} className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:border-blue-300 transition-colors">
              {journey.secondaryAction.label}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
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
          <p className="text-sm text-gray-400 mb-4">Creez votre premier projet pour transformer l exploration en vraie decision.</p>
          <button onClick={() => setShowForm(true)} className="text-sm font-semibold bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            + Creer un projet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const offers = projectOffers[project.id] || [];
            const analysis = projectAnalyses[project.id];
            const bestOffer = analysis.bestOffer;

            return (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <p className="text-xs text-gray-500">{project.category} - {project.budget || "Budget non defini"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis.averageScore > 0 && <ScoreCircle score={analysis.averageScore} />}
                    <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + (project.state === "En cours" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600")}>
                      {project.state}
                    </span>
                  </div>
                </div>

                {project.objective && <p className="text-sm text-gray-600 mb-3">{project.objective}</p>}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[0.65rem] text-gray-500 font-medium">Etat de decision</p>
                    <p className="text-sm font-bold mt-1">
                      {analysis.decisionStage === "empty"
                        ? "Initialisation"
                        : analysis.decisionStage === "scoping"
                          ? "Cadrage"
                          : analysis.decisionStage === "comparing"
                            ? "Comparaison"
                            : "Arbitrage final"}
                    </p>
                    <p className="text-[0.7rem] text-gray-500 mt-1">{analysis.nextAction}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[0.65rem] text-gray-500 font-medium">Budget projet</p>
                    <p className="text-sm font-bold mt-1">{analysis.budgetStatus}</p>
                    <p className="text-[0.7rem] text-gray-500 mt-1">
                      {analysis.budgetUsagePercent !== null
                        ? analysis.budgetUsagePercent + "% du budget utilise"
                        : "Ajoutez un budget pour piloter la recommandation"}
                    </p>
                  </div>
                </div>

                {offers.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-blue-700">{offers.length}</p>
                      <p className="text-[0.6rem] text-gray-500">Offres</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-blue-700">{analysis.averageScore}</p>
                      <p className="text-[0.6rem] text-gray-500">Score projet</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-blue-700">{analysis.totalPrice.toLocaleString("fr-FR")} EUR</p>
                      <p className="text-[0.6rem] text-gray-500">Total</p>
                    </div>
                  </div>
                )}

                {bestOffer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                    <p className="text-[0.65rem] text-blue-700 font-medium">Recommandation projet</p>
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <div>
                        <p className="text-sm font-bold text-blue-900">{bestOffer.brand} {bestOffer.product}</p>
                        <p className="text-[0.7rem] text-blue-800">{bestOffer.merchant} - {bestOffer.price.toLocaleString("fr-FR")} EUR</p>
                      </div>
                      <ScoreCircle score={bestOffer.contextualScore} />
                    </div>
                  </div>
                )}

                <div className="relative bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-3 mb-3">
                  <span className="absolute -top-2 left-3 bg-blue-700 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded">Mimo</span>
                  <p className="text-xs text-gray-700 mt-2 leading-relaxed">{analysis.recommendation}</p>
                </div>

                {offers.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500">Offres du projet</p>
                      {offers.length >= 2 && (
                        <button
                          onClick={() => router.push("/comparer?project=" + project.id + "&ids=" + offers.map((offer) => offer.id).join(","))}
                          className="text-[0.7rem] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Comparaison contextualisee
                        </button>
                      )}
                    </div>
                    {analysis.rankedOffers.slice(0, 3).map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/explorer/" + offer.id)}>
                          <span className="text-sm">{getCategoryIcon(offer.category)}</span>
                          <div>
                            <p className="text-sm font-medium hover:text-blue-700 transition-colors">{offer.brand} {offer.product}</p>
                            <p className="text-xs text-gray-400">{offer.merchant} - {offer.price.toLocaleString("fr-FR")} EUR</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreCircle score={offer.contextualScore} />
                          <button onClick={() => handleRemoveOffer(project.id, offer.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => router.push("/explorer")} className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    + Ajouter des offres
                  </button>
                  {bestOffer && (
                    <button onClick={() => router.push("/explorer/" + bestOffer.id)} className="text-xs font-semibold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                      Voir le meilleur choix
                    </button>
                  )}
                  {offers.length >= 2 && (
                    <button onClick={() => router.push("/comparer?project=" + project.id + "&ids=" + offers.map((offer) => offer.id).join(","))} className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      Comparer
                    </button>
                  )}
                  {deleteConfirm === project.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(project.id)} className="text-xs font-medium text-white bg-red-500 px-3 py-1.5 rounded-lg">Confirmer</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">Annuler</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(project.id)} className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
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
