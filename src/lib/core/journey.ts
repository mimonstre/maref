import type { Offer } from "./types";

type ProjectLike = {
  id: string;
  name: string;
  category: string;
  budget: string;
  objective: string;
};

type JourneyStage = "onboarding" | "project" | "exploration" | "comparison" | "decision";

type JourneyAction = {
  label: string;
  href: string;
};

export type UserJourney = {
  stage: JourneyStage;
  progress: number;
  title: string;
  description: string;
  hint: string;
  primaryAction: JourneyAction;
  secondaryAction?: JourneyAction;
  activeProjectId?: string;
  activeProjectName?: string;
};

function buildCompareHref(projectId: string, offers: Offer[]) {
  return "/comparer?project=" + projectId + "&ids=" + offers.map((offer) => offer.id).join(",");
}

export function deriveUserJourney(projects: ProjectLike[], projectOffers: Record<string, Offer[]>) {
  if (projects.length === 0) {
    return {
      stage: "onboarding",
      progress: 1,
      title: "Commencez par structurer votre besoin",
      description: "Creez un premier projet pour donner un contexte a vos recherches, votre budget et vos futures comparaisons.",
      hint: "Un projet MAREF transforme une simple recherche en decision pilotee.",
      primaryAction: { label: "Creer mon premier projet", href: "/projets" },
      secondaryAction: { label: "Explorer sans projet", href: "/explorer" },
    } satisfies UserJourney;
  }

  const projectEntries = projects.map((project) => ({
    project,
    offers: projectOffers[project.id] || [],
  }));

  const emptyProject = projectEntries.find((entry) => entry.offers.length === 0);
  if (emptyProject) {
    return {
      stage: "project",
      progress: 2,
      title: "Ajoutez vos premieres options au projet",
      description: "Votre projet " + emptyProject.project.name + " est cree. Il faut maintenant y ajouter des offres pour lancer l'analyse.",
      hint: "Commencez par 2 ou 3 offres proches de votre besoin pour obtenir une recommandation utile.",
      primaryAction: { label: "Explorer des offres", href: "/explorer" },
      secondaryAction: { label: "Voir le projet", href: "/projets" },
      activeProjectId: emptyProject.project.id,
      activeProjectName: emptyProject.project.name,
    } satisfies UserJourney;
  }

  const scoutingProject = projectEntries.find((entry) => entry.offers.length === 1);
  if (scoutingProject) {
    return {
      stage: "exploration",
      progress: 3,
      title: "Ajoutez une alternative credible",
      description: "Le projet " + scoutingProject.project.name + " contient une seule offre. Ajoutez au moins une alternative pour comparer serieusement.",
      hint: "Une decision fiable commence rarement par une seule option.",
      primaryAction: { label: "Ajouter une autre offre", href: "/explorer" },
      secondaryAction: { label: "Retour au projet", href: "/projets" },
      activeProjectId: scoutingProject.project.id,
      activeProjectName: scoutingProject.project.name,
    } satisfies UserJourney;
  }

  const comparisonProject =
    projectEntries.find((entry) => entry.offers.length === 2) ||
    projectEntries.find((entry) => entry.offers.length > 2);

  if (comparisonProject && comparisonProject.offers.length === 2) {
    return {
      stage: "comparison",
      progress: 4,
      title: "Vous pouvez maintenant comparer",
      description: "Le projet " + comparisonProject.project.name + " est assez mature pour une comparaison contextualisee.",
      hint: "Comparez avant d'ajouter trop d'options pour garder une decision lisible.",
      primaryAction: { label: "Comparer maintenant", href: buildCompareHref(comparisonProject.project.id, comparisonProject.offers) },
      secondaryAction: { label: "Ouvrir le projet", href: "/projets" },
      activeProjectId: comparisonProject.project.id,
      activeProjectName: comparisonProject.project.name,
    } satisfies UserJourney;
  }

  const decisionProject =
    projectEntries
      .filter((entry) => entry.offers.length >= 3)
      .sort((a, b) => b.offers.length - a.offers.length)[0] ||
    comparisonProject;

  return {
    stage: "decision",
    progress: 5,
    title: "Le projet est assez mature pour arbitrer",
    description: "Le projet " + decisionProject.project.name + " contient assez d'options pour passer a un arbitrage final plus rigoureux.",
    hint: "Comparez les compromis, puis retenez l'option la plus cohérente avec votre contexte plutôt que la plus flatteuse.",
    primaryAction: { label: "Voir la comparaison finale", href: buildCompareHref(decisionProject.project.id, decisionProject.offers) },
    secondaryAction: { label: "Revenir au projet", href: "/projets" },
    activeProjectId: decisionProject.project.id,
    activeProjectName: decisionProject.project.name,
  } satisfies UserJourney;
}
