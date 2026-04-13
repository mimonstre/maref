import type { NotificationItem } from "@/lib/core";
import { getDemoOfferById, getFilteredDemoOffers, getSupplementalDemoOffers } from "@/lib/demo/offers";
import { mapOfferRow, type OfferRow } from "./offerMapper";
import { supabase } from "./supabase";

type FavoriteRow = { offer_id: string };
type ViewHistoryRow = { id: string; offer_id: string; viewed_at: string };
type OfferHistoryRow = {
  id: string;
  product: string;
  brand: string;
  price: number;
  score: number | null;
  category: string;
  subcategory: string;
  merchant: string;
};
type GenericRow = Record<string, unknown>;
type LocalHistoryRow = ViewHistoryRow;

const LOCAL_FAVORITES_KEY = "maref.local.favorites";
const LOCAL_HISTORY_KEY = "maref.local.history";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadLocalFavoriteIds() {
  if (!canUseStorage()) return [] as string[];

  try {
    const raw = window.localStorage.getItem(LOCAL_FAVORITES_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveLocalFavoriteIds(ids: string[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(Array.from(new Set(ids.map(String)))));
}

function loadLocalHistoryRows() {
  if (!canUseStorage()) return [] as LocalHistoryRow[];

  try {
    const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as LocalHistoryRow[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalHistoryRows(rows: LocalHistoryRow[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(rows.slice(0, 60)));
}

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function isDemoCatalogEnabled() {
  return process.env.NEXT_PUBLIC_MAREF_DEMO_CATALOG === "true";
}

function getDemoCatalog(filters?: {
  category?: string;
  subcategory?: string;
  search?: string;
}) {
  return isDemoCatalogEnabled() ? getFilteredDemoOffers(filters) : [];
}

export async function getOffers(filters?: {
  category?: string;
  subcategory?: string;
  search?: string;
  sort?: string;
}) {
  let query = supabase.from("offers").select("*");

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.subcategory) query = query.eq("subcategory", filters.subcategory);
  if (filters?.search) {
    query = query.or(`product.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,merchant.ilike.%${filters.search}%`);
  }

  switch (filters?.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("score", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erreur chargement offres:", error);
    return getDemoCatalog(filters);
  }

  if (!data || data.length === 0) {
    return getDemoCatalog(filters);
  }

  const mappedOffers = data.map((item) => mapOfferRow(item as OfferRow));

  if (filters?.search) {
    return mappedOffers.length > 0 ? mappedOffers : getDemoCatalog(filters);
  }

  const supplementalOffers = isDemoCatalogEnabled() ? getSupplementalDemoOffers(mappedOffers, filters, 20) : [];
  return [...mappedOffers, ...supplementalOffers];
}

export async function getOfferById(id: string) {
  const { data, error } = await supabase.from("offers").select("*").eq("id", id).single();
  if (error || !data) return isDemoCatalogEnabled() ? getDemoOfferById(id) : null;
  return mapOfferRow(data as OfferRow);
}

export async function getProjects() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function addFavorite(offerId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("offer_id", offerId);
  if (existing && existing.length > 0) return true;

  const { error } = await supabase.from("favorites").insert({ user_id: userId, offer_id: offerId });

  if (error) {
    const localFavorites = loadLocalFavoriteIds();
    if (!localFavorites.includes(String(offerId))) {
      saveLocalFavoriteIds([...localFavorites, String(offerId)]);
    }
    return true;
  }

  const localFavorites = loadLocalFavoriteIds().filter((id) => id !== String(offerId));
  saveLocalFavoriteIds(localFavorites);
  return true;
}

export async function removeFavorite(offerId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("offer_id", offerId);
  const localFavorites = loadLocalFavoriteIds().filter((id) => id !== String(offerId));
  saveLocalFavoriteIds(localFavorites);
  return !error || true;
}

export async function getFavorites() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("offer_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  const localFavorites = loadLocalFavoriteIds();
  if (error || !data) return localFavorites;
  return Array.from(new Set([...data.map((item) => (item as FavoriteRow).offer_id), ...localFavorites]));
}

export async function recordView(offerId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const localRows = loadLocalHistoryRows();
  saveLocalHistoryRows([
    {
      id: `local-${offerId}-${Date.now()}`,
      offer_id: String(offerId),
      viewed_at: new Date().toISOString(),
    },
    ...localRows,
  ]);

  try {
    await supabase.from("view_history").insert({ user_id: userId, offer_id: offerId });
  } catch {}
}

export async function getViewHistory() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data } = await supabase
    .from("view_history")
    .select("id, offer_id, viewed_at")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(30);
  const dbRows = (data || []) as ViewHistoryRow[];
  const localRows = loadLocalHistoryRows();
  const historyRows = [...dbRows, ...localRows]
    .sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())
    .slice(0, 30);

  if (historyRows.length === 0) return [];

  const catalog = await getOffers({});
  const offersMap = Object.fromEntries(
    catalog.map((offer) => [
      offer.id,
      {
        id: offer.id,
        product: offer.product,
        brand: offer.brand,
        price: offer.price,
        score: offer.score,
        category: offer.category,
        subcategory: offer.subcategory,
        merchant: offer.merchant,
      } satisfies OfferHistoryRow,
    ]),
  );

  return historyRows
    .filter((item) => offersMap[item.offer_id])
    .map((item) => ({
      ...offersMap[item.offer_id],
      history_id: item.id,
      offer_id: item.offer_id,
      viewed_at: item.viewed_at,
    }));
}

export async function clearViewHistory() {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase.from("view_history").delete().eq("user_id", userId);
  saveLocalHistoryRows([]);
}

export async function getUnreadNotificationCount() {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count || 0;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];

  return (data as GenericRow[]).map((item) => ({
    id: String(item.id),
    title: String(item.title || item.label || item.type || "Notification"),
    message: String(item.message || item.content || item.body || "Aucun detail disponible."),
    type: String(item.type || "general"),
    read: Boolean(item.read),
    created_at: String(item.created_at || new Date().toISOString()),
    offer_id: item.offer_id ? String(item.offer_id) : null,
  }));
}

// ======== User Profile ========

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
  return data as {
    budget: string;
    priority: string;
    horizon: string;
    usage: string;
    risk: string;
    location?: string | null;
    compare_count: number;
    guide_progress: Record<string, number>;
  } | null;
}

export async function upsertUserProfile(profile: {
  budget?: string; priority?: string; horizon?: string; usage?: string; risk?: string; location?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('user_profiles').upsert({
    user_id: user.id,
    ...profile,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  return !error;
}

export async function incrementCompareCount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const profile = await getUserProfile();
  const nextCount = (profile?.compare_count || 0) + 1;
  await supabase.from('user_profiles').upsert({
    user_id: user.id,
    compare_count: nextCount,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  return nextCount;
}

export async function saveGuideProgress(progress: Record<string, number>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_profiles').upsert({
    user_id: user.id,
    guide_progress: progress,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}
