"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, LoadingSkeleton, MimoCard, ScoreCircle, StatusBadge } from "@/components/shared/Score";
import { getCategoryIcon } from "@/lib/categories";
import { getRelativeDateLabel, timeAgo } from "@/lib/format";
import { clearViewHistory, getViewHistory } from "@/lib/queries";

type HistoryItem = Awaited<ReturnType<typeof getViewHistory>>[number];

export default function HistoriquePage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setHistory(await getViewHistory());
      setLoading(false);
    }

    void Promise.resolve().then(load);
  }, []);

  async function handleClearHistory() {
    await clearViewHistory();
    setHistory([]);
  }

  const grouped: Record<string, HistoryItem[]> = {};
  history.forEach((item) => {
    const label = getRelativeDateLabel(item.viewed_at);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Historique</h2>
          <p className="text-sm text-gray-500">{history.length} consultation{history.length > 1 ? "s" : ""}</p>
        </div>
        {history.length > 0 && (
          <button onClick={handleClearHistory} className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
            Effacer
          </button>
        )}
      </div>

      <MimoCard text="Votre historique ne remonte que les consultations reellement enregistrees. Si aucune offre n a ete ouverte, cette page reste vide." />

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="?"
          title="Aucun historique"
          description="Cette page n affiche que les consultations reellement enregistrees."
          action={() => router.push("/explorer")}
          actionLabel="Explorer les offres"
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
                    onClick={() => router.push("/explorer/" + item.offer_id)}
                    className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-50 transition-colors">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{item.brand}</p>
                          <p className="font-semibold text-sm truncate group-hover:text-blue-700 transition-colors">{item.product}</p>
                        </div>
                        <ScoreCircle score={item.score} size="sm" />
                      </div>
                      <p className="text-xs text-gray-400">{item.merchant} · {item.price.toLocaleString("fr-FR")} EUR</p>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge score={item.score} />
                        <span className="text-[0.65rem] text-gray-400">{timeAgo(item.viewed_at)}</span>
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
