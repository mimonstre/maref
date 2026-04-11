export const PROFILE_LEVELS = [
  { level: 1, name: "Debutant", xpNeeded: 0, icon: "🌱" },
  { level: 2, name: "Curieux", xpNeeded: 50, icon: "🔍" },
  { level: 3, name: "Analyste", xpNeeded: 150, icon: "📊" },
  { level: 4, name: "Comparateur", xpNeeded: 300, icon: "⚖️" },
  { level: 5, name: "Expert", xpNeeded: 500, icon: "🎯" },
  { level: 6, name: "Stratege", xpNeeded: 800, icon: "🧠" },
  { level: 7, name: "Mentor", xpNeeded: 1200, icon: "🏅" },
  { level: 8, name: "Architecte", xpNeeded: 1800, icon: "🏗️" },
  { level: 9, name: "Visionnaire", xpNeeded: 2500, icon: "🔮" },
  { level: 10, name: "Legende MAREF", xpNeeded: 3500, icon: "👑" },
];

export const PROFILE_XP_TASKS = [
  { id: "t1", label: "Consulter 5 fiches offres", xp: 10, icon: "🔍", category: "Explorer" },
  { id: "t2", label: "Sauvegarder 3 favoris", xp: 15, icon: "❤️", category: "Explorer" },
  { id: "t3", label: "Creer un projet", xp: 20, icon: "📁", category: "Projets" },
  { id: "t4", label: "Ajouter 3 offres a un projet", xp: 25, icon: "📎", category: "Projets" },
  { id: "t5", label: "Comparer 2 offres", xp: 15, icon: "⚖️", category: "Analyse" },
  { id: "t6", label: "Terminer un module du Guide", xp: 30, icon: "📚", category: "Formation" },
  { id: "t7", label: "Reussir un quiz a 80%+", xp: 40, icon: "🏆", category: "Formation" },
  { id: "t8", label: "Publier un topic sur le forum", xp: 25, icon: "💬", category: "Communaute" },
  { id: "t9", label: "Repondre a un topic", xp: 15, icon: "✍️", category: "Communaute" },
  { id: "t10", label: "Recevoir 5 votes positifs", xp: 35, icon: "👍", category: "Communaute" },
  { id: "t11", label: "Completer son profil", xp: 20, icon: "👤", category: "Profil" },
  { id: "t12", label: "Utiliser l assistant Mimo", xp: 10, icon: "🤖", category: "Mimo" },
];

export const PROFILE_LEVEL_BADGES = [
  { level: 1, name: "Premiere connexion", icon: "🌱", desc: "Bienvenue sur MAREF" },
  { level: 2, name: "Curieux officiel", icon: "🔍", desc: "Vous avez explore vos premieres offres" },
  { level: 3, name: "Analyste certifie", icon: "📊", desc: "Vous maitrisez les bases de l analyse" },
  { level: 4, name: "Comparateur aguerri", icon: "⚖️", desc: "Vous savez comparer efficacement" },
  { level: 5, name: "Expert MAREF", icon: "🎯", desc: "Votre expertise est reconnue" },
  { level: 6, name: "Stratege confirme", icon: "🧠", desc: "Vos decisions sont structurees" },
  { level: 7, name: "Mentor communautaire", icon: "🏅", desc: "Vous guidez les autres membres" },
  { level: 8, name: "Architecte decisonnel", icon: "🏗️", desc: "Vous construisez des analyses avancees" },
  { level: 9, name: "Visionnaire", icon: "🔮", desc: "Votre vision depasse le simple achat" },
  { level: 10, name: "Legende MAREF", icon: "👑", desc: "Le sommet de l expertise decisionnelle" },
];

export function getSeasonalBadges() {
  const month = new Date().getMonth();

  const allSeasonal = [
    { name: "Soldes d hiver", icon: "❄️", desc: "Actif pendant les soldes d hiver", color: "from-blue-400 to-blue-600", months: [0] },
    { name: "Saint Valentin", icon: "💕", desc: "L amour des bonnes affaires", color: "from-pink-400 to-rose-500", months: [1] },
    { name: "French Days", icon: "🇫🇷", desc: "Les French Days sont la", color: "from-blue-500 to-red-500", months: [2, 3, 8] },
    { name: "Soldes d ete", icon: "☀️", desc: "Actif pendant les soldes d ete", color: "from-yellow-400 to-orange-500", months: [5, 6] },
    { name: "Rentree", icon: "🎒", desc: "La rentree des bonnes decisions", color: "from-green-400 to-emerald-600", months: [8] },
    { name: "Black Friday", icon: "🖤", desc: "Le Black Friday vu par MAREF", color: "from-gray-800 to-gray-900", months: [10] },
    { name: "Noel", icon: "🎄", desc: "La magie des achats reflechis", color: "from-red-500 to-green-600", months: [11] },
  ];

  return allSeasonal.map((badge) => ({
    ...badge,
    active: badge.months.includes(month),
  }));
}

export function getProfileImpactText(priority: string) {
  if (priority === "Fiabilite") return "Votre priorite Fiabilite renforce le poids des axes Assurance et Stabilite dans chaque score.";
  if (priority === "Prix") return "Votre priorite Prix renforce le poids de l axe Economie dans chaque score.";
  return "Votre profil equilibre les 5 axes PEFAS de maniere homogene.";
}
