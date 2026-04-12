"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthRequiredPage from "@/components/auth/AuthRequiredPage";
import { useAuth } from "@/components/auth/AuthProvider";
import { ScoreCircle, Toast } from "@/components/shared/Score";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
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
  const { user, loading: authLoading } = useAuth();
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
      showMessage("Projet créé");
      await loadProjects();
    }

    setSaving(false);
  }

  async function handleDelete(projectId: string) {
    await deleteProject(projectId);
    setDeleteConfirm(null);
    showMessage("Projet supprimé");
    await loadProjects();
  }

  async function handleRemoveOffer(projectId: string, offerId: string) {
    await removeOfferFromProject(projectId, offerId);
    showMessage("Offre retirée du projet");
    await loadProjects();
  }

  const matureProjects = projects.filter((project) => (projectOffers[project.id] || []).length >= 2).length;
  const actionableProjects = projects.filter((project) => (projectOffers[project.id] || []).length > 0).length;

  if (authLoading || !user) {
    return (
      <AuthRequiredPage
        title="Projets réservés aux comptes connectés"
        description="Connectez-vous pour créer vos projets, suivre vos offres et reprendre vos arbitrages."
      />
    );
  }

  return (
    <div className="space-y-5">
      <Toast message={message} />

      <div className="rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Vos projets</h2>
            <p className="mt-1 text-sm text-blue-200">
              {projects.length} projet{projects.length > 1 ? "s" : ""} dont {actionableProjects} en analyse et {matureProjects} prêt
              {matureProjects > 1 ? "s" : ""} à comparer.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-950 shadow-sm transition-colors hover:bg-slate-100"
          >
            {showForm ? "Annuler" : "+ Créer"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/10 p-3 text-center">
            <p className="text-lg font-bold">{projects.length}</p>
            <p className="text-[0.65rem] text-blue-100">Projets</p>
          </div>
          <div className="rounded-lg bg-white/10 p-3 text-center">
            <p className="text-lg font-bold">{actionableProjects}</p>
            <p className="text-[0.65rem] text-blue-100">Avec offres</p>
          </div>
          <div className="rounded-lg bg-white/10 p-3 text-center">
            <p className="text-lg font-bold">{matureProjects}</p>
            <p className="text-[0.65rem] text-blue-100">Comparables</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="animate-fade-in-up space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Nom du projet *</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
              placeholder="Ex : Cuisine complète"
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Catégorie</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
              value={formCategory}
              onChange={(event) => setFormCategory(event.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
              <option>Général</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Budget cible</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
              placeholder="Ex : 2 000 EUR"
              value={formBudget}
              onChange={(event) => setFormBudget(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Objectif</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
              placeholder="Ex : Équiper la nouvelle cuisine"
              value={formObjective}
              onChange={(event) => setFormObjective(event.target.value)}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !formName.trim()}
            className="w-full rounded-xl bg-blue-950 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-slate-950 disabled:opacity-50"
          >
            {saving ? "Création..." : "Créer le projet"}
          </button>
        </div>
      )}

      <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 rounded-md bg-blue-950 px-2.5 py-0.5 text-[0.7rem] font-bold text-white shadow-sm">Mimo</span>
        <p className="mt-2 text-sm text-gray-800">
          Un projet devient vraiment utile quand l&apos;objectif est clair, le budget cohérent et les offres assez solides pour produire un arbitrage crédible.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-3 h-5 w-1/3 rounded bg-gray-200"></div>
              <div className="mb-2 h-3 w-2/3 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-3 text-3xl">📁</p>
          <h3 className="mb-1 font-bold text-gray-600">Aucun projet</h3>
          <p className="mb-4 text-sm text-gray-400">Créez votre premier projet pour transformer l&apos;exploration en vraie décision.</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-950"
          >
            + Créer un projet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const offers = projectOffers[project.id] || [];
            const analysis = projectAnalyses[project.id];

            return (
              <div key={project.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{project.name}</h3>
                    <p className="text-xs text-gray-500">
                      {project.category} - {project.budget || "Budget non défini"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis.averageScore > 0 && <ScoreCircle score={analysis.averageScore} />}
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (project.state === "En cours" ? "bg-blue-100 text-blue-950" : "bg-gray-100 text-gray-600")
                      }
                    >
                      {project.state}
                    </span>
                  </div>
                </div>

                {project.objective && <p className="mb-3 text-sm text-gray-600">{project.objective}</p>}

                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-[0.65rem] font-medium text-gray-500">Mimo</p>
                    <p className="mt-1 text-sm font-bold">
                      {analysis.decisionStage === "empty"
                        ? "Projet à structurer"
                        : analysis.decisionStage === "scoping"
                          ? "Projet en cadrage"
                          : analysis.decisionStage === "comparing"
                            ? "Projet en arbitrage"
                            : "Projet mûr pour décider"}
                    </p>
                    <p className="mt-1 text-[0.7rem] text-gray-500">
                      {analysis.decisionStage === "empty"
                        ? "Le projet n'a pas encore assez d'offres pour produire un avis utile."
                        : analysis.decisionStage === "scoping"
                          ? "Le projet prend forme, mais il manque encore de matière pour comparer proprement."
                          : analysis.decisionStage === "comparing"
                            ? "La short-list devient lisible. Les compromis commencent à être exploitables."
                            : "Le projet est assez mûr pour assumer une décision finale."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-[0.65rem] font-medium text-gray-500">Budget projet</p>
                    <p className="mt-1 text-sm font-bold">{analysis.budgetStatus}</p>
                    <p className="mt-1 text-[0.7rem] text-gray-500">
                      {analysis.budgetUsagePercent !== null
                        ? `${analysis.budgetUsagePercent}% du budget utilisé`
                        : "Ajoutez un budget pour piloter la recommandation"}
                    </p>
                  </div>
                </div>

                {offers.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-gray-50 p-2 text-center">
                      <p className="text-sm font-bold text-blue-950">{offers.length}</p>
                      <p className="text-[0.6rem] text-gray-500">Offres</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2 text-center">
                      <p className="text-sm font-bold text-blue-950">{analysis.averageScore}</p>
                      <p className="text-[0.6rem] text-gray-500">Score projet</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2 text-center">
                      <p className="text-sm font-bold text-blue-950">{analysis.totalPrice.toLocaleString("fr-FR")} EUR</p>
                      <p className="text-[0.6rem] text-gray-500">Total</p>
                    </div>
                  </div>
                )}

                {offers.length > 0 && (
                  <div className="mb-3 border-t border-gray-100 pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500">Offres du projet</p>
                      {offers.length >= 2 && (
                        <button
                          onClick={() => router.push("/comparer?project=" + project.id + "&ids=" + offers.map((offer) => offer.id).join(","))}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[0.7rem] font-semibold text-blue-950 transition-colors hover:bg-slate-200"
                        >
                          Comparaison contextualisée
                        </button>
                      )}
                    </div>
                    {analysis.rankedOffers.slice(0, 3).map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
                        <div
                          className="flex cursor-pointer items-center gap-2"
                          onClick={() => router.push("/explorer/" + offer.id)}
                        >
                          <span className="text-sm">{getCategoryIcon(offer.category)}</span>
                          <div>
                            <p className="text-sm font-medium transition-colors hover:text-blue-950">
                              {offer.brand} {offer.product}
                            </p>
                            <p className="text-xs text-gray-400">
                              {offer.merchant} - {offer.price.toLocaleString("fr-FR")} EUR
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreCircle score={offer.contextualScore} />
                          <button
                            onClick={() => handleRemoveOffer(project.id, offer.id)}
                            className="text-xs text-red-400 transition-colors hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push("/explorer")}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-blue-950 transition-colors hover:bg-slate-200"
                  >
                    + Ajouter des offres
                  </button>
                  {offers.length >= 2 && (
                    <button
                      onClick={() => router.push("/comparer?project=" + project.id + "&ids=" + offers.map((offer) => offer.id).join(","))}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-blue-950 transition-colors hover:bg-slate-200"
                    >
                      Comparer
                    </button>
                  )}
                  {deleteConfirm === project.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(project.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-100"
                    >
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
