"use client";

import Link from "next/link";
import {
  BarChart3,
  Bot,
  Compass,
  FolderKanban,
  Heart,
  LocateFixed,
  MapPin,
  Medal,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TriangleAlert,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, IncompleteDataWarning, LoadingSkeleton, NoDataBlock } from "@/components/shared/Score";
import { getProfileStats } from "@/features/profile/api";
import { computeProfileProgress, getProfileImpactText } from "@/features/profile/gamification";
import { getUserLocation, saveUserLocation } from "@/lib/core/userSignals";
import { useTimedMessage } from "@/lib/hooks/useTimedMessage";
import { getUserProfile, upsertUserProfile } from "@/lib/services/offers";
import { useAuth } from "@/components/auth/AuthProvider";

const preferenceIcons = {
  "Cadre budgetaire": <BarChart3 className="h-4 w-4 text-blue-950" />,
  "Intensite d usage": <Target className="h-4 w-4 text-blue-950" />,
  "Priorite d achat": <ShieldCheck className="h-4 w-4 text-blue-950" />,
  "Horizon de conservation": <Timer className="h-4 w-4 text-blue-950" />,
  "Tolerance au risque": <TriangleAlert className="h-4 w-4 text-blue-950" />,
  Localisation: <MapPin className="h-4 w-4 text-blue-950" />,
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
  const [budget, setBudget] = useState("Equilibre");
  const [priority, setPriority] = useState("Fiabilite");
  const [horizon, setHorizon] = useState("3-5 ans");
  const [usage, setUsage] = useState("Foyer standard");
  const [risk, setRisk] = useState("Prudent");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [region, setRegion] = useState("");
  const [stats, setStats] = useState(defaultStats);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const saveMessage = useTimedMessage(3000);

  useEffect(() => {
    if (!user || profileLoaded) return;

    let cancelled = false;

    async function loadProfile() {
      const [profileStats, userProfile] = await Promise.all([getProfileStats(), getUserProfile()]);
      if (cancelled) return;

      setStats(profileStats);

      if (userProfile) {
        setBudget(userProfile.budget || "Equilibre");
        setPriority(userProfile.priority || "Fiabilite");
        setHorizon(userProfile.horizon || "3-5 ans");
        setUsage(userProfile.usage || "Foyer standard");
        setRisk(userProfile.risk || "Prudent");
      }

      const savedLocation = getUserLocation();
      if (savedLocation) {
        setCity(savedLocation.city || "");
        setPostalCode(savedLocation.postalCode || "");
        setRegion(savedLocation.region || "");
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
          description="MAREF n invente ni progression ni badges si vous n etes pas connecte."
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
    const locationLabel = [city, postalCode, region].filter(Boolean).join(" - ");
    const ok = await upsertUserProfile({
      budget,
      priority,
      horizon,
      usage,
      risk,
      location: locationLabel || undefined,
    });

    if (!ok) {
      saveMessage.showMessage("Impossible d enregistrer vos preferences pour le moment.");
      return;
    }

    saveUserLocation({ city, postalCode, region });
    saveMessage.showMessage("Preferences enregistrees.");
    setEditing(false);
  }

  return (
    <div className="space-y-5">
      <section className="premium-hero rounded-[32px] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)]">
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/20 bg-white/10 text-2xl font-black shadow-inner">
              {initials}
            </div>
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-blue-100/75">Profil decisionnel</p>
              <h2 className="mt-2 text-2xl font-black">{userName}</h2>
              <p className="text-sm text-blue-100/80">{email}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <Medal className="h-4 w-4" />
                <span className="text-sm font-bold">{progress.currentLevel.name}</span>
                <span className="text-xs text-blue-100/70">{progress.totalXp} XP reels</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:min-w-[320px] md:grid-cols-2">
            <div className="rounded-[22px] bg-white/8 p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-blue-100/70">Favoris</p>
              <p className="mt-2 text-xl font-black">{stats.favorites}</p>
            </div>
            <div className="rounded-[22px] bg-white/8 p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-blue-100/70">Projets</p>
              <p className="mt-2 text-xl font-black">{stats.projects}</p>
            </div>
            <div className="rounded-[22px] bg-white/8 p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-blue-100/70">Comparaisons</p>
              <p className="mt-2 text-xl font-black">{stats.comparisons}</p>
            </div>
            <div className="rounded-[22px] bg-white/8 p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-blue-100/70">Membre depuis</p>
              <p className="mt-2 text-sm font-semibold">{memberSince}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-bold">Progression reelle</h3>
          <span className="text-sm font-bold text-blue-950">{progress.totalXp} XP</span>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
            <Trophy className="h-4 w-4 text-blue-950" />
            <span className="text-xs font-bold text-blue-950">{progress.currentLevel.name}</span>
          </div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-950 to-slate-900 transition-all duration-700"
              style={{ width: `${progress.progressPercent}%` }}
            ></div>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {progress.nextLevel
            ? `${progress.nextLevel.xpNeeded - progress.totalXp} XP restants pour atteindre ${progress.nextLevel.name}`
            : "Niveau maximal atteint pour les regles actuelles"}
        </p>
      </div>

      <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-bold">Actions comptabilisees</h3>
          <span className="text-xs text-gray-400">
            {progress.tasks.filter((task) => task.completed).length} / {progress.tasks.length} valides
          </span>
        </div>
        <div className="space-y-2">
          {progress.tasks.map((task) => (
            <div
              key={task.id}
              className={
                "flex items-center gap-3 rounded-xl border p-3 transition-all " +
                (task.completed ? "border-slate-200 bg-slate-50" : "border-gray-100 bg-gray-50")
              }
            >
              <div
                className={
                  "flex h-10 w-10 items-center justify-center rounded-xl font-bold " +
                  (task.completed ? "bg-blue-950 text-white" : "border border-gray-200 bg-white text-gray-500")
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
                  (task.completed ? "bg-slate-200 text-blue-950" : "bg-gray-200 text-gray-600")
                }
              >
                +{task.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Badges d activite</h3>
            <span className="text-xs text-gray-400">
              {progress.activityBadges.filter((badge) => badge.completed).length} / {progress.activityBadges.length} obtenus
            </span>
          </div>
          <div className="grid gap-3">
            {progress.activityBadges.map((badge) => (
              <div
                key={badge.id}
                className={
                  "rounded-[22px] border p-4 transition-all " +
                  (badge.completed
                    ? "border-blue-950 bg-gradient-to-br from-blue-950 to-slate-900 text-white shadow-[0_18px_34px_rgba(15,23,42,0.16)]"
                    : "border-gray-100 bg-gray-50")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={
                        "flex h-11 w-11 items-center justify-center rounded-2xl " +
                        (badge.completed ? "bg-white/10" : "bg-slate-200 text-blue-950")
                      }
                    >
                      {badge.completed ? <Medal className="h-5 w-5" /> : <Compass className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{badge.name}</p>
                      <p className={"mt-1 text-xs leading-6 " + (badge.completed ? "text-blue-100/85" : "text-gray-500")}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      "rounded-full px-2 py-1 text-[0.65rem] font-bold " +
                      (badge.completed ? "bg-white/10 text-white" : "bg-gray-200 text-gray-600")
                    }
                  >
                    {badge.completed ? "Obtenu" : "En attente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {progress.activityBadges.every((badge) => !badge.completed) && (
            <div className="mt-4">
              <NoDataBlock
                title="Aucun badge d activite pour le moment"
                description="Les badges ne tombent qu apres des actions reelles. Rien n est pre-rempli."
              />
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Badges saison</h3>
            <span className="text-xs text-gray-400">
              {progress.seasonalBadges.filter((badge) => badge.activeNow).length} saison{progress.seasonalBadges.filter((badge) => badge.activeNow).length > 1 ? "s" : ""} active{progress.seasonalBadges.filter((badge) => badge.activeNow).length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-3">
            {progress.seasonalBadges.map((badge) => (
              <div
                key={badge.id}
                className={
                  "rounded-[22px] border p-4 transition-all " +
                  (badge.activeNow ? "border-blue-900 bg-gradient-to-br from-slate-50 to-blue-50" : "border-gray-100 bg-gray-50")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={"flex h-11 w-11 items-center justify-center rounded-2xl " + (badge.activeNow ? "bg-blue-950 text-white" : "bg-slate-200 text-blue-950")}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{badge.name}</p>
                      <p className="mt-1 text-xs leading-6 text-gray-500">{badge.description}</p>
                      <p className="mt-1 text-[0.65rem] font-semibold text-gray-400">{badge.periodLabel}</p>
                    </div>
                  </div>
                  <span
                    className={
                      "rounded-full px-2 py-1 text-[0.65rem] font-bold " +
                      (badge.activeNow ? "bg-blue-950 text-white" : "bg-gray-200 text-gray-600")
                    }
                  >
                    {badge.activeNow ? "Active" : "A venir"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IncompleteDataWarning description="Les XP et badges d activite restent bases sur des actions reelles. Les badges saison servent de reperes calendaires tant qu un suivi evenementiel verifiable n est pas branche." />

      <div className="relative rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-sm">
        <span className="absolute left-4 top-[-10px] rounded-md bg-blue-950 px-2.5 py-0.5 text-[0.7rem] font-bold text-white shadow-sm">Mimo</span>
        <p className="mt-2 text-sm leading-relaxed text-gray-800">{impactText}</p>
      </div>

      <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Votre cadrage utilisateur</h3>
            <p className="mt-1 text-sm text-gray-500">Des preferences utiles au produit, au score contextualise et aux recommandations locales.</p>
          </div>
          <button
            onClick={() => setEditing((current) => !current)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors " +
              (editing ? "bg-gray-100 text-gray-600" : "border border-blue-950 text-blue-950 hover:bg-slate-50")
            }
          >
            {editing ? "Annuler" : "Modifier"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            {[
              { key: "budget", label: "Cadre budgetaire", value: budget, setter: setBudget, options: ["Serre", "Equilibre", "Confortable", "Flexible"] },
              { key: "usage", label: "Intensite d usage", value: usage, setter: setUsage, options: ["Usage occasionnel", "Foyer standard", "Usage intensif", "Usage expert"] },
              { key: "priority", label: "Priorite d achat", value: priority, setter: setPriority, options: ["Fiabilite", "Prix", "Simplicite", "Durabilite", "Performance"] },
              { key: "horizon", label: "Horizon de conservation", value: horizon, setter: setHorizon, options: ["1-2 ans", "3-5 ans", "5-8 ans", "8+ ans"] },
              { key: "risk", label: "Tolerance au risque", value: risk, setter: setRisk, options: ["Prudent", "Equilibre", "Ouvert au reconditionne"] },
            ].map((preference) => (
              <div key={preference.key}>
                <label className="mb-1 block text-xs font-semibold text-gray-500">{preference.label}</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-950"
                  value={preference.value}
                  onChange={(event) => preference.setter(event.target.value)}
                >
                  {preference.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <LocateFixed className="h-4 w-4 text-blue-950" />
                <p className="text-sm font-bold text-slate-900">Localisation utile au produit</p>
              </div>
              <p className="mb-3 text-xs leading-6 text-gray-500">
                Votre localisation aide MAREF a privilegier des offres pertinentes autour de chez vous quand cette information est disponible.
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Ville</label>
                  <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-950" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex: Lille" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Code postal</label>
                  <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-950" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="Ex: 59000" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Region</label>
                  <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-950" value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Ex: Hauts-de-France" />
                </div>
              </div>
            </div>

            <button onClick={handleSavePreferences} className="w-full rounded-lg bg-blue-950 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-950">
              Enregistrer
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Cadre budgetaire", budget],
              ["Intensite d usage", usage],
              ["Priorite d achat", priority],
              ["Horizon de conservation", horizon],
              ["Tolerance au risque", risk],
              ["Localisation", [city, postalCode, region].filter(Boolean).join(" - ") || "A completer"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  {preferenceIcons[label as keyof typeof preferenceIcons]}
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {saveMessage.message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-sm text-blue-950">
          {saveMessage.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/favoris" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
          <Heart className="h-5 w-5 text-blue-950" />
          <span className="text-sm font-semibold">Mes favoris</span>
        </Link>
        <Link href="/projets" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
          <FolderKanban className="h-5 w-5 text-blue-950" />
          <span className="text-sm font-semibold">Mes projets</span>
        </Link>
        <Link href="/assistant" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
          <Bot className="h-5 w-5 text-blue-950" />
          <span className="text-sm font-semibold">Assistant Mimo</span>
        </Link>
        <Link href="/parametres" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
          <Settings className="h-5 w-5 text-blue-950" />
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
    </div>
  );
}
