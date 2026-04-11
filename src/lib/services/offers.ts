import type { NotificationItem, Offer } from "@/lib/core";
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

function mapOffer(row: OfferRow): Offer {
  return {
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
    score: row.score,
    status: row.status,
    statusColor: row.status_color,
    confidence: row.confidence,
    freshness: row.freshness,
    pefas: {
      P: row.pefas_p,
      E: row.pefas_e,
      F: row.pefas_f,
      A: row.pefas_a,
      S: row.pefas_s,
    },
    mimoShort: row.mimo_short,
    reasons: row.reasons,
    vigilances: row.vigilances,
    specs: row.specs || {},
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
    return [];
  }

  return data.map((item) => mapOffer(item as OfferRow));
}

export async function getOfferById(id: string) {
  const { data, error } = await supabase.from("offers").select("*").eq("id", id).single();
  if (error || !data) return null;
  return mapOffer(data as OfferRow);
}

export async function getProjects() {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function addFavorite(offerId: string) {
  const { data: existing } = await supabase.from("favorites").select("id").eq("offer_id", offerId);
  if (existing && existing.length > 0) return true;
  const { error } = await supabase.from("favorites").insert({ offer_id: offerId });
  return !error;
}

export async function removeFavorite(offerId: string) {
  const { error } = await supabase.from("favorites").delete().eq("offer_id", offerId);
  return !error;
}

export async function getFavorites() {
  const { data, error } = await supabase.from("favorites").select("offer_id").order("created_at", { ascending: false });
  if (error) return [];
  return data.map((item) => (item as FavoriteRow).offer_id);
}

export async function recordView(offerId: string) {
  try {
    await supabase.from("view_history").insert({ offer_id: offerId });
  } catch {}
}

export async function getViewHistory() {
  const { data } = await supabase.from("view_history").select("id, offer_id, viewed_at").order("viewed_at", { ascending: false }).limit(30);
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
    .map((item) => ({ id: item.id, offer_id: item.offer_id, viewed_at: item.viewed_at, ...offersMap[item.offer_id] }));
}

export async function clearViewHistory() {
  await supabase.from("view_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

export async function getUnreadNotificationCount() {
  const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false);
  return count || 0;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
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
