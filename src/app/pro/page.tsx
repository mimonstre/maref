"use client";
import { useState } from "react";
import Link from "next/link";
import { MimoCard } from "@/components/shared/Score";

export default function ProPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (email.trim()) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setEmail("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg text-center">
        <span className="text-[0.7rem] font-bold bg-white/10 px-3 py-1 rounded-md">MAREF Pro</span>
        <h1 className="text-2xl font-extrabold mt-4 tracking-tight">Intelligence decisionnelle pour les professionnels</h1>
        <p className="text-gray-400 mt-3 max-w-md mx-auto leading-relaxed">
          Accedez aux donnees MAREF pour piloter vos decisions produit, pricing et positionnement.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-emerald-700">28+</p>
          <p className="text-xs text-gray-500 mt-0.5">Offres analysees</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-emerald-700">5</p>
          <p className="text-xs text-gray-500 mt-0.5">Axes PEFAS</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-emerald-700">6+</p>
          <p className="text-xs text-gray-500 mt-0.5">Marchands suivis</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 text-center">Ce que MAREF Pro vous apporte</h2>
        <div className="space-y-3">
          {[
            { icon: "📊", title: "Dashboard Insights", desc: "Visualisez les tendances de votre categorie en temps reel.", features: ["Scores moyens par categorie", "Evolution des prix sur 12 mois", "Repartition des statuts PEFAS", "Benchmarks marchands"] },
            { icon: "📡", title: "API Decisionnelle", desc: "Integrez les scores MAREF dans vos outils internes.", features: ["API REST compliant", "Webhooks prix et scores", "Documentation complete", "Rate limiting flexible"] },
            { icon: "📋", title: "Rapports Categoriels", desc: "Rapports mensuels detailles sur votre categorie.", features: ["Rapport mensuel PDF", "Analyse concurrentielle", "Tendances de marche", "Recommandations actionnables"] },
            { icon: "🎯", title: "Analyse Concurrentielle", desc: "Comparez votre positionnement sur les 5 axes PEFAS.", features: ["Positionnement relatif", "Carte concurrentielle PEFAS", "Alertes changements", "Historique positionnement"] },
            { icon: "📈", title: "Signaux Marche", desc: "Alertes en temps reel sur les mouvements de prix.", features: ["Alertes prix temps reel", "Detection nouvelles offres", "Changements conditions", "Rapports anomalies"] },
            { icon: "🔒", title: "Data Premium", desc: "Donnees enrichies et segmentees avec historiques etendus.", features: ["Historiques 24 mois", "Projections de prix", "Segmentation avancee", "Export CSV / JSON"] },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{f.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    {f.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                        <span className="text-[0.7rem] text-gray-600">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold text-center mb-4">Apercu Dashboard</h3>
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-lg font-extrabold text-emerald-700">72</p>
              <p className="text-[0.65rem] text-gray-500">Score moyen</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-lg font-extrabold text-emerald-700">-3%</p>
              <p className="text-[0.65rem] text-gray-500">Tendance prix</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-lg font-extrabold text-emerald-700">85%</p>
              <p className="text-[0.65rem] text-gray-500">Disponibilite</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { name: "Electromenager", score: 74 },
              { name: "Froid", score: 71 },
              { name: "Televiseurs", score: 78 },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 w-28">{c.name}</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: c.score + "%" }}></div>
                </div>
                <span className="text-xs font-bold w-8 text-right">{c.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-center mb-4">Offres</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase">Starter</span>
            <p className="text-2xl font-extrabold mt-2">99 EUR<span className="text-sm text-gray-400 font-normal"> / mois</span></p>
            <div className="mt-4 space-y-2">
              {["Dashboard basique", "1 categorie", "Rapports mensuels", "Export CSV"].map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  <span className="text-xs text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg relative">
            <span className="absolute -top-2 right-3 text-[0.6rem] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">Populaire</span>
            <span className="text-xs font-bold text-emerald-200 uppercase">Business</span>
            <p className="text-2xl font-extrabold mt-2">299 EUR<span className="text-sm text-emerald-200 font-normal"> / mois</span></p>
            <div className="mt-4 space-y-2">
              {["Dashboard complet", "Toutes categories", "API REST", "Rapports hebdo", "Alertes temps reel", "Support prioritaire"].map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  <span className="text-xs text-emerald-100">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
        <span className="text-xs font-bold text-gray-400 uppercase">Enterprise</span>
        <h3 className="font-bold text-lg mt-2">Solution sur mesure</h3>
        <p className="text-sm text-gray-500 mt-1">API illimitee, integrations custom, accompagnement dedie, SLA garanti.</p>
        <p className="text-sm font-bold text-emerald-700 mt-2">Contactez-nous</p>
      </div>

      <MimoCard text="MAREF Pro est concu pour les professionnels qui veulent comprendre le marche et anticiper les tendances. L analyse PEFAS a l echelle d une categorie revele des insights impossibles a obtenir manuellement." />

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-3">Demander un acces</h3>
        <p className="text-sm text-gray-500 mb-4">Laissez votre email et notre equipe vous contactera sous 24h.</p>
        <div className="flex gap-2">
          <input
            type="email"
            className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
            placeholder="votre@entreprise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors shadow-sm text-sm shrink-0"
          >
            {sent ? "Envoye" : "Envoyer"}
          </button>
        </div>
        {sent && <p className="text-xs text-emerald-700 font-medium mt-2">Merci ! Nous vous contacterons rapidement.</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-3">Questions frequentes</h3>
        {[
          { q: "Difference entre MAREF gratuit et Pro ?", a: "MAREF gratuit analyse des offres individuelles. Pro donne acces a des analyses de marche, benchmarks et une API." },
          { q: "Puis-je tester avant de m engager ?", a: "Oui, essai gratuit de 14 jours avec acces complet." },
          { q: "Les donnees sont-elles en temps reel ?", a: "Prix et disponibilites mis a jour quotidiennement. Alertes critiques en temps reel." },
          { q: "Puis-je annuler a tout moment ?", a: "Oui, sans engagement. Annulation possible a tout moment." },
        ].map((faq, i) => (
          <div key={i} className="py-3 border-b border-gray-100 last:border-0">
            <p className="text-sm font-semibold">{faq.q}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">Retour a MAREF</Link>
      </div>
    </div>
  );
}