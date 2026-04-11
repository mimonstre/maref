"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ScoreCircle, StatusBadge, MimoCard, EmptyState, LoadingSkeleton } from "@/components/shared/Score";

type HistoryOffer = {
  id: string;
  product: string;
  brand: string;
  price: number;
  score: number;
  category: string;
  merchant: string;
};

export default function HistoriquePage() {
  const router = useRouter();
  const [offers, setOffers] = useState<HistoryOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("offers")
        .select("id, product, brand, price, score, category, merchant")
        .order("created_at", { ascending: false })
        .limit(15);

      if (data) setOffers(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Historique</h2>
        <p className="text-sm text-gray-500">Vos consultations recentes</p>
      </div>

      <MimoCard text="Votre historique vous permet de retrouver les offres consultees recemment. Reprenez votre analyse la ou vous l avez laissee." />

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : offers.length === 0 ? (
        <EmptyState
          icon="🕐"
          title="Aucun historique"
          description="Les offres que vous consultez apparaitront ici."
          action={() => router.push("/explorer")}
          actionLabel="Explorer les offres"
        />
      ) : (
        <div className="space-y-2.5">
          {offers.map((o) => (
            <div
              key={o.id}
              onClick={() => router.push("/explorer/" + o.id)}
              className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-50 transition-colors">
                {o.category === "electromenager" ? "🏠" : o.category === "froid" ? "❄️" : "📺"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p>
                    <p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{o.product}</p>
                  </div>
                  <ScoreCircle score={o.score} size="sm" />
                </div>
                <p className="text-xs text-gray-400">{o.merchant} · {o.price.toLocaleString("fr-FR")} EUR</p>
                <div className="mt-1">
                  <StatusBadge score={o.score} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}