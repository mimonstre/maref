"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
};

function getStatus(score: number) {
  if (score >= 85) return { label: "Excellent choix", color: "#1a6b4e" };
  if (score >= 72) return { label: "Tres bon choix", color: "#2e8b57" };
  if (score >= 58) return { label: "Bon choix", color: "#6aab2e" };
  if (score >= 42) return { label: "A surveiller", color: "#e6a817" };
  if (score >= 25) return { label: "Risque", color: "#d4652a" };
  return { label: "Peu pertinent", color: "#c0392b" };
}

function generateMimo(score: number): string {
  if (score >= 85) return "Offre solide, bien positionnee pour votre profil.";
  if (score >= 72) return "Bon rapport qualite-prix-fiabilite dans votre contexte.";
  if (score >= 58) return "Offre correcte, des alternatives existent.";
  if (score >= 42) return "Quelques points a verifier avant de decider.";
  return "Attention, plusieurs signaux meritent votre vigilance.";
}

function computeScore(p: number, e: number, f: number, a: number, s: number): number {
  return Math.round((p * 0.25 + e * 0.25 + f * 0.15 + a * 0.2 + s * 0.15));
}

const EMPTY_FORM = {
  product: "", brand: "", model: "", category: "electromenager", subcategory: "lavage",
  merchant: "Darty", price: "", barredPrice: "", availability: "En stock",
  delivery: "Gratuite", warranty: "2 ans",
  pefas_p: "70", pefas_e: "70", pefas_f: "70", pefas_a: "70", pefas_s: "70",
  reasons: "Prix competitif\nMarque fiable",
  vigilances: "Cout d usage a verifier",
};

const SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
  electromenager: [
    { id: "lavage", name: "Lavage" },
    { id: "vaisselle", name: "Vaisselle" },
  ],
  froid: [
    { id: "refrigerateurs", name: "Refrigerateurs" },
    { id: "congelation", name: "Congelation" },
    { id: "multidoor", name: "Multidoor / americain" },
  ],
  televiseurs: [
    { id: "technologie", name: "Technologie" },
    { id: "taille", name: "Taille" },
    { id: "usage-tv", name: "Usage" },
  ],
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"list" | "add" | "edit">("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function loadOffers() {
    setLoading(true);
    const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
    if (data) setOffers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOffers();
  }, []);

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "category") {
      const subs = SUBCATEGORIES[value];
      if (subs && subs.length > 0) {
        setForm((prev) => ({ ...prev, [key]: value, subcategory: subs[0].id }));
      }
    }
  }

  async function handleSave() {
    if (!form.product || !form.brand || !form.price) {
      setMessage("Remplissez au minimum : Produit, Marque et Prix");
      return;
    }
    setSaving(true);
    setMessage("");

    const p = parseInt(form.pefas_p) || 70;
    const e = parseInt(form.pefas_e) || 70;
    const f = parseInt(form.pefas_f) || 70;
    const a = parseInt(form.pefas_a) || 70;
    const s = parseInt(form.pefas_s) || 70;
    const score = computeScore(p, e, f, a, s);
    const st = getStatus(score);

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
      score: score,
      status: st.label,
      status_color: st.color,
      confidence: score >= 70 ? "Elevee" : score >= 50 ? "Bonne" : "Moyenne",
      freshness: "Tres recente",
      pefas_p: p,
      pefas_e: e,
      pefas_f: f,
      pefas_a: a,
      pefas_s: s,
      mimo_short: generateMimo(score),
      reasons: form.reasons.split("\n").filter((r) => r.trim()),
      vigilances: form.vigilances.split("\n").filter((v) => v.trim()),
    };

    if (editId) {
      const { error } = await supabase.from("offers").update(row).eq("id", editId);
      if (error) { setMessage("Erreur: " + error.message); }
      else { setMessage("Offre modifiee avec succes"); setEditId(null); setForm(EMPTY_FORM); setTab("list"); }
    } else {
      const { error } = await supabase.from("offers").insert(row);
      if (error) { setMessage("Erreur: " + error.message); }
      else { setMessage("Offre ajoutee avec succes"); setForm(EMPTY_FORM); }
    }

    await loadOffers();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("favorites").delete().eq("offer_id", id);
    await supabase.from("project_offers").delete().eq("offer_id", id);
    await supabase.from("offers").delete().eq("id", id);
    setDeleteConfirm(null);
    await loadOffers();
    setMessage("Offre supprimee");
  }

  function startEdit(offer: OfferRow) {
    setForm({
      product: offer.product,
      brand: offer.brand,
      model: offer.model,
      category: offer.category,
      subcategory: offer.subcategory,
      merchant: offer.merchant,
      price: offer.price.toString(),
      barredPrice: offer.barred_price?.toString() || "",
      availability: offer.availability,
      delivery: offer.delivery,
      warranty: offer.warranty,
      pefas_p: offer.pefas_p.toString(),
      pefas_e: offer.pefas_e.toString(),
      pefas_f: offer.pefas_f.toString(),
      pefas_a: offer.pefas_a.toString(),
      pefas_s: offer.pefas_s.toString(),
      reasons: offer.reasons.join("\n"),
      vigilances: offer.vigilances.join("\n"),
    });
    setEditId(offer.id);
    setTab("edit");
  }

  const filtered = search
    ? offers.filter((o) => o.product.toLowerCase().includes(search.toLowerCase()) || o.brand.toLowerCase().includes(search.toLowerCase()))
    : offers;

  // ===== ADD / EDIT FORM =====
  if (tab === "add" || tab === "edit") {
    const currentScore = computeScore(
      parseInt(form.pefas_p) || 70,
      parseInt(form.pefas_e) || 70,
      parseInt(form.pefas_f) || 70,
      parseInt(form.pefas_a) || 70,
      parseInt(form.pefas_s) || 70
    );
    const currentStatus = getStatus(currentScore);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{editId ? "Modifier l offre" : "Ajouter une offre"}</h2>
          <button onClick={() => { setTab("list"); setEditId(null); setForm(EMPTY_FORM); }} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
            Annuler
          </button>
        </div>

        {/* Live preview */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-xs uppercase">{form.brand || "Marque"}</p>
              <p className="font-bold">{form.product || "Nom du produit"}</p>
              <p className="text-emerald-200 text-xs">{form.merchant} · {form.price ? form.price + " EUR" : "Prix"}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {currentScore}
            </div>
          </div>
          <p className="text-emerald-200 text-xs mt-2">{currentStatus.label} · Score calcule en temps reel</p>
        </div>

        {message && (
          <div className={"rounded-xl p-3 text-sm " + (message.includes("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200")}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Produit</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nom du produit *</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Ex: Lave-linge 9kg A+++" value={form.product} onChange={(e) => updateForm("product", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Marque *</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Ex: Samsung" value={form.brand} onChange={(e) => updateForm("brand", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Modele / Reference</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Ex: WW90T554DAW" value={form.model} onChange={(e) => updateForm("model", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Marchand</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={form.merchant} onChange={(e) => updateForm("merchant", e.target.value)}>
                {["Darty", "Boulanger", "Fnac", "Cdiscount", "Amazon", "BUT", "Electro Depot", "Conforama"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Categorie</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                <option value="electromenager">Electromenager</option>
                <option value="froid">Froid</option>
                <option value="televiseurs">Televiseurs</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Sous-categorie</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={form.subcategory} onChange={(e) => updateForm("subcategory", e.target.value)}>
                {(SUBCATEGORIES[form.category] || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Prix et conditions</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prix actuel (EUR) *</label>
              <input type="number" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="549" value={form.price} onChange={(e) => updateForm("price", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Ancien prix (EUR)</label>
              <input type="number" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="649" value={form.barredPrice} onChange={(e) => updateForm("barredPrice", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Disponibilite</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={form.availability} onChange={(e) => updateForm("availability", e.target.value)}>
                {["En stock", "Sous 48h", "Sous 5 jours", "Sur commande", "Rupture"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Livraison</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={form.delivery} onChange={(e) => updateForm("delivery", e.target.value)}>
                {["Gratuite", "9,99 EUR", "19,99 EUR", "29,99 EUR"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Garantie</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600" value={form.warranty} onChange={(e) => updateForm("warranty", e.target.value)}>
                {["1 an", "2 ans", "3 ans", "5 ans"].map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Score PEFAS (0-100)</h3>
          <p className="text-xs text-gray-400">Le score global est calcule automatiquement a partir des 5 axes</p>
          <div className="space-y-3">
            {[
              { key: "pefas_p", label: "P — Pertinence", desc: "Adequation au besoin" },
              { key: "pefas_e", label: "E — Economie", desc: "Rapport cout / valeur" },
              { key: "pefas_f", label: "F — Fluidite", desc: "Facilite d acces" },
              { key: "pefas_a", label: "A — Assurance", desc: "Fiabilite globale" },
              { key: "pefas_s", label: "S — Stabilite", desc: "Durabilite" },
            ].map((axis) => {
              const val = parseInt(form[axis.key as keyof typeof form] as string) || 0;
              const color = val >= 70 ? "text-emerald-700" : val >= 50 ? "text-yellow-600" : "text-red-600";
              return (
                <div key={axis.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-semibold">{axis.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{axis.desc}</span>
                    </div>
                    <span className={"text-sm font-bold " + color}>{val}</span>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-emerald-700"
                    value={val}
                    onChange={(e) => updateForm(axis.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={"w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"} style={{ backgroundColor: currentStatus.color }}>
              {currentScore}
            </div>
            <div>
              <p className="font-bold text-sm">{currentStatus.label}</p>
              <p className="text-xs text-gray-500">Score calcule automatiquement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Analyse</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Points forts (un par ligne)</label>
            <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 resize-none" rows={3} placeholder={"Prix competitif\nMarque fiable\nBonne efficacite energetique"} value={form.reasons} onChange={(e) => updateForm("reasons", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Points de vigilance (un par ligne)</label>
            <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 resize-none" rows={3} placeholder={"Cout d usage a verifier\nGarantie limitee"} value={form.vigilances} onChange={(e) => updateForm("vigilances", e.target.value)} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:bg-emerald-800 transition-colors shadow-md text-sm disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : editId ? "Modifier l offre" : "Ajouter l offre"}
        </button>
      </div>
    );
  }

  // ===== LIST VIEW =====
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">Administration MAREF</h2>
        <p className="text-emerald-200 text-sm mt-1">Gerez vos offres, ajoutez de vrais produits.</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{offers.length}</p>
            <p className="text-[0.65rem] text-emerald-200">Offres</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{new Set(offers.map((o) => o.brand)).size}</p>
            <p className="text-[0.65rem] text-emerald-200">Marques</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{new Set(offers.map((o) => o.merchant)).size}</p>
            <p className="text-[0.65rem] text-emerald-200">Marchands</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setTab("add"); }} className="flex-1 bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:bg-emerald-800 transition-colors shadow-md text-sm">
          + Ajouter une offre
        </button>
      </div>

      {message && (
        <div className={"rounded-xl p-3 text-sm " + (message.includes("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200")}>
          {message}
        </div>
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-3 shadow-sm">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
        <input type="text" placeholder="Rechercher une offre..." className="flex-1 bg-transparent outline-none text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"} style={{ backgroundColor: o.status_color }}>
                    {o.score}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{o.brand} {o.product}</p>
                    <p className="text-xs text-gray-500">{o.merchant} · {o.price} EUR · {o.category}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-2">
                  <button onClick={() => startEdit(o)} className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                    Modifier
                  </button>
                  {deleteConfirm === o.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(o.id)} className="text-xs font-semibold text-white bg-red-500 px-2 py-1.5 rounded-lg hover:bg-red-600">
                        Confirmer
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1.5 rounded-lg">
                        Non
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(o.id)} className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      Suppr.
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}