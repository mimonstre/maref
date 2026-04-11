import { computeScore, generateShortMimo, getScoreStatus } from "@/lib/score";
import { supabase } from "@/lib/supabase";
import type { AdminOffer, AdminOfferForm } from "./types";

export async function getAdminOffers(): Promise<AdminOffer[]> {
  const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
  return (data || []) as AdminOffer[];
}

export async function saveAdminOffer(form: AdminOfferForm, editId?: string | null) {
  const p = parseInt(form.pefas_p) || 70;
  const e = parseInt(form.pefas_e) || 70;
  const f = parseInt(form.pefas_f) || 70;
  const a = parseInt(form.pefas_a) || 70;
  const s = parseInt(form.pefas_s) || 70;
  const score = computeScore(p, e, f, a, s);
  const status = getScoreStatus(score);

  const row = {
    product: form.product,
    brand: form.brand,
    model: form.model || form.brand.substring(0, 2).toUpperCase() + "-" + Math.floor(Math.random() * 9000 + 1000),
    category: form.category,
    subcategory: form.subcategory,
    merchant: form.merchant,
    price: parseInt(form.price) || 0,
    barred_price: form.barredPrice ? parseInt(form.barredPrice) : null,
    availability: form.availability,
    delivery: form.delivery,
    warranty: form.warranty,
    score,
    status: status.label,
    status_color: status.color,
    confidence: score >= 70 ? "Elevee" : score >= 50 ? "Bonne" : "Moyenne",
    freshness: "Tres recente",
    pefas_p: p,
    pefas_e: e,
    pefas_f: f,
    pefas_a: a,
    pefas_s: s,
    mimo_short: generateShortMimo(score),
    reasons: form.reasons.split("\n").filter((reason) => reason.trim()),
    vigilances: form.vigilances.split("\n").filter((vigilance) => vigilance.trim()),
  };

  if (editId) {
    const { error } = await supabase.from("offers").update(row).eq("id", editId);
    return { success: !error, errorMessage: error?.message || null };
  }

  const { error } = await supabase.from("offers").insert(row);
  return { success: !error, errorMessage: error?.message || null };
}

export async function deleteAdminOffer(offerId: string) {
  await supabase.from("favorites").delete().eq("offer_id", offerId);
  await supabase.from("project_offers").delete().eq("offer_id", offerId);
  const { error } = await supabase.from("offers").delete().eq("id", offerId);
  return !error;
}
