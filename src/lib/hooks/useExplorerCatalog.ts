"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/core";
import { groupOffersIntoProducts } from "@/lib/core";
import type { Offer } from "@/lib/data";
import { getOffers } from "@/lib/queries";
import { rankOffersByScore, toBaseOffer } from "@/lib/score/engine";

type ExplorerFilters = {
  category?: string | null;
  subcategory?: string | null;
  search?: string;
  sort?: string;
  selectedBrand?: string;
  selectedMerchant?: string;
  priceBand?: string;
  inStockOnly?: boolean;
};

export function useExplorerCatalog(filters: ExplorerFilters) {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [bestBuyAvailable, setBestBuyAvailable] = useState(false);

  async function fetchBestBuyOffersLive(input: {
    category?: string | null;
    subcategory?: string | null;
    search?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (input.category) params.set("category", input.category);
    if (input.subcategory) params.set("subcategory", input.subcategory);
    if (input.search) params.set("search", input.search);
    params.set("limit", String(input.limit || 12));

    const response = await fetch("/api/bestbuy/offers?" + params.toString());
    if (!response.ok) {
      setBestBuyAvailable(false);
      return [];
    }

    const json = await response.json();
    setBestBuyAvailable(true);
    return (json.offers || []) as Offer[];
  }

  useEffect(() => {
    void getOffers({}).then((data) => setAllOffers(data));
  }, []);

  useEffect(() => {
    if (!filters.subcategory && !filters.search) return;

    async function load() {
      setLoading(true);
      const localData = await getOffers({
        category: filters.category || undefined,
        subcategory: filters.subcategory || undefined,
        search: filters.search || undefined,
        sort: filters.sort,
      });

      let nextOffers = localData;

      if (nextOffers.length === 0 && (filters.subcategory || filters.search)) {
        const liveData = await fetchBestBuyOffersLive({
          category: filters.category,
          subcategory: filters.subcategory,
          search: filters.search,
        });

        if (liveData.length > 0) {
          nextOffers = liveData;
        }
      }

      setOffers(filters.sort === "score" ? rankOffersByScore(nextOffers).map(toBaseOffer) : nextOffers);
      setLoading(false);
    }

    void load();
  }, [filters.category, filters.search, filters.sort, filters.subcategory]);

  const brands = useMemo(() => [...new Set(allOffers.map((offer) => offer.brand))], [allOffers]);
  const merchants = useMemo(() => [...new Set(allOffers.map((offer) => offer.merchant))], [allOffers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (filters.selectedBrand && filters.selectedBrand !== "all" && offer.brand !== filters.selectedBrand) return false;
      if (filters.selectedMerchant && filters.selectedMerchant !== "all" && offer.merchant !== filters.selectedMerchant) return false;
      if (filters.inStockOnly && offer.availability !== "Disponible") return false;
      if (filters.priceBand === "budget" && offer.price > 500) return false;
      if (filters.priceBand === "mid" && (offer.price < 500 || offer.price > 1000)) return false;
      if (filters.priceBand === "premium" && offer.price < 1000) return false;
      return true;
    });
  }, [filters.inStockOnly, filters.priceBand, filters.selectedBrand, filters.selectedMerchant, offers]);

  const products = useMemo<Product[]>(() => groupOffersIntoProducts(filteredOffers), [filteredOffers]);

  return {
    allOffers,
    offers,
    filteredOffers,
    products,
    brands,
    merchants,
    loading,
    bestBuyAvailable,
  };
}
