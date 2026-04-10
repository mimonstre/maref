"use client";
import Link from "next/link";
import { Bell, MessageSquare, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopBar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const initials = user?.user_metadata?.name
    ? user.user_metadata.name.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 z-50">
      <Link href="/" className="text-xl font-extrabold text-emerald-700 tracking-tight">
        MAREF
      </Link>
      <nav className="hidden md:flex items-center gap-0.5">
        {[
          { href: "/", label: "Accueil" },
          { href: "/explorer", label: "Explorer" },
          { href: "/comparer", label: "Comparer" },
          { href: "/projets", label: "Projets" },
          { href: "/guide", label: "Guide" },
          { href: "/forum", label: "Forum" },
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
      <div className="flex items-center gap-1">
        {!loading && !user ? (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors hidden sm:block">
              Connexion
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm">
              Commencer
            </Link>
          </div>
        ) : (
          <>
            <Link href="/favoris" className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Favoris">
              <Heart className="w-[18px] h-[18px] text-gray-500" />
            </Link>
            <Link href="/assistant" className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Assistant Mimo">
              <MessageSquare className="w-[18px] h-[18px] text-gray-500" />
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative" title="Notifications">
              <Bell className="w-[18px] h-[18px] text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative ml-1">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold hover:bg-emerald-800 transition-colors ring-2 ring-emerald-100"
              >
                {initials}
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 w-52 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-sm">{user?.user_metadata?.name || "Utilisateur"}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { href: "/profil", label: "Mon profil", icon: "👤" },
                        { href: "/favoris", label: "Favoris", icon: "❤️" },
                        { href: "/projets", label: "Projets", icon: "📁" },
                        { href: "/assistant", label: "Assistant Mimo", icon: "🤖" },
                        { href: "/forum", label: "Forum", icon: "💬" },
                        { href: "/parametres", label: "Parametres", icon: "⚙️" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-base">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={async () => { await signOut(); setShowMenu(false); router.push("/login"); }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="text-base">🚪</span>
                        Deconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}