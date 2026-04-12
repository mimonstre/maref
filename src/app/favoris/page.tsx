"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, ScoreCircle } from "@/components/shared/Score";
import { getCategoryIcon } from "@/lib/categories";
import { getOfferDisplayScore } from "@/lib/score/engine";
import { getFavorites, getOffers, removeFavorite } from "@/lib/queries";
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
    setFavOffers(allOffers.filter((offer: Offer) => favIds.includes(offer.id)));
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(loadFavorites);
  }, []);

  async function handleRemove(offerId: string) {
    await removeFavorite(offerId);
    setFavOffers((prev) => prev.filter((offer) => offer.id !== offerId));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Favoris</h2>
      <p className="text-sm text-gray-500">{favOffers.length} offre{favOffers.length > 1 ? "s" : ""} en favoris</p>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 animate-pulse">
              <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : favOffers.length === 0 ? (
        <EmptyState
          icon="?"
          title="Aucun favori"
          description="Cette page n affiche que les offres que vous avez reellement ajoutees en favoris."
          action={() => router.push("/explorer")}
          actionLabel="Explorer"
        />
      ) : (
        <div className="space-y-2.5">
          {favOffers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-3.5 flex gap-3 hover:shadow-md transition-all">
              <div onClick={() => router.push("/explorer/" + offer.id)} className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0 cursor-pointer">
                {getCategoryIcon(offer.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => router.push("/explorer/" + offer.id)}>
                    <p className="text-[0.7rem] text-gray-400 font-medium uppercase tracking-wide">{offer.brand}</p>
                    <p className="font-semibold text-sm truncate">{offer.product}</p>
                  </div>
                  <ScoreCircle score={getOfferDisplayScore(offer)} />
                </div>
                <p className="text-xs text-gray-400">{offer.merchant} · {offer.availability}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-bold">{offer.price.toLocaleString("fr-FR")} EUR</span>
                  <button onClick={() => handleRemove(offer.id)} className="text-xs text-red-500 font-medium hover:text-red-700">
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
