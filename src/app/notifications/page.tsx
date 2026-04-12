"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationItem } from "@/lib/core";
import { EmptyState, LoadingSkeleton, MimoCard } from "@/components/shared/Score";
import { getRelativeDateLabel, timeAgo } from "@/lib/format";
import { getNotifications } from "@/lib/queries";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const nextNotifications = await getNotifications();
      if (!cancelled) {
        setNotifications(nextNotifications);
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
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
        <p className="text-sm text-gray-500">
          {notifications.length} notification{notifications.length > 1 ? "s" : ""}
        </p>
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
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{date}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.offer_id && router.push("/explorer/" + item.offer_id)}
                    className={
                      "rounded-xl border bg-white p-3.5 transition-all " +
                      (item.offer_id ? "cursor-pointer hover:border-blue-300 hover:shadow-md" : "border-gray-200")
                    }
                  >
                    <div className="flex gap-3">
                      <div
                        className={
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl " +
                          (item.read ? "bg-gray-50" : "bg-blue-50")
                        }
                      >
                        {item.type.includes("price")
                          ? "💸"
                          : item.type.includes("project")
                            ? "📁"
                            : item.type.includes("forum")
                              ? "💬"
                              : "🔔"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{item.message}</p>
                          </div>
                          {!item.read && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-[0.6rem] font-bold text-blue-700">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[0.65rem] uppercase tracking-wide text-gray-400">{item.type}</span>
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
