"use client";

import { useEffect, useMemo, useState } from "react";
import { findProductOffers } from "@/lib/core";
import type { Offer } from "@/lib/data";
import { getFavorites, getOfferById, getOffers, recordView } from "@/lib/queries";
import { rankOffersByScore, toBaseOffer } from "@/lib/score/engine";

export function useProductOffers(offerId: string) {
  const [productOffer, setProductOffer] = useState<Offer | null>(null);
  const [merchantOffers, setMerchantOffers] = useState<Offer[]>([]);
  const [alternatives, setAlternatives] = useState<Offer[]>([]);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      let currentOffer = await getOfferById(offerId);

      if (!currentOffer && offerId.startsWith("bestbuy-")) {
        const response = await fetch("/api/bestbuy/offers?ids=" + encodeURIComponent(offerId));
        if (response.ok) {
          const json = await response.json();
          currentOffer = (json.offers?.[0] || null) as Offer | null;
        }
      }

      if (!currentOffer) {
        setProductOffer(null);
        setMerchantOffers([]);
        setAlternatives([]);
        setFavoriteOfferIds([]);
        setLoading(false);
        return;
      }

      void recordView(currentOffer.id).then(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("maref-history-updated"));
        }
      });
      const [sameSubcategoryOffers, favorites] = await Promise.all([
        getOffers({ subcategory: currentOffer.subcategory }),
        getFavorites(),
      ]);

      const sameProductOffers = findProductOffers(sameSubcategoryOffers, currentOffer).sort((a, b) => a.price - b.price);
      const groupedOffers = sameProductOffers.length > 0 ? sameProductOffers : [currentOffer];
      const nextAlternatives = sameSubcategoryOffers.filter((offer) => !groupedOffers.some((current) => current.id === offer.id));

      setProductOffer(groupedOffers[0]);
      setMerchantOffers(groupedOffers);
      setFavoriteOfferIds(favorites);
      setAlternatives(rankOffersByScore(nextAlternatives).map(toBaseOffer).slice(0, 4));
      setLoading(false);
    }

    void loadPage();
  }, [offerId]);

  const selectedOffer = useMemo(
    () => merchantOffers[0] || productOffer,
    [merchantOffers, productOffer],
  );

  return {
    productOffer,
    merchantOffers,
    alternatives,
    favoriteOfferIds,
    setFavoriteOfferIds,
    selectedOffer,
    loading,
  };
}
