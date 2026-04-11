import { getFavorites } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export type ProfileStats = {
  favorites: number;
  projects: number;
  topics: number;
  replies: number;
};

export async function getProfileStats(): Promise<ProfileStats> {
  const favorites = await getFavorites();

  const [{ count: projectCount }, { count: topicCount }, { count: replyCount }] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("forum_topics").select("*", { count: "exact", head: true }),
    supabase.from("forum_replies").select("*", { count: "exact", head: true }),
  ]);

  return {
    favorites: favorites.length,
    projects: projectCount || 0,
    topics: topicCount || 0,
    replies: replyCount || 0,
  };
}
