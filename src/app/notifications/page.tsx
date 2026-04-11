"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRelativeDateLabel, timeAgo } from "@/lib/format";
import { getNotifications, type NotificationItem } from "@/lib/queries";
import { EmptyState, LoadingSkeleton, MimoCard } from "@/components/shared/Score";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotifications(await getNotifications());
      setLoading(false);
    }
    load();
  }, []);

  const grouped: Record<string, NotificationItem[]> = {};
  notifications.forEach((item) => {
    const label = getRelativeDateLabel(item.created_at);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Notifications</h2>
        <p className="text-sm text-gray-500">{notifications.length} notification{notifications.length > 1 ? "s" : ""}</p>
      </div>

      <MimoCard text="Cette page regroupe vos alertes et evenements importants. Les notifications non lues meritent votre attention en priorite." />

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Aucune notification"
          description="Les alertes et evenements importants apparaitront ici."
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{date}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.offer_id && router.push("/explorer/" + item.offer_id)}
                    className={"bg-white rounded-xl border p-3.5 transition-all " + (item.offer_id ? "cursor-pointer hover:shadow-md hover:border-emerald-300" : "border-gray-200")}
                  >
                    <div className="flex gap-3">
                      <div className={"w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 " + (item.read ? "bg-gray-50" : "bg-emerald-50")}>
                        {item.type.includes("price") ? "💸" : item.type.includes("project") ? "📁" : item.type.includes("forum") ? "💬" : "🔔"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.message}</p>
                          </div>
                          {!item.read && <span className="text-[0.6rem] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Nouveau</span>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[0.65rem] text-gray-400 uppercase tracking-wide">{item.type}</span>
                          <span className="text-[0.65rem] text-gray-400">{timeAgo(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
