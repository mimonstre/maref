export type ProfileActivitySnapshot = {
  favorites: number;
  projects: number;
  topics: number;
  replies: number;
  comparisons: number;
  guideModulesCompleted: number;
};

export type ProfileTaskProgress = {
  id: string;
  label: string;
  category: string;
  xp: number;
  current: number;
  target: number;
  completed: boolean;
};

export type ProfileBadge = {
  id: string;
  name: string;
  description: string;
  completed: boolean;
};

const PROFILE_LEVELS = [
  { level: 1, name: "Niveau 1", xpNeeded: 0 },
  { level: 2, name: "Niveau 2", xpNeeded: 40 },
  { level: 3, name: "Niveau 3", xpNeeded: 90 },
  { level: 4, name: "Niveau 4", xpNeeded: 160 },
  { level: 5, name: "Niveau 5", xpNeeded: 240 },
];

const PROFILE_XP_RULES: Array<Omit<ProfileTaskProgress, "current" | "completed">> = [
  { id: "favorites-1", label: "Ajouter 1 favori", category: "Suivi", xp: 10, target: 1 },
  { id: "favorites-5", label: "Ajouter 5 favoris", category: "Suivi", xp: 20, target: 5 },
  { id: "projects-1", label: "Creer 1 projet", category: "Projets", xp: 20, target: 1 },
  { id: "projects-3", label: "Creer 3 projets", category: "Projets", xp: 30, target: 3 },
  { id: "comparisons-1", label: "Comparer 1 fois", category: "Analyse", xp: 15, target: 1 },
  { id: "comparisons-5", label: "Comparer 5 fois", category: "Analyse", xp: 30, target: 5 },
  { id: "guide-1", label: "Completer 1 module du guide", category: "Guide", xp: 15, target: 1 },
  { id: "forum-topic", label: "Publier 1 topic", category: "Forum", xp: 20, target: 1 },
  { id: "forum-reply", label: "Publier 3 reponses", category: "Forum", xp: 20, target: 3 },
];

const PROFILE_BADGE_RULES: Array<Omit<ProfileBadge, "completed"> & { isCompleted: (snapshot: ProfileActivitySnapshot) => boolean }> = [
  {
    id: "badge-first-project",
    name: "Premier projet",
    description: "Attribue lorsque vous creez votre premier projet.",
    isCompleted: (snapshot) => snapshot.projects >= 1,
  },
  {
    id: "badge-compare-5",
    name: "Comparateur",
    description: "Attribue apres 5 comparaisons reelles.",
    isCompleted: (snapshot) => snapshot.comparisons >= 5,
  },
  {
    id: "badge-guide",
    name: "Guide actif",
    description: "Attribue apres au moins 2 modules completes.",
    isCompleted: (snapshot) => snapshot.guideModulesCompleted >= 2,
  },
  {
    id: "badge-community",
    name: "Contributeur forum",
    description: "Attribue apres 1 topic et 3 reponses.",
    isCompleted: (snapshot) => snapshot.topics >= 1 && snapshot.replies >= 3,
  },
];

function readCurrentValue(snapshot: ProfileActivitySnapshot, taskId: string) {
  if (taskId.startsWith("favorites")) return snapshot.favorites;
  if (taskId.startsWith("projects")) return snapshot.projects;
  if (taskId.startsWith("comparisons")) return snapshot.comparisons;
  if (taskId.startsWith("guide")) return snapshot.guideModulesCompleted;
  if (taskId === "forum-topic") return snapshot.topics;
  if (taskId === "forum-reply") return snapshot.replies;
  return 0;
}

export function computeProfileProgress(snapshot: ProfileActivitySnapshot) {
  const tasks = PROFILE_XP_RULES.map((task) => {
    const current = readCurrentValue(snapshot, task.id);
    return {
      ...task,
      current,
      completed: current >= task.target,
    };
  });

  const totalXp = tasks.reduce((sum, task) => sum + (task.completed ? task.xp : 0), 0);
  const currentLevel = [...PROFILE_LEVELS].reverse().find((level) => totalXp >= level.xpNeeded) || PROFILE_LEVELS[0];
  const nextLevel = PROFILE_LEVELS.find((level) => level.level === currentLevel.level + 1) || null;
  const progressPercent = nextLevel
    ? Math.max(0, Math.min(100, ((totalXp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100))
    : 100;

  const badges = PROFILE_BADGE_RULES.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    completed: badge.isCompleted(snapshot),
  }));

  return {
    tasks,
    totalXp,
    currentLevel,
    nextLevel,
    progressPercent,
    badges,
  };
}

export function getProfileImpactText(priority: string) {
  if (priority === "Fiabilite") return "Votre priorite Fiabilite renforce Assurance et Stabilite dans le calcul contextualise.";
  if (priority === "Prix") return "Votre priorite Prix renforce l axe Economie dans le calcul contextualise.";
  if (priority === "Simplicite") return "Votre priorite Simplicite renforce Fluidite dans le calcul contextualise.";
  return "Vos preferences influencent le classement des offres uniquement a partir de donnees reelles disponibles.";
}
