"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Project } from "@/features/projects/api";
import DashboardPage from "@/features/home/DashboardPage";
import LandingPage from "@/features/home/LandingPage";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
import { getFavorites, getOffers, getUserProfile, getViewHistory } from "@/lib/queries";
import { getRecentSearchSignals, getUserLocation } from "@/lib/core/userSignals";
import { supabase } from "@/lib/supabase";
import { getProjectsWithOffers } from "@/features/projects/api";
import type { Offer } from "@/lib/data";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [topicCount, setTopicCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOffers, setProjectOffers] = useState<Record<string, Offer[]>>({});
  const [recentHistory, setRecentHistory] = useState<Awaited<ReturnType<typeof getViewHistory>>>([]);
  const [recentSearches, setRecentSearches] = useState<ReturnType<typeof getRecentSearchSignals>>([]);
  const [userLocationLabel, setUserLocationLabel] = useState<string | null>(null);

  useEffect(() => {
    async function loadHome() {
      const [offersData, favorites, projectData, topicResult, historyData, userProfile] = await Promise.all([
        getOffers({}),
        getFavorites(),
        getProjectsWithOffers(),
        supabase.from("forum_topics").select("*", { count: "exact", head: true }),
        getViewHistory(),
        getUserProfile(),
      ]);

      setOffers(offersData);
      setFavCount(favorites.length);
      setProjects(projectData.projects);
      setProjectOffers(projectData.projectOffers);
      setTopicCount(topicResult.count || 0);
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

    void Promise.resolve().then(loadHome);
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
      topicCount={topicCount}
      loading={loading}
      recentHistory={recentHistory}
      recentSearches={recentSearches}
      userLocationLabel={userLocationLabel}
    />
  );
}
