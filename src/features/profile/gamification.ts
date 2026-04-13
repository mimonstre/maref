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

export type SeasonalBadge = ProfileBadge & {
  periodLabel: string;
  activeNow: boolean;
};

const PROFILE_LEVELS = [
  { level: 1, name: "Éclaireur", xpNeeded: 0 },
  { level: 2, name: "Analyste", xpNeeded: 40 },
  { level: 3, name: "Décideur", xpNeeded: 90 },
  { level: 4, name: "Arbitre", xpNeeded: 160 },
  { level: 5, name: "Référence", xpNeeded: 240 },
];

const PROFILE_XP_RULES: Array<Omit<ProfileTaskProgress, "current" | "completed">> = [
  { id: "favorites-1", label: "Ajouter 1 favori", category: "Suivi", xp: 10, target: 1 },
  { id: "favorites-5", label: "Ajouter 5 favoris", category: "Suivi", xp: 20, target: 5 },
  { id: "projects-1", label: "Créer 1 projet", category: "Projets", xp: 20, target: 1 },
  { id: "projects-3", label: "Créer 3 projets", category: "Projets", xp: 30, target: 3 },
  { id: "comparisons-1", label: "Lancer 1 comparaison", category: "Analyse", xp: 15, target: 1 },
  { id: "comparisons-5", label: "Lancer 5 comparaisons", category: "Analyse", xp: 30, target: 5 },
  { id: "guide-1", label: "Valider 1 module du guide", category: "Guide", xp: 15, target: 1 },
  { id: "forum-topic", label: "Publier 1 topic", category: "Forum", xp: 20, target: 1 },
  { id: "forum-reply", label: "Publier 3 réponses", category: "Forum", xp: 20, target: 3 },
];

const PROFILE_BADGE_RULES: Array<Omit<ProfileBadge, "completed"> & { isCompleted: (snapshot: ProfileActivitySnapshot) => boolean }> = [
  {
    id: "badge-first-project",
    name: "Premier projet",
    description: "Attribué dès la création du premier projet.",
    isCompleted: (snapshot) => snapshot.projects >= 1,
  },
  {
    id: "badge-compare-5",
    name: "Comparateur actif",
    description: "Attribué après 5 comparaisons réelles.",
    isCompleted: (snapshot) => snapshot.comparisons >= 5,
  },
  {
    id: "badge-guide",
    name: "Montée en compétence",
    description: "Attribué après 2 modules du guide validés.",
    isCompleted: (snapshot) => snapshot.guideModulesCompleted >= 2,
  },
  {
    id: "badge-community",
    name: "Contributeur",
    description: "Attribué après 1 topic et 3 réponses utiles.",
    isCompleted: (snapshot) => snapshot.topics >= 1 && snapshot.replies >= 3,
  },
];

const SEASONAL_BADGES: Array<{
  id: string;
  name: string;
  description: string;
  periodLabel: string;
  months: number[];
}> = [
  { id: "season-winter-sales", name: "Soldes d’hiver", description: "Période idéale pour comparer au lieu de subir l’urgence promo.", periodLabel: "Janvier • Février", months: [0, 1] },
  { id: "season-valentine", name: "Saint-Valentin", description: "Saison courte pour les achats cadeaux où la rapidité ne doit pas écraser la qualité.", periodLabel: "Février", months: [1] },
  { id: "season-easter", name: "Pâques", description: "Repère printanier pour les achats maison et renouvellements d’équipement.", periodLabel: "Mars • Avril", months: [2, 3] },
  { id: "season-summer-sales", name: "Soldes d’été", description: "Moment propice pour arbitrer des références très visibles mais pas toujours bien documentées.", periodLabel: "Juin • Juillet", months: [5, 6] },
  { id: "season-french-days", name: "French Days", description: "Saison de forte intensité promotionnelle où comparer proprement devient encore plus utile.", periodLabel: "Avril • Septembre", months: [3, 8] },
  { id: "season-halloween", name: "Halloween", description: "Repère automnal pour les sélections gaming, TV et maison.", periodLabel: "Octobre", months: [9] },
  { id: "season-black-friday", name: "Black Friday", description: "Saison la plus critique pour distinguer vraie opportunité et simple pression commerciale.", periodLabel: "Novembre", months: [10] },
  { id: "season-christmas", name: "Noël", description: "Période cadeau et équipements foyer où les arbitrages se multiplient.", periodLabel: "Décembre", months: [11] },
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

  const activityBadges = PROFILE_BADGE_RULES.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    completed: badge.isCompleted(snapshot),
  }));

  const currentMonth = new Date().getMonth();
  const seasonalBadges: SeasonalBadge[] = SEASONAL_BADGES.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    periodLabel: badge.periodLabel,
    activeNow: badge.months.includes(currentMonth),
    completed: false,
  }));

  return {
    tasks,
    totalXp,
    currentLevel,
    nextLevel,
    progressPercent,
    badges: activityBadges,
    activityBadges,
    seasonalBadges,
  };
}

export function getProfileImpactText(priority: string) {
  if (priority === "Prix avant tout") return "Votre profil privilégie l’équilibre budgétaire. MAREF mettra davantage l’accent sur l’économie et le coût d’erreur.";
  if (priority === "Qualité avant tout") return "Votre profil privilégie la qualité perçue. MAREF renforcera surtout la pertinence, la stabilité et le cadre marchand.";
  if (priority === "Durabilité avant tout") return "Votre profil privilégie la durée de vie et la cohérence long terme. La stabilité devient un critère plus structurant.";
  return "Votre profil cherche un équilibre général. MAREF garde une lecture plus neutre entre coût, pertinence, fluidité, assurance et stabilité.";
}
