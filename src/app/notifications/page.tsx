"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { MimoCard, EmptyState, LoadingSkeleton } from "@/components/shared/Score";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
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

function getNotifIcon(type: string) {
  switch (type) {
    case "price": return "💰";
    case "project": return "📁";
    case "mimo": return "🤖";
    case "guide": return "📚";
    case "forum": return "💬";
    case "badge": return "🏆";
    case "level": return "⭐";
    case "welcome": return "👋";
    default: return "🔔";
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        setNotifications(data);
      } else {
        // Default notifications if table is empty
        setNotifications([
          { id: "n1", type: "welcome", title: "Bienvenue sur MAREF", message: "Votre compte est cree. Explorez les offres et commencez a structurer vos decisions d achat.", read: false, link: "/explorer", created_at: new Date().toISOString() },
          { id: "n2", type: "mimo", title: "Conseil Mimo", message: "Commencez par completer votre profil pour obtenir des scores personnalises selon vos criteres.", read: false, link: "/profil", created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: "n3", type: "guide", title: "Nouveau module disponible", message: "Le module Comprendre le Score MAREF est disponible. Apprenez comment fonctionne l analyse multi-axes.", read: false, link: "/guide", created_at: new Date(Date.now() - 7200000).toISOString() },
          { id: "n4", type: "price", title: "Baisse de prix detectee", message: "Le Samsung EcoClean 8kg a baisse de 12% chez Boulanger. Score MAREF : 82/100.", read: true, link: "/explorer", created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: "n5", type: "project", title: "Rappel projet", message: "Votre projet n a pas ete mis a jour depuis 3 jours. Ajoutez de nouvelles offres pour affiner votre analyse.", read: true, link: "/projets", created_at: new Date(Date.now() - 172800000).toISOString() },
          { id: "n6", type: "forum", title: "Nouvelle reponse", message: "Quelqu un a repondu a votre discussion sur le forum. Consultez les nouvelles contributions.", read: true, link: "/forum", created_at: new Date(Date.now() - 259200000).toISOString() },
          { id: "n7", type: "badge", title: "Badge debloque", message: "Felicitations ! Vous avez debloque le badge Explorateur en consultant 5 fiches offres.", read: true, link: "/profil", created_at: new Date(Date.now() - 345600000).toISOString() },
          { id: "n8", type: "mimo", title: "Analyse Mimo", message: "D apres votre profil, les lave-linge avec pompe a chaleur offrent le meilleur rapport cout total sur 5 ans.", read: true, link: "/assistant", created_at: new Date(Date.now() - 432000000).toISOString() },
        ]);
      }
      setLoading(false);
    }
    load();
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function handleClick(notif: Notification) {
    markAsRead(notif.id);
    if (notif.link) router.push(notif.link);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.read);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Notifications</h2>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? unreadCount + " non lue" + (unreadCount > 1 ? "s" : "") : "Tout est a jour"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={"text-xs font-semibold px-3 py-1.5 rounded-full transition-colors " + (filter === "all" ? "bg-emerald-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300")}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={"text-xs font-semibold px-3 py-1.5 rounded-full transition-colors " + (filter === "unread" ? "bg-emerald-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300")}
        >
          Non lues ({unreadCount})
        </button>
      </div>

      <MimoCard text={"Vous avez " + unreadCount + " notification" + (unreadCount > 1 ? "s" : "") + " non lue" + (unreadCount > 1 ? "s" : "") + ". " + (unreadCount > 0 ? "Consultez-les pour ne rien manquer." : "Tout est a jour, continuez vos analyses.")} />

      {loading ? (
        <LoadingSkeleton count={5} type="simple" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Aucune notification"
          description={filter === "unread" ? "Toutes vos notifications ont ete lues." : "Vous n avez pas encore de notifications."}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={"flex gap-3 p-4 transition-colors cursor-pointer " + (n.read ? "hover:bg-gray-50" : "bg-emerald-50/30 hover:bg-emerald-50/50")}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0">
                  {getNotifIcon(n.type)}
                </div>
                {!n.read && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={"text-sm truncate " + (n.read ? "font-medium" : "font-bold")}>{n.title}</p>
                  <span className="text-[0.65rem] text-gray-400 shrink-0">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                {n.link && (
                  <span className="inline-block text-[0.65rem] font-semibold text-emerald-700 mt-1">Voir →</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}