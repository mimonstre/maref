"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { CATEGORIES } from "@/lib/categories";
import { computeScore, getScoreStatus } from "@/lib/score";
import { getAdminOffers, deleteAdminOffer, importAdminOffers, saveAdminOffer } from "@/features/admin/api";
import { buildDemoOffersCsv, parseOffersCsv } from "@/features/admin/csv";
import { EMPTY_ADMIN_FORM, ADMIN_SUBCATEGORIES, getAdminFormFromOffer, getNextAdminForm } from "@/features/admin/form";
import type { AdminOffer, AdminOfferForm } from "@/features/admin/types";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"list" | "add" | "edit">("list");
  const [form, setForm] = useState<AdminOfferForm>(EMPTY_ADMIN_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function loadOffers() {
    setLoading(true);
    setOffers(await getAdminOffers());
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(loadOffers);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  function updateForm(key: keyof AdminOfferForm, value: string) {
    setForm((prev) => getNextAdminForm(prev, key, value));
  }

  async function handleSave() {
    if (!form.product || !form.brand || !form.price) {
      setMessage("Remplissez au minimum : Produit, Marque et Prix");
      return;
    }

    setSaving(true);
    setMessage("");

    const result = await saveAdminOffer(form, editId);
    if (!result.success) {
      setMessage("Erreur: " + result.errorMessage);
    } else if (editId) {
      setMessage("Offre modifiee avec succes");
      setEditId(null);
      setForm(EMPTY_ADMIN_FORM);
      setTab("list");
    } else {
      setMessage("Offre ajoutee avec succes");
      setForm(EMPTY_ADMIN_FORM);
    }

    await loadOffers();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteAdminOffer(id);
    setDeleteConfirm(null);
    await loadOffers();
    setMessage("Offre supprimee");
  }

  function startEdit(offer: AdminOffer) {
    setForm(getAdminFormFromOffer(offer));
    setEditId(offer.id);
    setTab("edit");
  }

  async function handleCsvImport(file: File) {
    setImporting(true);
    setMessage("");

    try {
      const text = await file.text();
      const forms = parseOffersCsv(text);
      const result = await importAdminOffers(forms);

      if (!result.success) {
        setMessage("Erreur: " + result.errorMessage);
      } else {
        setMessage(result.imported + " offres importees");
        await loadOffers();
      }
    } catch (error) {
      setMessage("Erreur: " + (error instanceof Error ? error.message : "Import impossible"));
    } finally {
      setImporting(false);
    }
  }

  function handleDownloadDemoCsv() {
    const csv = buildDemoOffersCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "maref-demo-offers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const filtered = search
    ? offers.filter((offer) => offer.product.toLowerCase().includes(search.toLowerCase()) || offer.brand.toLowerCase().includes(search.toLowerCase()))
    : offers;

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!user) return null;

  if (tab === "add" || tab === "edit") {
    const currentScore = computeScore(
      parseInt(form.pefas_p) || 70,
      parseInt(form.pefas_e) || 70,
      parseInt(form.pefas_f) || 70,
      parseInt(form.pefas_a) || 70,
      parseInt(form.pefas_s) || 70,
    ) ?? 0;
    const currentStatus = getScoreStatus(currentScore);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{editId ? "Modifier l offre" : "Ajouter une offre"}</h2>
          <button onClick={() => { setTab("list"); setEditId(null); setForm(EMPTY_ADMIN_FORM); }} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
            Annuler
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs uppercase">{form.brand || "Marque"}</p>
              <p className="font-bold">{form.product || "Nom du produit"}</p>
              <p className="text-blue-200 text-xs">{form.merchant} - {form.price ? form.price + " EUR" : "Prix"}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {currentScore}
            </div>
          </div>
          <p className="text-blue-200 text-xs mt-2">{currentStatus.label} - Score calcule en temps reel</p>
        </div>

        {message && (
          <div className={"rounded-xl p-3 text-sm " + (message.includes("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200")}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Produit</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nom du produit *</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Ex: Lave-linge 9kg A+++" value={form.product} onChange={(e) => updateForm("product", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Marque *</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Ex: Samsung" value={form.brand} onChange={(e) => updateForm("brand", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Modele / Reference</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Ex: WW90T554DAW" value={form.model} onChange={(e) => updateForm("model", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Marchand</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={form.merchant} onChange={(e) => updateForm("merchant", e.target.value)}>
                {["Darty", "Boulanger", "Fnac", "Cdiscount", "Amazon", "BUT", "Electro Depot", "Conforama"].map((merchant) => (
                  <option key={merchant}>{merchant}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Categorie</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Sous-categorie</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={form.subcategory} onChange={(e) => updateForm("subcategory", e.target.value)}>
                {(ADMIN_SUBCATEGORIES[form.category] || []).map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
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
              <input type="number" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="549" value={form.price} onChange={(e) => updateForm("price", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Ancien prix (EUR)</label>
              <input type="number" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="649" value={form.barredPrice} onChange={(e) => updateForm("barredPrice", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Disponibilite</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={form.availability} onChange={(e) => updateForm("availability", e.target.value)}>
                {["En stock", "Sous 48h", "Sous 5 jours", "Sur commande", "Rupture"].map((availability) => (
                  <option key={availability}>{availability}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Livraison</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={form.delivery} onChange={(e) => updateForm("delivery", e.target.value)}>
                {["Gratuite", "9,99 EUR", "19,99 EUR", "29,99 EUR"].map((delivery) => (
                  <option key={delivery}>{delivery}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Garantie</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={form.warranty} onChange={(e) => updateForm("warranty", e.target.value)}>
                {["1 an", "2 ans", "3 ans", "5 ans"].map((warranty) => (
                  <option key={warranty}>{warranty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Tracabilite</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">URL source</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="https://..." value={form.sourceUrl} onChange={(e) => updateForm("sourceUrl", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Date de verification</label>
              <input type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" value={form.lastUpdated} onChange={(e) => updateForm("lastUpdated", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Reliability score (0-100)</label>
              <input type="number" min="0" max="100" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" value={form.reliabilityScore} onChange={(e) => updateForm("reliabilityScore", e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Sans source verifiable, l offre sera affichee comme donnee partielle ou inconnue.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Score PEFAS (0-100)</h3>
          <p className="text-xs text-gray-400">Le score global est calcule automatiquement a partir des 5 axes</p>
          <div className="space-y-3">
            {[
              { key: "pefas_p", label: "P - Pertinence", desc: "Adequation au besoin" },
              { key: "pefas_e", label: "E - Economie", desc: "Rapport cout / valeur" },
              { key: "pefas_f", label: "F - Fluidite", desc: "Facilite d acces" },
              { key: "pefas_a", label: "A - Assurance", desc: "Fiabilite globale" },
              { key: "pefas_s", label: "S - Stabilite", desc: "Durabilite" },
            ].map((axis) => {
              const value = parseInt(form[axis.key as keyof AdminOfferForm]) || 0;
              const color = value >= 70 ? "text-blue-700" : value >= 50 ? "text-yellow-600" : "text-red-600";
              return (
                <div key={axis.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-semibold">{axis.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{axis.desc}</span>
                    </div>
                    <span className={"text-sm font-bold " + color}>{value}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-blue-700"
                    value={value}
                    onChange={(e) => updateForm(axis.key as keyof AdminOfferForm, e.target.value)}
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
            <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 resize-none" rows={3} placeholder={"Prix competitif\nMarque fiable\nBonne efficacite energetique"} value={form.reasons} onChange={(e) => updateForm("reasons", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Points de vigilance (un par ligne)</label>
            <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 resize-none" rows={3} placeholder={"Cout d usage a verifier\nGarantie limitee"} value={form.vigilances} onChange={(e) => updateForm("vigilances", e.target.value)} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-md text-sm disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : editId ? "Modifier l offre" : "Ajouter l offre"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">Administration MAREF</h2>
        <p className="text-blue-200 text-sm mt-1">Gerez vos offres, ajoutez de vrais produits.</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{offers.length}</p>
            <p className="text-[0.65rem] text-blue-200">Offres</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{new Set(offers.map((offer) => offer.brand)).size}</p>
            <p className="text-[0.65rem] text-blue-200">Marques</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{new Set(offers.map((offer) => offer.merchant)).size}</p>
            <p className="text-[0.65rem] text-blue-200">Marchands</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setForm(EMPTY_ADMIN_FORM); setEditId(null); setTab("add"); }} className="flex-1 bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-md text-sm">
          + Ajouter une offre
        </button>
        <label className="flex-1 cursor-pointer bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-blue-300 transition-colors shadow-sm text-sm text-center">
          {importing ? "Import..." : "Importer CSV"}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleCsvImport(file);
              }
              event.currentTarget.value = "";
            }}
          />
        </label>
        <button
          onClick={handleDownloadDemoCsv}
          className="flex-1 bg-blue-50 text-blue-800 font-semibold py-3 rounded-xl hover:bg-blue-100 transition-colors shadow-sm text-sm"
        >
          Telecharger le CSV demo
        </button>
      </div>

      {message && (
        <div className={"rounded-xl p-3 text-sm " + (message.includes("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200")}>
          {message}
        </div>
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-3 shadow-sm">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
        <input type="text" placeholder="Rechercher une offre..." className="flex-1 bg-transparent outline-none text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"} style={{ backgroundColor: offer.status_color }}>
                    {offer.score}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{offer.brand} {offer.product}</p>
                    <p className="text-xs text-gray-500">{offer.merchant} - {offer.price} EUR - {offer.category}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-2">
                  <button onClick={() => startEdit(offer)} className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    Modifier
                  </button>
                  {deleteConfirm === offer.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(offer.id)} className="text-xs font-semibold text-white bg-red-500 px-2 py-1.5 rounded-lg hover:bg-red-600">
                        Confirmer
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1.5 rounded-lg">
                        Non
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(offer.id)} className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
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
