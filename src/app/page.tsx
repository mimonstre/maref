"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Project } from "@/features/projects/api";
import DashboardPage from "@/features/home/DashboardPage";
import LandingPage from "@/features/home/LandingPage";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
import { getFavorites, getOffers } from "@/lib/queries";
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

  useEffect(() => {
    async function loadHome() {
      const [offersData, favorites, projectData, topicResult] = await Promise.all([
        getOffers({}),
        getFavorites(),
        getProjectsWithOffers(),
        supabase.from("forum_topics").select("*", { count: "exact", head: true }),
      ]);

      setOffers(offersData);
      setFavCount(favorites.length);
      setProjects(projectData.projects);
      setProjectOffers(projectData.projectOffers);
      setTopicCount(topicResult.count || 0);
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
        offerCount={offers.length}
        merchantCount={[...new Set(offers.map((offer) => offer.merchant))].length}
        brandCount={[...new Set(offers.map((offer) => offer.brand))].length}
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
    />
  );
}
