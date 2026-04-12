import { getFavorites } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export type ProfileStats = {
  favorites: number;
  projects: number;
  topics: number;
  replies: number;
  comparisons: number;
  guideModulesCompleted: number;
};

export async function getProfileStats(): Promise<ProfileStats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      favorites: 0,
      projects: 0,
      topics: 0,
      replies: 0,
      comparisons: 0,
      guideModulesCompleted: 0,
    };
  }

  const favorites = await getFavorites();
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("compare_count, guide_progress")
    .eq("user_id", user.id)
    .single();

  const [{ count: projectCount }, { count: topicCount }, { count: replyCount }] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("forum_topics").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const guideProgress = (userProfile?.guide_progress || {}) as Record<string, number>;
  const guideModulesCompleted = Object.values(guideProgress).filter((value) => value >= 100).length;

  return {
    favorites: favorites.length,
    projects: projectCount || 0,
    topics: topicCount || 0,
    replies: replyCount || 0,
    comparisons: userProfile?.compare_count || 0,
    guideModulesCompleted,
  };
}
