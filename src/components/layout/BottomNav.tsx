"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, FolderOpen, BookOpen, User, MoreHorizontal, X, Heart, MessageSquare, Bell, Clock, Settings, BarChart3 } from "lucide-react";
import { useState } from "react";

const mainItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/explorer", label: "Explorer", icon: Search },
  { href: "/projets", label: "Projets", icon: FolderOpen },
  { href: "/guide", label: "Guide", icon: BookOpen },
];

const moreItems = [
  { href: "/profil", label: "Mon profil", icon: "👤" },
  { href: "/favoris", label: "Favoris", icon: "❤️" },
  { href: "/comparer", label: "Comparer", icon: "⚖️" },
  { href: "/assistant", label: "Assistant Mimo", icon: "🤖" },
  { href: "/forum", label: "Forum", icon: "💬" },
  { href: "/historique", label: "Historique", icon: "🕐" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/pro", label: "MAREF Pro", icon: "💼" },
  { href: "/parametres", label: "Parametres", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-16 left-3 right-3 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="font-bold text-sm">Plus</span>
              <button onClick={() => setShowMore(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={"flex flex-col items-center gap-1 p-3 rounded-xl transition-all " + (pathname === item.href ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-600")}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[0.6rem] font-semibold text-center leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-1 z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {mainItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={"flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors " + (active ? "text-emerald-700" : "text-gray-400 hover:text-emerald-600")}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[0.6rem] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore(!showMore)}
          className={"flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors " + (showMore ? "text-emerald-700" : "text-gray-400 hover:text-emerald-600")}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[0.6rem] font-semibold">Plus</span>
        </button>
      </nav>
    </>
  );
}