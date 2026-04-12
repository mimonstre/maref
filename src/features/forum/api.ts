import { supabase } from "@/lib/supabase";
import type { ForumReply, ForumTopic } from "./types";

type TopicRow = Omit<ForumTopic, "reply_count">;
type ReplyRow = ForumReply;

export async function getForumTopics(): Promise<ForumTopic[]> {
  const [{ data: topicsData, error: topicsError }, { data: repliesData, error: repliesError }] = await Promise.all([
    supabase
      .from("forum_topics")
      .select("id, title, content, category, author_name, user_id, created_at")
      .not("user_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase.from("forum_replies").select("id, topic_id").not("user_id", "is", null),
  ]);

  if (topicsError || repliesError || !topicsData) {
    return [];
  }

  const replyCounts = (repliesData || []).reduce<Record<string, number>>((acc, reply) => {
    const topicId = String(reply.topic_id);
    acc[topicId] = (acc[topicId] || 0) + 1;
    return acc;
  }, {});

  return (topicsData as TopicRow[]).map((topic) => ({
    ...topic,
    reply_count: replyCounts[topic.id] || 0,
  }));
}

export async function getForumReplies(topicId: string): Promise<ForumReply[]> {
  const { data, error } = await supabase
    .from("forum_replies")
    .select("id, topic_id, content, author_name, user_id, votes, created_at")
    .eq("topic_id", topicId)
    .not("user_id", "is", null)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as ReplyRow[];
}

export async function createForumTopic(input: {
  title: string;
  content: string;
  category: string;
  authorName: string;
  userId: string | null;
}) {
  const { error } = await supabase.from("forum_topics").insert({
    title: input.title,
    content: input.content,
    category: input.category,
    author_name: input.authorName,
    user_id: input.userId,
  });

  return !error;
}

export async function createForumReply(input: {
  topicId: string;
  content: string;
  authorName: string;
  userId: string | null;
}) {
  const { error } = await supabase.from("forum_replies").insert({
    topic_id: input.topicId,
    content: input.content,
    author_name: input.authorName,
    user_id: input.userId,
  });

  return !error;
}

export async function upvoteForumReply(replyId: string, currentVotes: number) {
  const nextVotes = currentVotes + 1;
  const { error } = await supabase.from("forum_replies").update({ votes: nextVotes }).eq("id", replyId);
  return { success: !error, nextVotes };
}
