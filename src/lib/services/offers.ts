import { getOfferDataState, type NotificationItem, type Offer } from "@/lib/core";
import { getDemoOfferById, getFilteredDemoOffers } from "@/lib/demo/offers";
import { supabase } from "./supabase";

type OfferRow = {
  id: string;
  product: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  merchant: string;
  price: number;
  barred_price: number | null;
  availability: string;
  delivery: string;
  warranty: string;
  score: number;
  status: string;
  status_color: string;
  confidence: string;
  freshness: string;
  image_url?: string | null;
  source_url?: string | null;
  last_updated?: string | null;
  reliability_score?: number | null;
  price_history?: Array<{ date: string; price: number; source_url?: string | null }> | null;
  pefas_p: number;
  pefas_e: number;
  pefas_f: number;
  pefas_a: number;
  pefas_s: number;
  mimo_short: string;
  reasons: string[];
  vigilances: string[];
  specs?: Record<string, string>;
};

type FavoriteRow = { offer_id: string };
type ViewHistoryRow = { id: string; offer_id: string; viewed_at: string };
type OfferHistoryRow = Pick<OfferRow, "id" | "product" | "brand" | "price" | "score" | "category" | "merchant">;
type GenericRow = Record<string, unknown>;

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function mapOffer(row: OfferRow): Offer {
  const offer: Offer = {
    id: row.id,
    product: row.product,
    brand: row.brand,
    model: row.model,
    category: row.category,
    subcategory: row.subcategory,
    merchant: row.merchant,
    price: row.price,
    barredPrice: row.barred_price,
    availability: row.availability,
    delivery: row.delivery,
    warranty: row.warranty,
    score: typeof row.score === "number" ? row.score : null,
    status: row.status || null,
    statusColor: row.status_color || null,
    confidence: row.confidence || null,
    freshness: row.freshness || null,
    imageUrl: row.image_url || null,
    sourceUrl: row.source_url || null,
    lastUpdated: row.last_updated || null,
    reliabilityScore: typeof row.reliability_score === "number" ? row.reliability_score : null,
    priceHistory: Array.isArray(row.price_history) ? row.price_history : [],
    dataState: "unknown",
    pefas: {
      P: typeof row.pefas_p === "number" ? row.pefas_p : null,
      E: typeof row.pefas_e === "number" ? row.pefas_e : null,
      F: typeof row.pefas_f === "number" ? row.pefas_f : null,
      A: typeof row.pefas_a === "number" ? row.pefas_a : null,
      S: typeof row.pefas_s === "number" ? row.pefas_s : null,
    },
    mimoShort: row.mimo_short || null,
    reasons: row.reasons || [],
    vigilances: row.vigilances || [],
    specs: row.specs || {},
  };

  return {
    ...offer,
    dataState: getOfferDataState(offer),
  };
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
    return getFilteredDemoOffers(filters);
  }

  if (!data || data.length === 0) {
    return getFilteredDemoOffers(filters);
  }

  return data.map((item) => mapOffer(item as OfferRow));
}

export async function getOfferById(id: string) {
  const { data, error } = await supabase.from("offers").select("*").eq("id", id).single();
  if (error || !data) return getDemoOfferById(id);
  return mapOffer(data as OfferRow);
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
  return !error;
}

export async function removeFavorite(offerId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("offer_id", offerId);
  return !error;
}

export async function getFavorites() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("offer_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data.map((item) => (item as FavoriteRow).offer_id);
}

export async function recordView(offerId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;

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
  if (!data || data.length === 0) return [];

  const historyRows = data as ViewHistoryRow[];
  const offerIds = [...new Set(historyRows.map((item) => item.offer_id))];
  const { data: offersData } = await supabase.from("offers").select("id, product, brand, price, score, category, merchant").in("id", offerIds);
  const offersMap: Record<string, OfferHistoryRow> = {};

  if (offersData) {
    (offersData as OfferHistoryRow[]).forEach((offer) => {
      offersMap[offer.id] = offer;
    });
  }

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
  return data as { budget: string; priority: string; horizon: string; usage: string; risk: string; compare_count: number; guide_progress: Record<string, number> } | null;
}

export async function upsertUserProfile(profile: {
  budget?: string; priority?: string; horizon?: string; usage?: string; risk?: string;
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
  if (!user) return;
  const profile = await getUserProfile();
  await supabase.from('user_profiles').upsert({
    user_id: user.id,
    compare_count: (profile?.compare_count || 0) + 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
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
