"use client";
import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const initials = user?.user_metadata?.name
    ? user.user_metadata.name.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      <Link href="/" className="text-xl font-extrabold text-emerald-700 tracking-tight">
        MAREF
      </Link>
      <nav className="hidden md:flex items-center gap-1">
        {[
          { href: "/guide", label: "Guide" },
          { href: "/profil", label: "Profil" },
          { href: "/", label: "Accueil" },
          { href: "/explorer", label: "Explorer" },
          { href: "/projets", label: "Projets" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        {!loading && !user ? (
          <Link
            href="/login"
            className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            Connexion
          </Link>
        ) : (
          <>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold hover:bg-emerald-800 transition-colors"
              title="Deconnexion"
            >
              {initials}
            </button>
          </>
        )}
      </div>
    </header>
  );
}