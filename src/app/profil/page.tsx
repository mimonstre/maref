"use client";

import Link from "next/link";
import {
  BarChart3,
  Bot,
  FolderKanban,
  Heart,
  Medal,
  Settings,
  ShieldCheck,
  Target,
  Timer,
  TriangleAlert,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { EmptyState, IncompleteDataWarning, LoadingSkeleton, NoDataBlock } from "@/components/shared/Score";
import { getProfileStats } from "@/features/profile/api";
import { computeProfileProgress, getProfileImpactText } from "@/features/profile/gamification";
import { useTimedMessage } from "@/lib/hooks/useTimedMessage";
import { getUserProfile, upsertUserProfile } from "@/lib/services/offers";

const preferenceIcons = {
  Budget: <BarChart3 className="h-4 w-4 text-blue-700" />,
  Usage: <Target className="h-4 w-4 text-blue-700" />,
  Priorite: <ShieldCheck className="h-4 w-4 text-blue-700" />,
  Horizon: <Timer className="h-4 w-4 text-blue-700" />,
  "Tolerance risque": <TriangleAlert className="h-4 w-4 text-blue-700" />,
};

const defaultStats = {
  favorites: 0,
  projects: 0,
  topics: 0,
  replies: 0,
  comparisons: 0,
  guideModulesCompleted: 0,
};

export default function ProfilPage() {
  const { user, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [budget, setBudget] = useState("Modere");
  const [priority, setPriority] = useState("Fiabilite");
  const [horizon, setHorizon] = useState("3-5 ans");
  const [usage, setUsage] = useState("Usage quotidien");
  const [risk, setRisk] = useState("Prudent");
  const [stats, setStats] = useState(defaultStats);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const saveMessage = useTimedMessage(3000);

  useEffect(() => {
    if (!user || profileLoaded) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      const [profileStats, userProfile] = await Promise.all([getProfileStats(), getUserProfile()]);

      if (cancelled) {
        return;
      }

      setStats(profileStats);

      if (userProfile) {
        setBudget(userProfile.budget || "Modere");
        setPriority(userProfile.priority || "Fiabilite");
        setHorizon(userProfile.horizon || "3-5 ans");
        setUsage(userProfile.usage || "Usage quotidien");
        setRisk(userProfile.risk || "Prudent");
      }

      setProfileLoaded(true);
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [profileLoaded, user]);

  const progress = useMemo(() => computeProfileProgress(stats), [stats]);

  if (authLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Profil</h2>
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Profil</h2>
        <EmptyState
          icon={<UserCircle2 className="h-8 w-8 text-gray-400" />}
          title="Aucun profil sans session active"
          description="MAREF ne fabrique pas de progression ni de statistiques si vous n etes pas connecte."
          action={() => {
            window.location.href = "/login";
          }}
          actionLabel="Se connecter"
        />
      </div>
    );
  }

  const userName = user.user_metadata?.name || "Utilisateur";
  const initials = userName.charAt(0).toUpperCase();
  const email = user.email || "";
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "Inconnu";
  const impactText = getProfileImpactText(priority);

  async function handleSavePreferences() {
    const ok = await upsertUserProfile({ budget, priority, horizon, usage, risk });
    if (!ok) {
      saveMessage.showMessage("Impossible d enregistrer vos preferences pour le moment.");
      return;
    }

    saveMessage.showMessage("Preferences enregistrees.");
    setEditing(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-800 p-6 text-center text-white shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-2xl font-bold">
          {initials}
        </div>
        <h2 className="mt-3 text-xl font-bold">{userName}</h2>
        <p className="text-sm text-blue-200">{email}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5">
          <Medal className="h-4 w-4" />
          <span className="text-sm font-bold">{progress.currentLevel.name}</span>
          <span className="text-xs text-blue-200">{progress.totalXp} XP reels</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">Progression reelle</h3>
          <span className="text-sm font-bold text-blue-700">{progress.totalXp} XP</span>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1">
            <Medal className="h-4 w-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-700">{progress.currentLevel.name}</span>
          </div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-700"
              style={{ width: `${progress.progressPercent}%` }}
            ></div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500">
          {progress.nextLevel
            ? `${progress.nextLevel.xpNeeded - progress.totalXp} XP restants pour atteindre ${progress.nextLevel.name}`
            : "Niveau maximal atteint pour les regles actuelles"}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Actions comptabilisees</h3>
          <span className="text-xs text-gray-400">
            {progress.tasks.filter((task) => task.completed).length} / {progress.tasks.length} atteintes
          </span>
        </div>
        <div className="space-y-2">
          {progress.tasks.map((task) => (
            <div
              key={task.id}
              className={
                "flex items-center gap-3 rounded-xl border p-3 transition-all " +
                (task.completed ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50")
              }
            >
              <div
                className={
                  "flex h-9 w-9 items-center justify-center rounded-lg " +
                  (task.completed
                    ? "bg-blue-700 text-white"
                    : "border border-gray-200 bg-white text-gray-500")
                }
              >
                {task.completed ? "OK" : task.current}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{task.label}</p>
                <p className="text-[0.65rem] text-gray-400">
                  {task.category} - {Math.min(task.current, task.target)} / {task.target}
                </p>
              </div>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-xs font-bold " +
                  (task.completed ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600")
                }
              >
                +{task.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Badges reels</h3>
          <span className="text-xs text-gray-400">
            {progress.badges.filter((badge) => badge.completed).length} / {progress.badges.length} obtenus
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {progress.badges.map((badge) => (
            <div
              key={badge.id}
              className={
                "rounded-xl border p-3 " +
                (badge.completed ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50")
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{badge.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{badge.description}</p>
                </div>
                <span
                  className={
                    "rounded-full px-2 py-1 text-[0.65rem] font-bold " +
                    (badge.completed ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600")
                  }
                >
                  {badge.completed ? "Obtenu" : "Non obtenu"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {progress.badges.every((badge) => !badge.completed) && (
        <NoDataBlock
          title="Aucun badge pour le moment"
          description="Les badges ne sont attribues qu apres une action reelle verifiee. Rien n est pre-rempli."
        />
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{stats.favorites}</p>
          <p className="text-[0.65rem] text-gray-500">Favoris</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{stats.projects}</p>
          <p className="text-[0.65rem] text-gray-500">Projets</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{stats.comparisons}</p>
          <p className="text-[0.65rem] text-gray-500">Comparaisons</p>
        </div>
      </div>

      <IncompleteDataWarning
        description="Le profil n affiche plus de badges saisonniers, de niveaux fantaisie ou de progression inventee. Seules les actions detectees dans vos donnees sont prises en compte."
      />

      <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
        <span className="absolute left-4 top-[-10px] rounded-md bg-blue-700 px-2.5 py-0.5 text-[0.7rem] font-bold text-white shadow-sm">
          Mimo
        </span>
        <p className="mt-2 text-sm leading-relaxed text-gray-800">{impactText}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Vos preferences</h3>
          <button
            onClick={() => setEditing((current) => !current)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors " +
              (editing
                ? "bg-gray-100 text-gray-600"
                : "border border-blue-700 text-blue-700 hover:bg-blue-50")
            }
          >
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
                <label className="mb-1 block text-xs font-semibold text-gray-500">{preference.label}</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
                  value={preference.value}
                  onChange={(event) => preference.setter(event.target.value)}
                >
                  {preference.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
            <button
              onClick={handleSavePreferences}
              className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Enregistrer
            </button>
          </div>
        ) : (
          <div>
            {[
              ["Budget", budget],
              ["Usage", usage],
              ["Priorite", priority],
              ["Horizon", horizon],
              ["Tolerance risque", risk],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
              >
                <div className="flex items-center gap-2">
                  {preferenceIcons[label as keyof typeof preferenceIcons]}
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {saveMessage.message && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-700">
          {saveMessage.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/favoris"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Heart className="h-5 w-5 text-blue-700" />
          <span className="text-sm font-semibold">Mes favoris</span>
        </Link>
        <Link
          href="/projets"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <FolderKanban className="h-5 w-5 text-blue-700" />
          <span className="text-sm font-semibold">Mes projets</span>
        </Link>
        <Link
          href="/assistant"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Bot className="h-5 w-5 text-blue-700" />
          <span className="text-sm font-semibold">Assistant Mimo</span>
        </Link>
        <Link
          href="/parametres"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Settings className="h-5 w-5 text-blue-700" />
          <span className="text-sm font-semibold">Parametres</span>
        </Link>
      </div>

      {stats.projects === 0 && stats.favorites === 0 && stats.comparisons === 0 && (
        <EmptyState
          icon={<Target className="h-8 w-8 text-gray-400" />}
          title="Aucune activite exploitable"
          description="Votre profil commencera a se remplir quand vous creerez un projet, ajouterez des favoris ou lancerez une comparaison."
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-bold">Compte</h3>
        <div className="flex items-center justify-between border-b border-gray-100 py-2.5">
          <span className="text-sm text-gray-600">Email</span>
          <span className="text-sm font-medium">{email}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-100 py-2.5">
          <span className="text-sm text-gray-600">Membre depuis</span>
          <span className="text-sm font-medium">{memberSince}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-gray-600">Identite</span>
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <UserCircle2 className="h-4 w-4 text-blue-700" />
            {userName}
          </span>
        </div>
      </div>
    </div>
  );
}
