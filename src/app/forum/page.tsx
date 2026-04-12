"use client";

import { useEffect, useState } from "react";
import AuthRequiredPage from "@/components/auth/AuthRequiredPage";
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
  { id: "recent", label: "Récent" },
  { id: "produit", label: "Produit" },
  { id: "magasin", label: "Magasin" },
  { id: "livraison", label: "Livraison" },
  { id: "garantie", label: "Garantie" },
];

function getForumCategoryLabel(value: string) {
  return CATEGORIES.find((category) => category.id === value)?.name || value;
}

export default function ForumPage() {
  const { user, loading: authLoading } = useAuth();
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
      setMessage("Topic publié.");
      setTimeout(() => setMessage(""), 2200);
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
      setMessage("Réponse publiée.");
      setTimeout(() => setMessage(""), 2200);
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

  const filteredTopics =
    activeTab === "recent"
      ? topics
      : topics.filter((topic) => {
          const haystack = [topic.title, topic.content, topic.category, getForumCategoryLabel(topic.category)].join(" ").toLowerCase();
          if (activeTab === "produit") return /produit|appareil|lave|seche|frigo|tv|telephone|pc|tablette/.test(haystack);
          if (activeTab === "magasin") return /magasin|marchand|vendeur|site/.test(haystack);
          if (activeTab === "livraison") return /livraison|delai|expedition|stock/.test(haystack);
          if (activeTab === "garantie") return /garantie|sav|retour|panne|reparation/.test(haystack);
          return true;
        });

  if (authLoading || !user) {
    return (
      <AuthRequiredPage
        title="Forum réservé aux comptes connectés"
        description="Connectez-vous pour lire les discussions réelles, créer un topic et publier des réponses."
      />
    );
  }

  if (activeTopic) {
    return (
      <div className="space-y-4">
        {message && (
          <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-xl bg-blue-950 px-4 py-2 text-sm font-medium text-white shadow-lg animate-fade-in">
            {message}
          </div>
        )}

        <button
          onClick={() => {
            setActiveTopic(null);
            setReplies([]);
          }}
          className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-950"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour au forum
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2.5">
            <div className={"flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white " + getForumAvatarColor(activeTopic.author_name)}>
              {activeTopic.author_name[0]}
            </div>
            <div>
              <span className="text-sm font-semibold">{activeTopic.author_name}</span>
              <p className="text-xs text-gray-400">{timeAgo(activeTopic.created_at)}</p>
            </div>
          </div>
          <h2 className="mb-2 text-lg font-bold">{activeTopic.title}</h2>
          <p className="text-sm leading-relaxed text-gray-600">{activeTopic.content}</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{getForumCategoryLabel(activeTopic.category)}</span>
            <span className="text-xs text-gray-400">{replies.length} réponse{replies.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Réponses ({replies.length})</h3>
          {replies.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-sm text-gray-400">Aucune réponse. Soyez le premier.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className={"flex h-7 w-7 items-center justify-center rounded-full text-[0.65rem] font-bold text-white " + getForumAvatarColor(reply.author_name)}>
                      {reply.author_name[0]}
                    </div>
                    <span className="text-xs font-semibold">{reply.author_name}</span>
                    <span className="text-[0.65rem] text-gray-400">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{reply.content}</p>
                  <button onClick={() => handleVote(reply.id)} className="mt-2 text-xs font-medium text-blue-950 transition-colors hover:text-slate-950">
                    +1 ({reply.votes})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-bold">Repondre</h4>
          <textarea
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
            rows={3}
            placeholder="Votre réponse..."
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
          ></textarea>
          <button
            onClick={handleReply}
            disabled={saving || !replyText.trim()}
            className="mt-2 rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-950 disabled:opacity-50"
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
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-xl bg-blue-950 px-4 py-2 text-sm font-medium text-white shadow-lg animate-fade-in">
          {message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Forum</h2>
          <p className="text-sm text-gray-500">Aucun topic n’est pré-rempli. La discussion commence avec de vrais utilisateurs.</p>
        </div>
        <button
          onClick={() => setShowNewTopic(!showNewTopic)}
          className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-950"
        >
          {showNewTopic ? "Annuler" : "+ Nouveau topic"}
        </button>
      </div>

      {showNewTopic && (
        <div className="animate-fade-in-up space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Titre *</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
              placeholder="Ex : Quel lave-linge choisir pour un studio ?"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Categorie</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            >
              <option value="general">General</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Contenu *</label>
            <textarea
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-950"
              rows={4}
              placeholder="Decrivez votre question ou partagez votre experience..."
              value={newContent}
              onChange={(event) => setNewContent(event.target.value)}
            ></textarea>
          </div>
          <button
            onClick={handleNewTopic}
            disabled={saving || !newTitle.trim() || !newContent.trim()}
            className="w-full rounded-xl bg-blue-950 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-slate-950 disabled:opacity-50"
          >
            {saving ? "Publication..." : "Publier le topic"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto border-b-2 border-gray-100">
        <div className="flex gap-0">
          {FORUM_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                "whitespace-nowrap border-b-2 -mb-[2px] px-4 py-2.5 text-sm font-semibold transition-colors " +
                (activeTab === tab.id ? "border-blue-950 text-blue-950" : "border-transparent text-gray-400 hover:text-gray-600")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 h-4 w-2/3 rounded bg-gray-200"></div>
              <div className="h-3 w-1/3 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <EmptyState
          icon="?"
          title="Il n y a encore aucune discussion"
          description="Aucun topic n’est pré-rempli. Le premier contenu visible viendra d’un vrai compte utilisateur."
          action={() => setShowNewTopic(true)}
          actionLabel="Creer le premier topic"
        />
      ) : (
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {filteredTopics.map((topic) => (
            <div key={topic.id} onClick={() => openTopic(topic)} className="cursor-pointer p-4 transition-colors hover:bg-gray-50">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={"flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white " + getForumAvatarColor(topic.author_name)}>
                    {topic.author_name[0]}
                  </div>
                  <span className="text-xs font-semibold">{topic.author_name}</span>
                </div>
                <span className="text-[0.65rem] text-gray-400">{timeAgo(topic.created_at)}</span>
              </div>
              <h4 className="mb-1 text-sm font-bold">{topic.title}</h4>
              <p className="line-clamp-2 text-xs text-gray-500">{topic.content}</p>
              <div className="mt-2 flex gap-3">
                <span className="text-[0.7rem] text-gray-400">{topic.reply_count} réponse{topic.reply_count > 1 ? "s" : ""}</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-gray-500">{getForumCategoryLabel(topic.category)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 rounded-md bg-blue-950 px-2.5 py-0.5 text-[0.7rem] font-bold text-white shadow-sm">Mimo</span>
        <p className="mt-2 text-sm text-gray-800">
          Le forum reste volontairement vide tant que la communauté ne publie pas de contenu réel. Aucun topic n’est pré-rempli.
        </p>
      </div>
    </div>
  );
}
