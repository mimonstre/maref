"use client";

import type { Offer } from "@/lib/data";
import { emitQuestUnlocked } from "@/lib/core/questNotifications";
import { incrementCompareCount } from "@/lib/services/offers";
import { loadPersistedCompareState, savePersistedCompareState } from "@/lib/services/accountMemory";
import { getOfferCompareFamily } from "./families";
import type { CompareGroup, CompareOfferSnapshot, PersistedCompareState } from "./types";

const STORAGE_KEY = "maref.compare.groups";
const SNAPSHOT_STORAGE_KEY = "maref.compare.offer-snapshots";
const MAX_OFFERS_PER_GROUP = 3;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeGroups(groups: CompareGroup[]) {
  return groups.map((group) => ({
    ...group,
    offerIds: Array.from(new Set((group.offerIds || []).map((id) => String(id)))).slice(0, MAX_OFFERS_PER_GROUP),
    updatedAt: group.updatedAt || new Date().toISOString(),
  }));
}

function pruneGroupsAgainstSnapshots(groups: CompareGroup[], snapshots: Record<string, CompareOfferSnapshot>) {
  return normalizeGroups(groups)
    .map((group) => ({
      ...group,
      offerIds: group.offerIds.filter((id) => Boolean(snapshots[String(id)])),
    }))
    .filter((group) => group.offerIds.length > 0);
}

export function loadCompareGroups(): CompareGroup[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompareGroup[];
    if (!Array.isArray(parsed)) return [];
    return normalizeGroups(parsed);
  } catch {
    return [];
  }
}

export function saveCompareGroups(groups: CompareGroup[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeGroups(groups)));
}

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

function toSnapshot(offer: Offer): CompareOfferSnapshot {
  return {
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
}

function persistOfferSnapshot(offer: Offer) {
  const snapshotMap = loadSnapshotMap();
  snapshotMap[String(offer.id)] = toSnapshot(offer);
  saveSnapshotMap(snapshotMap);
}

function buildPersistedState(groups: CompareGroup[]): PersistedCompareState {
  return {
    groups: normalizeGroups(groups),
    snapshots: loadSnapshotMap(),
    updatedAt: new Date().toISOString(),
  };
}

function mergeGroupLists(accountGroups: CompareGroup[], localGroups: CompareGroup[]) {
  const merged = [...normalizeGroups(accountGroups)];

  normalizeGroups(localGroups).forEach((group) => {
    const existingIndex = merged.findIndex((item) => item.key === group.key);
    if (existingIndex === -1) {
      merged.push(group);
      return;
    }

    merged[existingIndex] = {
      ...merged[existingIndex],
      offerIds: Array.from(new Set([...merged[existingIndex].offerIds, ...group.offerIds])).slice(0, MAX_OFFERS_PER_GROUP),
      updatedAt: merged[existingIndex].updatedAt > group.updatedAt ? merged[existingIndex].updatedAt : group.updatedAt,
    };
  });

  return merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function syncPersistedState(groups: CompareGroup[]) {
  const state = buildPersistedState(groups);
  await savePersistedCompareState(state);
  return state.groups;
}

async function registerComparisonIfReady(previousCount: number, nextCount: number) {
  if (previousCount < 2 && nextCount >= 2) {
    await incrementCompareCount();
    emitQuestUnlocked("Quête réussie : comparaison lancée.");
  }
}

export async function hydrateCompareState() {
  const localGroups = loadCompareGroups();
  const localSnapshots = loadSnapshotMap();
  const persistedState = await loadPersistedCompareState();

  if (!persistedState) {
    const prunedLocalGroups = pruneGroupsAgainstSnapshots(localGroups, localSnapshots);
    saveCompareGroups(prunedLocalGroups);
    return {
      groups: prunedLocalGroups,
      snapshots: localSnapshots,
    };
  }

  const mergedSnapshots = { ...persistedState.snapshots, ...localSnapshots };
  const mergedGroups = pruneGroupsAgainstSnapshots(mergeGroupLists(persistedState.groups, localGroups), mergedSnapshots);

  saveCompareGroups(mergedGroups);
  saveSnapshotMap(mergedSnapshots);

  await savePersistedCompareState({
    groups: mergedGroups,
    snapshots: mergedSnapshots,
    updatedAt: new Date().toISOString(),
  });

  return {
    groups: mergedGroups,
    snapshots: mergedSnapshots,
  };
}

export function loadCompareOfferSnapshots(): Offer[] {
  return Object.values(loadSnapshotMap()) as Offer[];
}

export async function addOfferToCompareGroups(offer: Offer) {
  const offerId = String(offer.id);
  persistOfferSnapshot(offer);
  const hydrated = await hydrateCompareState();
  const groups = normalizeGroups(hydrated.groups);
  const family = getOfferCompareFamily(offer);
  const existingGroup = groups.find((group) => group.key === family.key);

  if (!existingGroup) {
    const nextGroups = [{ ...family, offerIds: [offerId], updatedAt: new Date().toISOString() }, ...groups];
    saveCompareGroups(nextGroups);
    await syncPersistedState(nextGroups);
    return { status: "added" as const, family, groups: nextGroups };
  }

  if (existingGroup.offerIds.includes(offerId)) {
    return { status: "exists" as const, family, groups };
  }

  if (existingGroup.offerIds.length >= MAX_OFFERS_PER_GROUP) {
    return { status: "full" as const, family, groups };
  }

  const nextGroups = groups.map((group) =>
    group.key === family.key
      ? { ...group, offerIds: [...group.offerIds, offerId], updatedAt: new Date().toISOString() }
      : group,
  );

  saveCompareGroups(nextGroups);
  await registerComparisonIfReady(existingGroup.offerIds.length, existingGroup.offerIds.length + 1);
  await syncPersistedState(nextGroups);
  return { status: "added" as const, family, groups: nextGroups };
}

export async function mergeOffersIntoCompareGroups(offers: Offer[]) {
  if (offers.length === 0) return (await hydrateCompareState()).groups;

  offers.forEach((offer) => persistOfferSnapshot(offer));

  const currentGroups = (await hydrateCompareState()).groups;
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
    const previousCount = existingIndex >= 0 ? merged[existingIndex].offerIds.length : 0;
    const mergedIds =
      existingIndex >= 0
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

    void registerComparisonIfReady(previousCount, mergedIds.length);
  });

  const sorted = merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveCompareGroups(sorted);
  await syncPersistedState(sorted);
  return sorted;
}

export async function removeOfferFromCompareGroup(groupKey: string, offerId: string) {
  const hydrated = await hydrateCompareState();
  const nextGroups = hydrated.groups
    .map((group) =>
      group.key === groupKey
        ? { ...group, offerIds: group.offerIds.filter((id) => id !== offerId), updatedAt: new Date().toISOString() }
        : group,
    )
    .filter((group) => group.offerIds.length > 0);

  saveCompareGroups(nextGroups);
  await syncPersistedState(nextGroups);
  return nextGroups;
}

export async function clearCompareGroup(groupKey: string) {
  const hydrated = await hydrateCompareState();
  const nextGroups = hydrated.groups.filter((group) => group.key !== groupKey);
  saveCompareGroups(nextGroups);
  await syncPersistedState(nextGroups);
  return nextGroups;
}
