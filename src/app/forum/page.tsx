"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

type Topic = {
  id: string;
  title: string;
  content: string;
  category: string;
  author_name: string;
  created_at: string;
  reply_count?: number;
};

type Reply = {
  id: string;
  content: string;
  author_name: string;
  votes: number;
  created_at: string;
};

function timeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "A l instant";
  if (diff < 3600) return "Il y a " + Math.floor(diff / 60) + " min";
  if (diff < 86400) return "Il y a " + Math.floor(diff / 3600) + "h";
  if (diff < 604800) return "Il y a " + Math.floor(diff / 86400) + "j";
  return then.toLocaleDateString("fr-FR");
}

function getAvatarColor(name: string) {
  const colors = ["bg-emerald-600", "bg-blue-500", "bg-indigo-500", "bg-orange-500", "bg-pink-500", "bg-yellow-500", "bg-red-500", "bg-teal-500"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ForumPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadTopics() {
    setLoading(true);
    const { data } = await supabase.from("forum_topics").select("*").order("created_at", { ascending: false });
    if (data) {
      const topicsWithCounts: Topic[] = [];
      for (const t of data) {
        const { count } = await supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("topic_id", t.id);
        topicsWithCounts.push({ ...t, reply_count: count || 0 });
      }
      setTopics(topicsWithCounts);
    }
    setLoading(false);
  }

  async function loadReplies(topicId: string) {
    const { data } = await supabase.from("forum_replies").select("*").eq("topic_id", topicId).order("created_at", { ascending: true });
    if (data) setReplies(data);
  }

  useEffect(() => { loadTopics(); }, []);

  async function openTopic(topic: Topic) {
    setActiveTopic(topic);
    await loadReplies(topic.id);
  }

  async function handleNewTopic() {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    const authorName = user?.user_metadata?.name || "Anonyme";
    const { error } = await supabase.from("forum_topics").insert({
      title: newTitle,
      content: newContent,
      category: newCategory,
      author_name: authorName,
      user_id: user?.id || null,
    });
    if (!error) {
      setNewTitle(""); setNewContent(""); setShowNewTopic(false);
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
    const { error } = await supabase.from("forum_replies").insert({
      topic_id: activeTopic.id,
      content: replyText,
      author_name: authorName,
      user_id: user?.id || null,
    });
    if (!error) {
      setReplyText("");
      setMessage("Reponse publiee");
      setTimeout(() => setMessage(""), 2000);
      await loadReplies(activeTopic.id);
      await loadTopics();
    }
    setSaving(false);
  }

  async function handleVote(replyId: string) {
    const reply = replies.find((r) => r.id === replyId);
    if (!reply) return;
    await supabase.from("forum_replies").update({ votes: reply.votes + 1 }).eq("id", replyId);
    setReplies((prev) => prev.map((r) => r.id === replyId ? { ...r, votes: r.votes + 1 } : r));
  }

  const filteredTopics = activeTab === "recent"
    ? topics
    : topics.filter((t) => t.category.toLowerCase().includes(activeTab));

  // ===== TOPIC DETAIL =====
  if (activeTopic) {
    return (
      <div className="space-y-4">
        {message && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
            {message}
          </div>
        )}

        <button onClick={() => { setActiveTopic(null); setReplies([]); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          Retour au forum
        </button>

        {/* Topic */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold " + getAvatarColor(activeTopic.author_name)}>
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
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{activeTopic.category}</span>
            <span className="text-xs text-gray-400">{replies.length} reponse{replies.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Replies */}
        <div>
          <h3 className="font-bold text-sm mb-3">Reponses ({replies.length})</h3>
          {replies.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-400">Aucune reponse. Soyez le premier !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={"w-7 h-7 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold " + getAvatarColor(r.author_name)}>
                      {r.author_name[0]}
                    </div>
                    <span className="font-semibold text-xs">{r.author_name}</span>
                    <span className="text-[0.65rem] text-gray-400">{timeAgo(r.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                  <button onClick={() => handleVote(r.id)} className="mt-2 text-xs text-emerald-600 font-medium hover:text-emerald-800 transition-colors">
                    ▲ {r.votes}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h4 className="font-bold text-sm mb-2">Repondre</h4>
          <textarea
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 resize-none"
            rows={3}
            placeholder="Votre reponse..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          ></textarea>
          <button
            onClick={handleReply}
            disabled={saving || !replyText.trim()}
            className="mt-2 bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {saving ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>
    );
  }

  // ===== FORUM LIST =====
  return (
    <div className="space-y-4">
      {message && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
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
          className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
        >
          {showNewTopic ? "Annuler" : "+ Nouveau topic"}
        </button>
      </div>

      {/* New topic form */}
      {showNewTopic && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-sm animate-fade-in-up">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Titre *</label>
            <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" placeholder="Ex: Quel lave-linge choisir pour un studio ?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Categorie</label>
            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              <option>General</option>
              <option>Electromenager</option>
              <option>Froid</option>
              <option>Televiseurs</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Contenu *</label>
            <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 resize-none" rows={4} placeholder="Decrivez votre question ou partagez votre experience..." value={newContent} onChange={(e) => setNewContent(e.target.value)}></textarea>
          </div>
          <button onClick={handleNewTopic} disabled={saving || !newTitle.trim() || !newContent.trim()} className="w-full bg-emerald-700 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50 text-sm shadow-md">
            {saving ? "Publication..." : "Publier le topic"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b-2 border-gray-100 overflow-x-auto">
        {[
          { id: "recent", label: "Recent" },
          { id: "electromenager", label: "Electromenager" },
          { id: "froid", label: "Froid" },
          { id: "televiseurs", label: "TV" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={"px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-colors " + (activeTab === tab.id ? "text-emerald-700 border-emerald-700" : "text-gray-400 border-transparent hover:text-gray-600")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Topics list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">💬</p>
          <h3 className="font-bold text-gray-600 mb-1">Aucun topic</h3>
          <p className="text-sm text-gray-400">Soyez le premier a lancer une discussion !</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {filteredTopics.map((t) => (
            <div key={t.id} onClick={() => openTopic(t)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold " + getAvatarColor(t.author_name)}>
                    {t.author_name[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-xs">{t.author_name}</span>
                  </div>
                </div>
                <span className="text-[0.65rem] text-gray-400">{timeAgo(t.created_at)}</span>
              </div>
              <h4 className="font-bold text-sm mb-1">{t.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{t.content}</p>
              <div className="flex gap-3 mt-2">
                <span className="text-[0.7rem] text-gray-400">{t.reply_count} reponse{(t.reply_count || 0) > 1 ? "s" : ""}</span>
                <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{t.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mimo */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
        <span className="absolute -top-2.5 left-4 bg-emerald-700 text-white text-[0.7rem] font-bold px-2.5 py-0.5 rounded-md shadow-sm">Mimo</span>
        <p className="text-sm text-gray-800 mt-2">
          Le forum vous permet d echanger avec d autres decideurs. Partagez vos retours d experience et beneficiez des conseils de la communaute.
        </p>
      </div>
    </div>
  );
}