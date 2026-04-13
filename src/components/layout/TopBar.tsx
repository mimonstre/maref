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
      <div className="glass-nav mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[28px] px-4 sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-sm font-black text-white shadow-[0_14px_28px_rgba(15,23,42,0.28)]">
            M
          </div>
          <div className="min-w-0">
            <p className="text-lg font-black tracking-tight text-slate-950">MAREF</p>
            <p className="hidden text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500 sm:block">
              L&apos;intelligence de vos choix
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primaryNavigation.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  if (active) {
                    event.preventDefault();
                    router.refresh();
                  }
                }}
                className={
                  "rounded-2xl px-3.5 py-2 text-sm font-semibold transition-all " +
                  (active
                    ? "bg-gradient-to-r from-slate-950 to-blue-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)]"
                    : "text-slate-600 hover:bg-white/75 hover:text-blue-950")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          {!loading && !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-2xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/70 hover:text-blue-950 sm:block"
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className="rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.24)] transition-all hover:translate-y-[-1px]"
              >
                Commencer
              </Link>
            </div>
          ) : (
            <>
              <Link href="/favoris" className="rounded-2xl p-2.5 transition-colors hover:bg-white/75" title="Favoris">
                <Heart className="h-[18px] w-[18px] text-slate-500" />
              </Link>
              <Link href="/assistant" className="rounded-2xl p-2.5 transition-colors hover:bg-white/75" title="Assistant Mimo">
                <Sparkles className="h-[18px] w-[18px] text-slate-500" />
              </Link>
              <Link href="/notifications" className="relative rounded-2xl p-2.5 transition-colors hover:bg-white/75" title="Notifications">
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
                  className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-950 to-slate-950 text-sm font-bold text-white ring-4 ring-white/70 transition-transform hover:scale-[1.03]"
                  aria-label="Ouvrir le menu du compte"
                >
                  {initials}
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                    <div className="glass-nav absolute right-0 top-13 z-50 w-64 animate-scale-in rounded-[28px] py-2">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-bold text-slate-950">{user?.user_metadata?.name || "Utilisateur"}</p>
                        <p className="truncate text-xs text-slate-400">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {accountNavigation.map((item) => {
                          const active = isActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={(event) => {
                                if (active) {
                                  event.preventDefault();
                                  router.refresh();
                                }
                                setShowMenu(false);
                              }}
                              className={
                                "mx-2 flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm transition-colors " +
                                (active ? "bg-slate-100 text-blue-950" : "text-slate-700 hover:bg-white/70")
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
                          Déconnexion
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
