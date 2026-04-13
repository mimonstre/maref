"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Project } from "@/features/projects/api";
import DashboardPage from "@/features/home/DashboardPage";
import LandingPage from "@/features/home/LandingPage";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
import { getFavorites, getOffers, getUserProfile, getViewHistory } from "@/lib/queries";
import { getRecentSearchSignals, getUserLocation } from "@/lib/core/userSignals";
import { getProjectsWithOffers } from "@/features/projects/api";
import type { Offer } from "@/lib/data";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, Offer[]>>({});
  const [recentHistory, setRecentHistory] = useState<Awaited<ReturnType<typeof getViewHistory>>>([]);
  const [recentSearches, setRecentSearches] = useState<ReturnType<typeof getRecentSearchSignals>>([]);
  const [userLocationLabel, setUserLocationLabel] = useState<string | null>(null);

  useEffect(() => {
    async function loadHome() {
      const [offersData, favorites, projectData, historyData, userProfile] = await Promise.all([
        getOffers({}),
        getFavorites(),
        getProjectsWithOffers(),
        getViewHistory(),
        getUserProfile(),
      ]);

      setOffers(offersData);
      setFavCount(favorites.length);
      setProjects(projectData.projects);
      setProjectOffers(projectData.projectOffers);
      setRecentHistory(historyData);
      setRecentSearches(getRecentSearchSignals());
      const localLocation = getUserLocation();
      const locationLabel = localLocation
        ? [localLocation.city, localLocation.postalCode, localLocation.region].filter(Boolean).join(" - ")
        : typeof userProfile?.location === "string"
          ? userProfile.location
          : null;
      setUserLocationLabel(locationLabel);
      setLoading(false);
    }

    function handleRefresh() {
      void Promise.resolve().then(loadHome);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        handleRefresh();
      }
    }

    handleRefresh();
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("maref-history-updated", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("maref-history-updated", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const categoryCards = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        name: category.name,
        count: offers.filter((offer) => offer.category === category.id).length,
        icon: <span className="text-2xl leading-none">{getCategoryIcon(category.id)}</span>,
      })),
    [offers],
  );

  if (!authLoading && !user) {
    return (
      <LandingPage
        categoryCards={categoryCards}
      />
    );
  }

  return (
    <DashboardPage
      userName={user?.user_metadata?.name || "Utilisateur"}
      offers={offers}
      projects={projects}
      projectOffers={projectOffers}
      favCount={favCount}
      loading={loading}
      recentHistory={recentHistory}
      recentSearches={recentSearches}
      userLocationLabel={userLocationLabel}
    />
  );
}
