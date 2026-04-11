"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ScoreCircle, StatusBadge, MimoCard, EmptyState, LoadingSkeleton } from "@/components/shared/Score";

type HistoryItem = {
  id: string;
  offer_id: string;
  product: string;
  brand: string;
  price: number;
  score: number;
  category: string;
  merchant: string;
  viewed_at: string;
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

export default function HistoriquePage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1. Get view history
      const { data: views } = await supabase
        .from("view_history")
        .select("id, offer_id, viewed_at")
        .order("viewed_at", { ascending: false })
        .limit(30);

      if (!views || views.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // 2. Get unique offer ids
      const offerIds = [...new Set(views.map((v: any) => v.offer_id))];

      // 3. Get offer details
      const { data: offers } = await supabase
        .from("offers")
        .select("id, product, brand, price, score, category, merchant")
        .in("id", offerIds);

      if (!offers) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // 4. Map offers by id
      const offersMap: Record<string, any> = {};
      offers.forEach((o: any) => { offersMap[o.id] = o; });

      // 5. Build history items
      const items: HistoryItem[] = views
        .filter((v: any) => offersMap[v.offer_id])
        .map((v: any) => ({
          id: v.id,
          offer_id: v.offer_id,
          viewed_at: v.viewed_at,
          product: offersMap[v.offer_id].product,
          brand: offersMap[v.offer_id].brand,
          price: offersMap[v.offer_id].price,
          score: offersMap[v.offer_id].score,
          category: offersMap[v.offer_id].category,
          merchant: offersMap[v.offer_id].merchant,
        }));

      // 6. Deduplicate (keep latest per offer)
      const seen = new Set<string>();
      const deduped = items.filter((item) => {
        if (seen.has(item.offer_id)) return false;
        seen.add(item.offer_id);
        return true;
      });

      setHistory(deduped);
      setLoading(false);
    }
    load();
  }, []);

  async function clearHistory() {
    await supabase.from("view_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setHistory([]);
  }

  // Group by date
  const grouped: Record<string, HistoryItem[]> = {};
  history.forEach((h) => {
    const date = new Date(h.viewed_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let label = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    if (date.toDateString() === today.toDateString()) label = "Aujourd hui";
    if (date.toDateString() === yesterday.toDateString()) label = "Hier";
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(h);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Historique</h2>
          <p className="text-sm text-gray-500">{history.length} offre{history.length > 1 ? "s" : ""} consultee{history.length > 1 ? "s" : ""}</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
            Effacer
          </button>
        )}
      </div>

      <MimoCard text="Votre historique vous permet de retrouver les offres consultees recemment. Reprenez votre analyse la ou vous l avez laissee." />

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="🕐"
          title="Aucun historique"
          description="Les offres que vous consultez apparaitront ici."
          action={() => router.push("/explorer")}
          actionLabel="Explorer les offres"
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{date}</h3>
              <div className="space-y-2">
                {items.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => router.push("/explorer/" + h.offer_id)}
                    className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-50 transition-colors">
                      {h.category === "electromenager" ? "🏠" : h.category === "froid" ? "❄️" : "📺"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{h.brand}</p>
                          <p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{h.product}</p>
                        </div>
                        <ScoreCircle score={h.score} size="sm" />
                      </div>
                      <p className="text-xs text-gray-400">{h.merchant} · {h.price.toLocaleString("fr-FR")} EUR</p>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge score={h.score} />
                        <span className="text-[0.65rem] text-gray-400">{timeAgo(h.viewed_at)}</span>
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