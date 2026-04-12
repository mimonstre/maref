"use client";

import type { Offer } from "@/lib/data";
import { getOfferCompareFamily } from "./families";
import type { CompareGroup } from "./types";

const STORAGE_KEY = "maref.compare.groups";
const SNAPSHOT_STORAGE_KEY = "maref.compare.offer-snapshots";
const MAX_OFFERS_PER_GROUP = 3;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCompareGroups(): CompareGroup[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompareGroup[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((group) => ({
      ...group,
      offerIds: Array.from(new Set((group.offerIds || []).map((id) => String(id)))),
    }));
  } catch {
    return [];
  }
}

export function saveCompareGroups(groups: CompareGroup[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

type CompareOfferSnapshot = Pick<
  Offer,
  | "id"
  | "product"
  | "brand"
  | "model"
  | "category"
  | "subcategory"
  | "merchant"
  | "price"
  | "barredPrice"
  | "availability"
  | "delivery"
  | "warranty"
  | "score"
  | "status"
  | "statusColor"
  | "confidence"
  | "freshness"
  | "imageUrl"
  | "sourceUrl"
  | "lastUpdated"
  | "reliabilityScore"
  | "priceHistory"
  | "dataState"
  | "pefas"
  | "mimoShort"
  | "reasons"
  | "vigilances"
  | "specs"
>;

function loadSnapshotMap(): Record<string, CompareOfferSnapshot> {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CompareOfferSnapshot>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveSnapshotMap(snapshotMap: Record<string, CompareOfferSnapshot>) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshotMap));
}

function persistOfferSnapshot(offer: Offer) {
  const snapshotMap = loadSnapshotMap();
  snapshotMap[String(offer.id)] = {
    id: offer.id,
    product: offer.product,
    brand: offer.brand,
    model: offer.model,
    category: offer.category,
    subcategory: offer.subcategory,
    merchant: offer.merchant,
    price: offer.price,
    barredPrice: offer.barredPrice,
    availability: offer.availability,
    delivery: offer.delivery,
    warranty: offer.warranty,
    score: offer.score,
    status: offer.status,
    statusColor: offer.statusColor,
    confidence: offer.confidence,
    freshness: offer.freshness,
    imageUrl: offer.imageUrl,
    sourceUrl: offer.sourceUrl,
    lastUpdated: offer.lastUpdated,
    reliabilityScore: offer.reliabilityScore,
    priceHistory: offer.priceHistory,
    dataState: offer.dataState,
    pefas: offer.pefas,
    mimoShort: offer.mimoShort,
    reasons: offer.reasons,
    vigilances: offer.vigilances,
    specs: offer.specs,
  };
  saveSnapshotMap(snapshotMap);
}

export function loadCompareOfferSnapshots(): Offer[] {
  return Object.values(loadSnapshotMap()) as Offer[];
}

export function addOfferToCompareGroups(offer: Offer) {
  const offerId = String(offer.id);
  persistOfferSnapshot(offer);
  const groups = loadCompareGroups().map((group) => ({
    ...group,
    offerIds: Array.from(new Set(group.offerIds.map((id) => String(id)))),
  }));
  const family = getOfferCompareFamily(offer);
  const existingGroup = groups.find((group) => group.key === family.key);

  if (!existingGroup) {
    const nextGroups = [{ ...family, offerIds: [offerId], updatedAt: new Date().toISOString() }, ...groups];
    saveCompareGroups(nextGroups);
    return { status: "added" as const, family };
  }

  if (existingGroup.offerIds.includes(offerId)) {
    return { status: "exists" as const, family };
  }

  if (existingGroup.offerIds.length >= MAX_OFFERS_PER_GROUP) {
    return { status: "full" as const, family };
  }

  const nextGroups = groups.map((group) =>
    group.key === family.key
      ? { ...group, offerIds: [...group.offerIds, offerId], updatedAt: new Date().toISOString() }
      : group,
  );
  saveCompareGroups(nextGroups);

  return { status: "added" as const, family };
}

export function mergeOffersIntoCompareGroups(offers: Offer[]) {
  if (offers.length === 0) return loadCompareGroups();

  offers.forEach((offer) => persistOfferSnapshot(offer));

  const currentGroups = loadCompareGroups();
  const groupedOffers = offers.reduce<Record<string, { label: string; ids: string[] }>>((accumulator, offer) => {
    const family = getOfferCompareFamily(offer);
    if (!accumulator[family.key]) {
      accumulator[family.key] = { label: family.label, ids: [] };
    }

    const offerId = String(offer.id);
    if (!accumulator[family.key].ids.includes(offerId)) {
      accumulator[family.key].ids.push(offerId);
    }

    return accumulator;
  }, {});

  const merged = [...currentGroups];

  Object.entries(groupedOffers).forEach(([familyKey, info]) => {
    const existingIndex = merged.findIndex((group) => group.key === familyKey);
    const mergedIds = existingIndex >= 0
      ? Array.from(new Set([...merged[existingIndex].offerIds, ...info.ids])).slice(0, MAX_OFFERS_PER_GROUP)
      : info.ids.slice(0, MAX_OFFERS_PER_GROUP);

    const nextGroup = {
      key: familyKey,
      label: info.label,
      offerIds: mergedIds,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      merged[existingIndex] = nextGroup;
    } else {
      merged.push(nextGroup);
    }
  });

  const sorted = merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveCompareGroups(sorted);
  return sorted;
}

export function removeOfferFromCompareGroup(groupKey: string, offerId: string) {
  const nextGroups = loadCompareGroups()
    .map((group) =>
      group.key === groupKey
        ? { ...group, offerIds: group.offerIds.filter((id) => id !== offerId), updatedAt: new Date().toISOString() }
        : group,
    )
    .filter((group) => group.offerIds.length > 0);

  saveCompareGroups(nextGroups);
  return nextGroups;
}

export function clearCompareGroup(groupKey: string) {
  const nextGroups = loadCompareGroups().filter((group) => group.key !== groupKey);
  saveCompareGroups(nextGroups);
  return nextGroups;
}
