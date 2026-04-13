"use client";

import Link from "next/link";
import { LockKeyhole, LogOut, Mail, ShieldCheck, SlidersHorizontal, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { EmptyState, IncompleteDataWarning, LoadingSkeleton, NoDataBlock } from "@/components/shared/Score";
import { signOut } from "@/lib/auth";

export default function ParametresPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Paramètres</h2>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Paramètres</h2>
        <EmptyState
          icon={<SlidersHorizontal className="h-8 w-8 text-gray-400" />}
          title="Connectez-vous pour gérer votre compte"
          description="Les réglages MAREF sont liés à votre session. Sans compte connecté, rien n’est affiché artificiellement."
          action={() => router.push("/login")}
          actionLabel="Aller à la connexion"
        />
      </div>
    );
  }

  const email = user.email || "";
  const name = user.user_metadata?.name || "Utilisateur";
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "Inconnu";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Paramètres</h2>
        <p className="mt-1 text-sm text-gray-500">
          Cette page n’affiche que des informations et actions réellement disponibles aujourd’hui.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 py-2.5">
          <span className="text-sm text-gray-600">Nom affiché</span>
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-100 py-2.5">
          <span className="text-sm text-gray-600">Email</span>
          <span className="text-sm font-medium">{email}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-gray-600">Compte créé</span>
          <span className="text-sm font-medium">{memberSince}</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-700" />
            <h3 className="font-bold">Actions de compte</h3>
          </div>
          <div className="space-y-2">
            <Link
              href="/login"
              className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <span>Changer de session</span>
              <UserCircle2 className="h-4 w-4 text-blue-700" />
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="flex w-full items-center justify-between rounded-xl border border-red-200 px-3 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <span>Se déconnecter</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-blue-700" />
            <h3 className="font-bold">Confidentialité actuelle</h3>
          </div>
          <p className="text-sm text-gray-600">
            MAREF utilise votre session Supabase pour relier vos projets, favoris, comparaisons et progression guide à
            votre compte.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Il n’y a pas encore de profil public complet ni de panneau avancé de permissions exposé dans l’interface.
          </p>
        </div>
      </div>

      <IncompleteDataWarning
        title="Réglages encore limités"
        description="Les thèmes, notifications fines et préférences avancées ne sont pas encore exposés de façon fiable. Ils ne sont donc plus affichés comme faux interrupteurs."
      />

      <NoDataBlock
        title="Notifications avancées non configurables pour le moment"
        description="Vous pouvez consulter vos notifications depuis la page dédiée, mais il n’existe pas encore de panneau de réglage détaillé branché à une logique persistante."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-700" />
          <h3 className="font-bold">Pages utiles</h3>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <Link
            href="/profil"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Voir mon profil
          </Link>
          <Link
            href="/notifications"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Ouvrir les notifications
          </Link>
          <Link
            href="/guide"
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            Reprendre le guide
          </Link>
        </div>
      </div>
    </div>
  );
}
