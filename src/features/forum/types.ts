export type ForumTopic = {
  id: string;
  title: string;
  content: string;
  category: string;
  author_name: string;
  user_id?: string | null;
  created_at: string;
  reply_count: number;
};

export type ForumReply = {
  id: string;
  topic_id: string;
  content: string;
  author_name: string;
  user_id?: string | null;
  votes: number;
  created_at: string;
};
