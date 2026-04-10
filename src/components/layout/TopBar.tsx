"use client";
import Link from "next/link";
import { Bell, MessageSquare, Heart, Users } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      <Link href="/" className="text-xl font-extrabold text-emerald-700 tracking-tight">
        MAREF
      </Link>
      <nav className="hidden md:flex items-center gap-1">
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
      <div className="flex items-center gap-1.5">
        {!loading && !user ? (
          <Link
            href="/login"
            className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            Connexion
          </Link>
        ) : (
          <>
            <Link href="/favoris" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="w-5 h-5 text-gray-500" />
            </Link>
            <Link href="/assistant" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-500" />
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold hover:bg-emerald-800 transition-colors"
              >
                {initials}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48 z-50 animate-scale-in">
                  <Link href="/profil" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    Mon profil
                  </Link>
                  <Link href="/favoris" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    Favoris
                  </Link>
                  <Link href="/projets" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    Projets
                  </Link>
                  <Link href="/assistant" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    Assistant Mimo
                  </Link>
                  <Link href="/forum" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    Forum
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={async () => { await signOut(); setShowMenu(false); router.push("/login"); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Deconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}