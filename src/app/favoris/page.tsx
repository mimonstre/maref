"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreCircle } from "@/components/shared/Score";
import { getCategoryIcon } from "@/lib/categories";
import { getFavorites, removeFavorite, getOffers } from "@/lib/queries";
import type { Offer } from "@/lib/data";

export default function FavorisPage() {
  const router = useRouter();
  const [favOffers, setFavOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    setLoading(true);
    const favIds = await getFavorites();
    if (favIds.length === 0) {
      setFavOffers([]);
      setLoading(false);
      return;
    }
    const allOffers = await getOffers({});
    const matched = allOffers.filter((o: Offer) => favIds.includes(o.id));
    setFavOffers(matched);
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(loadFavorites);
  }, []);

  async function handleRemove(offerId: string) {
    await removeFavorite(offerId);
    setFavOffers((prev) => prev.filter((o) => o.id !== offerId));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Favoris</h2>
      <p className="text-sm text-gray-500">{favOffers.length} offre{favOffers.length > 1 ? "s" : ""} sauvegardee{favOffers.length > 1 ? "s" : ""}</p>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 animate-pulse">
              <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : favOffers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">❤️</p>
          <h3 className="font-bold text-gray-600 mb-1">Aucun favori</h3>
          <p className="text-sm text-gray-400 mb-4">Sauvegardez des offres pour les retrouver ici.</p>
          <button onClick={() => router.push("/explorer")} className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
            Explorer
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {favOffers.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md transition-all">
              <div onClick={() => router.push("/explorer/" + o.id)} className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0 cursor-pointer">
                {getCategoryIcon(o.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => router.push("/explorer/" + o.id)}>
                    <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{o.brand}</p>
                    <p className="font-semibold text-sm truncate">{o.product}</p>
                  </div>
                  <ScoreCircle score={o.score} />
                </div>
                <p className="text-xs text-gray-400">{o.merchant} · {o.availability}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-bold">{o.price.toLocaleString("fr-FR")} EUR</span>
                  <button onClick={() => handleRemove(o.id)} className="text-xs text-red-500 font-medium hover:text-red-700">
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
