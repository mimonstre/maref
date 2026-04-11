import { supabase } from "./supabase";

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
    query = query.or(
      `product.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,merchant.ilike.%${filters.search}%`
    );
  }

  switch (filters?.sort) {
    case "price-asc": query = query.order("price", { ascending: true }); break;
    case "price-desc": query = query.order("price", { ascending: false }); break;
    default: query = query.order("score", { ascending: false }); break;
  }

  const { data, error } = await query;
  if (error) { console.error("Erreur chargement offres:", error); return []; }

  return data.map((o: any) => mapOffer(o));
}

export async function getOfferById(id: string) {
  const { data, error } = await supabase.from("offers").select("*").eq("id", id).single();
  if (error || !data) return null;
  return mapOffer(data);
}

function mapOffer(o: any) {
  return {
    id: o.id,
    product: o.product,
    brand: o.brand,
    model: o.model,
    category: o.category,
    subcategory: o.subcategory,
    merchant: o.merchant,
    price: o.price,
    barredPrice: o.barred_price,
    availability: o.availability,
    delivery: o.delivery,
    warranty: o.warranty,
    score: o.score,
    status: o.status,
    statusColor: o.status_color,
    confidence: o.confidence,
    freshness: o.freshness,
    pefas: {
      P: o.pefas_p,
      E: o.pefas_e,
      F: o.pefas_f,
      A: o.pefas_a,
      S: o.pefas_s,
    },
    mimoShort: o.mimo_short,
    reasons: o.reasons,
    vigilances: o.vigilances,
    specs: o.specs || {},
  };
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
  return data.map((f: any) => f.offer_id);
}

export async function recordView(offerId: string) {
  try { await supabase.from("view_history").insert({ offer_id: offerId }); } catch (e) {}
}

export async function getViewHistory() {
  const { data } = await supabase.from("view_history").select("id, offer_id, viewed_at").order("viewed_at", { ascending: false }).limit(30);
  if (!data || data.length === 0) return [];
  const offerIds = [...new Set(data.map((h: any) => h.offer_id))];
  const { data: offersData } = await supabase.from("offers").select("id, product, brand, price, score, category, merchant").in("id", offerIds);
  const offersMap: Record<string, any> = {};
  if (offersData) offersData.forEach((o: any) => { offersMap[o.id] = o; });
  return data.filter((h: any) => offersMap[h.offer_id]).map((h: any) => ({ id: h.id, offer_id: h.offer_id, viewed_at: h.viewed_at, ...offersMap[h.offer_id] }));
}

export async function getUnreadNotificationCount() {
  const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false);
  return count || 0;
}