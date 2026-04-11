"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getProfileImpactText,
  getSeasonalBadges,
  PROFILE_LEVEL_BADGES,
  PROFILE_LEVELS,
  PROFILE_XP_TASKS,
} from "@/features/profile/gamification";
import { getProfileStats } from "@/features/profile/api";

export default function ProfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favCount, setFavCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [topicCount, setTopicCount] = useState(0);
  const [replyCount, setReplyCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [budget, setBudget] = useState("Modere");
  const [priority, setPriority] = useState("Fiabilite");
  const [horizon, setHorizon] = useState("3-5 ans");
  const [usage, setUsage] = useState("Usage quotidien");
  const [risk, setRisk] = useState("Prudent");
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllLevelBadges, setShowAllLevelBadges] = useState(false);

  useEffect(() => {
    async function loadProfileStats() {
      const stats = await getProfileStats();
      setFavCount(stats.favorites);
      setProjectCount(stats.projects);
      setTopicCount(stats.topics);
      setReplyCount(stats.replies);
    }

    void Promise.resolve().then(loadProfileStats);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  if (authLoading || !user) return null;

  const userName = user.user_metadata?.name || "Utilisateur";
  const initials = userName.charAt(0).toUpperCase();
  const email = user.email || "";

  const completedTasks: string[] = [];
  if (favCount >= 3) completedTasks.push("t2");
  if (projectCount >= 1) completedTasks.push("t3");
  if (topicCount >= 1) completedTasks.push("t8");
  if (replyCount >= 1) completedTasks.push("t9");
  completedTasks.push("t11");
  completedTasks.push("t1");

  const totalXP = completedTasks.reduce((sum, taskId) => {
    const task = PROFILE_XP_TASKS.find((item) => item.id === taskId);
    return sum + (task?.xp || 0);
  }, 0);

  const currentLevel = [...PROFILE_LEVELS].reverse().find((level) => totalXP >= level.xpNeeded) || PROFILE_LEVELS[0];
  const nextLevel = PROFILE_LEVELS.find((level) => level.level === currentLevel.level + 1);
  const xpForNext = nextLevel ? nextLevel.xpNeeded : currentLevel.xpNeeded;
  const xpProgress = nextLevel ? ((totalXP - currentLevel.xpNeeded) / (xpForNext - currentLevel.xpNeeded)) * 100 : 100;

  const seasonalBadges = getSeasonalBadges();
  const unlockedLevelBadges = PROFILE_LEVEL_BADGES.filter((badge) => badge.level <= currentLevel.level);
  const impactText = getProfileImpactText(priority);
  const visibleTasks = showAllTasks ? PROFILE_XP_TASKS : PROFILE_XP_TASKS.slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white text-center shadow-lg">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mx-auto border-2 border-white/30">
          {initials}
        </div>
        <h2 className="text-xl font-bold mt-3">{userName}</h2>
        <p className="text-emerald-200 text-sm">{email}</p>
        <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg mt-3">
          <span className="text-sm">{currentLevel.icon}</span>
          <span className="text-sm font-bold">{currentLevel.name}</span>
          <span className="text-xs text-emerald-200">Â· Niv. {currentLevel.level}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Progression</h3>
          <span className="text-sm font-bold text-emerald-700">{totalXP} XP</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <span className="text-sm">{currentLevel.icon}</span>
            <span className="text-xs font-bold text-emerald-700">Niv. {currentLevel.level}</span>
          </div>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-700" style={{ width: Math.min(xpProgress, 100) + "%" }}></div>
          </div>
          {nextLevel && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
              <span className="text-sm">{nextLevel.icon}</span>
              <span className="text-xs font-bold text-gray-400">Niv. {nextLevel.level}</span>
            </div>
          )}
        </div>
        {nextLevel && (
          <p className="text-xs text-gray-500 text-center">{xpForNext - totalXP} XP restants pour atteindre {nextLevel.name}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Missions XP</h3>
          <span className="text-xs text-gray-400">{completedTasks.length} / {PROFILE_XP_TASKS.length} completees</span>
        </div>
        <div className="space-y-2">
          {visibleTasks.map((task) => {
            const done = completedTasks.includes(task.id);
            return (
              <div key={task.id} className={"flex items-center gap-3 p-3 rounded-xl border transition-all " + (done ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-gray-50")}>
                <div className={"w-9 h-9 rounded-lg flex items-center justify-center text-base " + (done ? "bg-emerald-700 text-white" : "bg-white border border-gray-200")}>
                  {done ? "âœ“" : task.icon}
                </div>
                <div className="flex-1">
                  <p className={"text-sm font-medium " + (done ? "text-emerald-800 line-through" : "")}>{task.label}</p>
                  <p className="text-[0.65rem] text-gray-400">{task.category}</p>
                </div>
                <span className={"text-xs font-bold px-2 py-0.5 rounded-full " + (done ? "bg-emerald-200 text-emerald-800" : "bg-gray-200 text-gray-600")}>+{task.xp} XP</span>
              </div>
            );
          })}
        </div>
        {PROFILE_XP_TASKS.length > 6 && (
          <button onClick={() => setShowAllTasks(!showAllTasks)} className="w-full text-center text-xs font-semibold text-emerald-700 mt-3 hover:underline">
            {showAllTasks ? "Voir moins" : "Voir toutes les missions (" + PROFILE_XP_TASKS.length + ")"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Badges de niveau</h3>
          <span className="text-xs text-gray-400">{unlockedLevelBadges.length} / {PROFILE_LEVEL_BADGES.length} debloques</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(showAllLevelBadges ? PROFILE_LEVEL_BADGES : PROFILE_LEVEL_BADGES.slice(0, 5)).map((badge) => {
            const unlocked = badge.level <= currentLevel.level;
            return (
              <div key={badge.level} className={"text-center p-2 rounded-xl border transition-all " + (unlocked ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-gray-50 opacity-50")}>
                <p className="text-2xl">{unlocked ? badge.icon : "ðŸ”’"}</p>
                <p className="text-[0.6rem] font-bold mt-1">{badge.name}</p>
                <p className="text-[0.55rem] text-gray-400">Niv. {badge.level}</p>
              </div>
            );
          })}
        </div>
        {PROFILE_LEVEL_BADGES.length > 5 && (
          <button onClick={() => setShowAllLevelBadges(!showAllLevelBadges)} className="w-full text-center text-xs font-semibold text-emerald-700 mt-3 hover:underline">
            {showAllLevelBadges ? "Voir moins" : "Voir tous les badges (" + PROFILE_LEVEL_BADGES.length + ")"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Badges ephemeres</h3>
          <span className="text-xs text-gray-400">{seasonalBadges.filter((badge) => badge.active).length} actif{seasonalBadges.filter((badge) => badge.active).length > 1 ? "s" : ""}</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Badges speciaux lies aux periodes de l annee. Collectionnez-les tous !</p>
        <div className="grid grid-cols-2 gap-2.5">
          {seasonalBadges.map((badge) => (
            <div key={badge.name} className={"relative rounded-xl border p-3.5 transition-all overflow-hidden " + (badge.active ? "border-emerald-300 shadow-md" : "border-gray-100 opacity-60")}>
              {badge.active && (
                <div className={"absolute inset-0 bg-gradient-to-br " + badge.color + " opacity-10"}></div>
              )}
              <div className="relative flex items-center gap-2.5">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="text-xs font-bold">{badge.name}</p>
                  <p className="text-[0.6rem] text-gray-500">{badge.desc}</p>
                  {badge.active ? (
                    <span className="inline-block text-[0.55rem] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded mt-1">ACTIF</span>
                  ) : (
                    <span className="inline-block text-[0.55rem] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded mt-1">A VENIR</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
          <p className="text-lg font-bold text-emerald-700">{topicCount}</p>
          <p className="text-[0.65rem] text-gray-500">Topics</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">{replyCount}</p>
          <p className="text-[0.65rem] text-gray-500">Reponses</p>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2 leading-relaxed">
          {impactText} Continuez vos missions pour gagner de l XP et debloquer de nouveaux badges. Vous etes a {nextLevel ? (xpForNext - totalXP) + " XP du niveau " + nextLevel.name : "au niveau maximum"} !
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Vos preferences</h3>
          <button onClick={() => setEditing(!editing)} className={"text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors " + (editing ? "bg-gray-100 text-gray-600" : "text-emerald-700 border border-emerald-700 hover:bg-emerald-50")}>
            {editing ? "Annuler" : "Modifier"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            {[
              { key: "budget", label: "Budget", value: budget, setter: setBudget, options: ["Serre", "Modere", "Confortable", "Flexible"] },
              { key: "usage", label: "Usage", value: usage, setter: setUsage, options: ["Usage leger", "Usage quotidien", "Usage intensif", "Usage professionnel"] },
              { key: "priority", label: "Priorite", value: priority, setter: setPriority, options: ["Prix", "Fiabilite", "Simplicite", "Performance", "Durabilite"] },
              { key: "horizon", label: "Horizon", value: horizon, setter: setHorizon, options: ["1-2 ans", "3-5 ans", "5-8 ans", "8+ ans"] },
              { key: "risk", label: "Tolerance risque", value: risk, setter: setRisk, options: ["Prudent", "Equilibre", "Audacieux"] },
            ].map((preference) => (
              <div key={preference.key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{preference.label}</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={preference.value} onChange={(event) => preference.setter(event.target.value)}>
                  {preference.options.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
            ))}
            <button onClick={() => setEditing(false)} className="w-full bg-emerald-700 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors text-sm">
              Enregistrer
            </button>
          </div>
        ) : (
          <div>
            {[
              ["Budget", budget, "ðŸ’°"],
              ["Usage", usage, "âš¡"],
              ["Priorite", priority, "ðŸŽ¯"],
              ["Horizon", horizon, "ðŸ“…"],
              ["Tolerance risque", risk, "ðŸ›¡ï¸"],
            ].map(([label, value, icon]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-2">Impact sur les resultats</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Vos preferences modifient la ponderation des axes PEFAS et donc le classement des offres.
        </p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {[
            { key: "P", label: "Pert.", weight: priority === "Performance" ? "Fort" : "Normal" },
            { key: "E", label: "Eco.", weight: priority === "Prix" ? "Fort" : "Normal" },
            { key: "F", label: "Fluid.", weight: priority === "Simplicite" ? "Fort" : "Normal" },
            { key: "A", label: "Assur.", weight: priority === "Fiabilite" ? "Fort" : "Normal" },
            { key: "S", label: "Stab.", weight: priority === "Durabilite" ? "Fort" : "Normal" },
          ].map((axis) => (
            <div key={axis.key} className={"text-center p-2 rounded-lg border " + (axis.weight === "Fort" ? "border-emerald-300 bg-emerald-50" : "border-gray-100 bg-gray-50")}>
              <p className="text-xs font-bold">{axis.key}</p>
              <p className="text-[0.6rem] text-gray-500">{axis.label}</p>
              <p className={"text-[0.6rem] font-semibold mt-0.5 " + (axis.weight === "Fort" ? "text-emerald-700" : "text-gray-400")}>{axis.weight}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/favoris" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">â¤ï¸</span>
          <span className="text-sm font-semibold">Mes favoris</span>
        </Link>
        <Link href="/projets" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">ðŸ“</span>
          <span className="text-sm font-semibold">Mes projets</span>
        </Link>
        <Link href="/assistant" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">ðŸ¤–</span>
          <span className="text-sm font-semibold">Assistant Mimo</span>
        </Link>
        <Link href="/parametres" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-2">
          <span className="text-xl">âš™ï¸</span>
          <span className="text-sm font-semibold">Parametres</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-3">Compte</h3>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Email</span>
          <span className="text-sm font-medium">{email}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-gray-600">Membre depuis</span>
          <span className="text-sm font-medium">avril 2026</span>
        </div>
      </div>
    </div>
  );
}
