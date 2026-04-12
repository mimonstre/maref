"use client";

import Link from "next/link";
import { Bell, Heart, LogOut, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { accountNavigation, primaryNavigation } from "@/features/navigation/config";
import { signOut } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/queries";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = useMemo(() => {
    const name = user?.user_metadata?.name || user?.email || "U";
    return name.charAt(0).toUpperCase();
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      const count = await getUnreadNotificationCount();
      if (!cancelled) {
        setUnreadCount(count);
      }
    }

    void loadUnreadCount();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-white/78 px-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-sm font-black text-white shadow-[0_12px_25px_rgba(37,99,235,0.32)]">
            M
          </div>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-blue-700/70">Decision SaaS</p>
            <p className="text-base font-extrabold tracking-tight text-slate-950">MAREF</p>
          </div>
        </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {primaryNavigation.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "rounded-xl px-3 py-2 text-sm font-semibold transition-all " +
                (active
                  ? "bg-blue-600 text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)]"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1">
        {!loading && !user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 sm:block"
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-blue-700 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(37,99,235,0.28)] transition-all hover:translate-y-[-1px] hover:from-blue-800 hover:to-sky-700"
            >
              Commencer
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/favoris"
              className="rounded-xl p-2 transition-colors hover:bg-blue-50"
              title="Favoris"
            >
              <Heart className="h-[18px] w-[18px] text-slate-500" />
            </Link>
            <Link
              href="/assistant"
              className="rounded-xl p-2 transition-colors hover:bg-blue-50"
              title="Assistant Mimo"
            >
              <Sparkles className="h-[18px] w-[18px] text-slate-500" />
            </Link>
            <Link
              href="/notifications"
              className="relative rounded-xl p-2 transition-colors hover:bg-blue-50"
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px] text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.55rem] font-bold text-white">
                  {Math.min(unreadCount, 9)}
                </span>
              )}
            </Link>

            <div className="relative ml-1">
              <button
                onClick={() => setShowMenu((current) => !current)}
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 text-sm font-bold text-white ring-4 ring-blue-100/70 transition-transform hover:scale-[1.03]"
                aria-label="Ouvrir le menu du compte"
              >
                {initials}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 top-12 z-50 w-60 animate-scale-in rounded-3xl border border-white/70 bg-white/92 py-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold">{user?.user_metadata?.name || "Utilisateur"}</p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {accountNavigation.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setShowMenu(false)}
                            className={
                              "mx-2 flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm transition-colors " +
                              (active ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50")
                            }
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={async () => {
                          await signOut();
                          setShowMenu(false);
                          router.push("/login");
                        }}
                        className="mx-2 flex w-[calc(100%-1rem)] items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
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
      </div>
    </header>
  );
}
