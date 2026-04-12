"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { EmptyState } from "@/components/shared/Score";
import {
  createForumReply,
  createForumTopic,
  getForumReplies,
  getForumTopics,
  upvoteForumReply,
} from "@/features/forum/api";
import type { ForumReply, ForumTopic } from "@/features/forum/types";
import { getForumAvatarColor } from "@/features/forum/utils";
import { CATEGORIES } from "@/lib/categories";
import { timeAgo } from "@/lib/format";

const FORUM_TABS = [
  { id: "recent", label: "Recent" },
  { id: "electromenager", label: "Gros electromenager" },
  { id: "froid", label: "Froid" },
  { id: "televiseurs", label: "TV" },
  { id: "telephonie", label: "Telephonie" },
  { id: "informatique", label: "Informatique" },
  { id: "jeux-video", label: "Jeux video" },
];

function getForumCategoryLabel(value: string) {
  return CATEGORIES.find((category) => category.id === value)?.name || value;
}

export default function ForumPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadTopics() {
    setLoading(true);
    setTopics(await getForumTopics());
    setLoading(false);
  }

  async function loadReplies(topicId: string) {
    setReplies(await getForumReplies(topicId));
  }

  useEffect(() => {
    void Promise.resolve().then(loadTopics);
  }, []);

  async function openTopic(topic: ForumTopic) {
    setActiveTopic(topic);
    await loadReplies(topic.id);
  }

  async function handleNewTopic() {
    if (!newTitle.trim() || !newContent.trim()) return;

    setSaving(true);
    const authorName = user?.user_metadata?.name || "Anonyme";
    const success = await createForumTopic({
      title: newTitle,
      content: newContent,
      category: newCategory,
      authorName,
      userId: user?.id || null,
    });

    if (success) {
      setNewTitle("");
      setNewContent("");
      setShowNewTopic(false);
      setMessage("Topic publie");
      setTimeout(() => setMessage(""), 2000);
      await loadTopics();
    }

    setSaving(false);
  }

  async function handleReply() {
    if (!replyText.trim() || !activeTopic) return;

    setSaving(true);
    const authorName = user?.user_metadata?.name || "Anonyme";
    const success = await createForumReply({
      topicId: activeTopic.id,
      content: replyText,
      authorName,
      userId: user?.id || null,
    });

    if (success) {
      setReplyText("");
      setMessage("Reponse publiee");
      setTimeout(() => setMessage(""), 2000);
      await Promise.all([loadReplies(activeTopic.id), loadTopics()]);
    }

    setSaving(false);
  }

  async function handleVote(replyId: string) {
    const reply = replies.find((item) => item.id === replyId);
    if (!reply) return;

    const result = await upvoteForumReply(replyId, reply.votes);
    if (result.success) {
      setReplies((prev) => prev.map((item) => (item.id === replyId ? { ...item, votes: result.nextVotes } : item)));
    }
  }

  const filteredTopics = activeTab === "recent"
    ? topics
    : topics.filter((topic) => {
        const topicCategory = topic.category.toLowerCase();
        return topicCategory === activeTab || getForumCategoryLabel(topic.category).toLowerCase().includes(activeTab);
      });

  if (activeTopic) {
    return (
      <div className="space-y-4">
        {message && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
            {message}
          </div>
        )}

        <button onClick={() => { setActiveTopic(null); setReplies([]); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          Retour au forum
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold " + getForumAvatarColor(activeTopic.author_name)}>
              {activeTopic.author_name[0]}
            </div>
            <div>
              <span className="font-semibold text-sm">{activeTopic.author_name}</span>
              <p className="text-xs text-gray-400">{timeAgo(activeTopic.created_at)}</p>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-2">{activeTopic.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{activeTopic.content}</p>
          <div className="flex gap-2 mt-3">
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{getForumCategoryLabel(activeTopic.category)}</span>
            <span className="text-xs text-gray-400">{replies.length} reponse{replies.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3">Reponses ({replies.length})</h3>
          {replies.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-400">Aucune reponse. Soyez le premier.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={"w-7 h-7 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold " + getForumAvatarColor(reply.author_name)}>
                      {reply.author_name[0]}
                    </div>
                    <span className="font-semibold text-xs">{reply.author_name}</span>
                    <span className="text-[0.65rem] text-gray-400">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                  <button onClick={() => handleVote(reply.id)} className="mt-2 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors">
                    +1 ({reply.votes})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h4 className="font-bold text-sm mb-2">Repondre</h4>
          <textarea
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 resize-none"
            rows={3}
            placeholder="Votre reponse..."
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
          ></textarea>
          <button
            onClick={handleReply}
            disabled={saving || !replyText.trim()}
            className="mt-2 bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {saving ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          {message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Forum</h2>
          <p className="text-sm text-gray-500">Echangez avec la communaute MAREF</p>
        </div>
        <button
          onClick={() => setShowNewTopic(!showNewTopic)}
          className="text-sm font-semibold bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          {showNewTopic ? "Annuler" : "+ Nouveau topic"}
        </button>
      </div>

      {showNewTopic && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-sm animate-fade-in-up">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Titre *</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" placeholder="Ex: Quel lave-linge choisir pour un studio ?" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Categorie</label>
            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
              <option value="general">General</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Contenu *</label>
            <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 resize-none" rows={4} placeholder="Decrivez votre question ou partagez votre experience..." value={newContent} onChange={(event) => setNewContent(event.target.value)}></textarea>
          </div>
          <button onClick={handleNewTopic} disabled={saving || !newTitle.trim() || !newContent.trim()} className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 text-sm shadow-md">
            {saving ? "Publication..." : "Publier le topic"}
          </button>
        </div>
      )}

      <div className="flex gap-0 border-b-2 border-gray-100 overflow-x-auto">
        {FORUM_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={"px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-colors " + (activeTab === tab.id ? "text-blue-700 border-blue-700" : "text-gray-400 border-transparent hover:text-gray-600")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <EmptyState
          icon="?"
          title="Il n y a encore aucune discussion"
          description="Le forum reste vide tant qu aucun utilisateur n a publie de contenu reel."
          action={() => setShowNewTopic(true)}
          actionLabel="Creer le premier topic"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {filteredTopics.map((topic) => (
            <div key={topic.id} onClick={() => openTopic(topic)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold " + getForumAvatarColor(topic.author_name)}>
                    {topic.author_name[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-xs">{topic.author_name}</span>
                  </div>
                </div>
                <span className="text-[0.65rem] text-gray-400">{timeAgo(topic.created_at)}</span>
              </div>
              <h4 className="font-bold text-sm mb-1">{topic.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{topic.content}</p>
              <div className="flex gap-3 mt-2">
                <span className="text-[0.7rem] text-gray-400">{topic.reply_count} reponse{topic.reply_count > 1 ? "s" : ""}</span>
                <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{getForumCategoryLabel(topic.category)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-blue-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2">
          Le forum reste volontairement vide tant que la communaute ne publie pas de contenu reel. Aucun topic n est pre-rempli.
        </p>
      </div>
    </div>
  );
}
