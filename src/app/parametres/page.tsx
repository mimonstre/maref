"use client";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ParametresPage() {
  const { user } = useAuth();
  const router = useRouter();

  const email = user?.email || "";
  const name = user?.user_metadata?.name || "Utilisateur";

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Parametres</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold">{name.charAt(0)}</div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-sm">Nom</span>
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-sm">Email</span>
          <span className="text-sm font-medium">{email}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm">Mot de passe</span>
          <span className="text-sm text-gray-400">........</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-4">Notifications</h3>
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium">Alertes de prix</p>
            <p className="text-xs text-gray-400">Soyez alerte quand un prix baisse</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Actif</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium">Rappels projets</p>
            <p className="text-xs text-gray-400">Rappels pour vos projets en cours</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Actif</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">Messages Mimo</p>
            <p className="text-xs text-gray-400">Recommandations personnalisees</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Actif</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-4">Apparence</h3>
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl border border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100 text-center">
            <p className="text-lg">☀️</p>
            <p className="text-xs font-semibold mt-1">Clair</p>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-gray-200 text-center hover:border-gray-300 cursor-pointer">
            <p className="text-lg">🌙</p>
            <p className="text-xs font-semibold mt-1">Sombre</p>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-gray-200 text-center hover:border-gray-300 cursor-pointer">
            <p className="text-lg">💻</p>
            <p className="text-xs font-semibold mt-1">Auto</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold mb-3">Confidentialite</h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Profil public</p>
            <p className="text-xs text-gray-400">Visible dans le forum</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Actif</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="flex items-center gap-3 p-4">
          <span className="text-lg">❓</span>
          <div className="flex-1">
            <p className="text-sm font-medium">Centre d aide</p>
            <p className="text-xs text-gray-400">FAQ et documentation</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <span className="text-lg">💼</span>
          <div className="flex-1">
            <p className="text-sm font-medium">MAREF Pro</p>
            <p className="text-xs text-gray-400">Acces professionnel et API</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <span className="text-lg">📄</span>
          <div className="flex-1">
            <p className="text-sm font-medium">Conditions d utilisation</p>
            <p className="text-xs text-gray-400">Mentions legales</p>
          </div>
        </div>
      </div>

      <div className="text-center py-2">
        <p className="text-[0.7rem] text-gray-400">MAREF v1.0</p>
      </div>

      <button
        onClick={async () => { await signOut(); router.push("/login"); }}
        className="w-full bg-white border border-red-200 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors text-sm"
      >
        Deconnexion
      </button>
    </div>
  );
}