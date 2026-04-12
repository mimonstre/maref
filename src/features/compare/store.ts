"use client";

import type { Offer } from "@/lib/data";
import { getOfferCompareFamily } from "./families";
import type { CompareGroup } from "./types";

const STORAGE_KEY = "maref.compare.groups";
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCompareGroups(groups: CompareGroup[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function addOfferToCompareGroups(offer: Offer) {
  const offerId = String(offer.id);
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

  const currentGroups = loadCompareGroups();
  const groupedOffers = offers.reduce<Record<string, { label: string; ids: string[] }>>((accumulator, offer) => {
    const family = getOfferCompareFamily(offer);
    if (!accumulator[family.key]) {
      accumulator[family.key] = { label: family.label, ids: [] };
    }

    if (!accumulator[family.key].ids.includes(offer.id)) {
      accumulator[family.key].ids.push(offer.id);
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
