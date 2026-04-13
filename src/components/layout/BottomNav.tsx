"use client";

import Link from "next/link";
import { MoreHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { mobileMainNavigation, mobileMoreNavigation } from "@/features/navigation/config";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[3px]"></div>
          <div
            className="glass-nav absolute bottom-20 left-3 right-3 animate-scale-in rounded-[28px] p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-bold text-slate-950">Plus</span>
              <button onClick={() => setShowMore(false)} className="rounded-full p-1 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {mobileMoreNavigation.map((item) => {
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
                      setShowMore(false);
                    }}
                    className={
                      "flex flex-col items-center gap-1 rounded-[22px] p-3 transition-all " +
                      (active
                        ? "bg-gradient-to-br from-slate-950 to-blue-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                        : "text-slate-600 hover:bg-white/70")
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-center text-[0.62rem] font-semibold leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav
        className="glass-nav fixed bottom-3 left-3 right-3 z-50 flex h-17 items-center justify-around rounded-[30px] px-1 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {mobileMainNavigation.map((item) => {
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
                "flex min-w-[64px] flex-col items-center gap-0.5 rounded-[20px] px-3 py-2 transition-all " +
                (active
                  ? "bg-gradient-to-br from-slate-950 to-blue-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                  : "text-slate-500 hover:bg-white/70 hover:text-blue-950")
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[0.62rem] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore((current) => !current)}
          className={
            "flex min-w-[64px] flex-col items-center gap-0.5 rounded-[20px] px-3 py-2 transition-all " +
            (showMore
              ? "bg-gradient-to-br from-slate-950 to-blue-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
              : "text-slate-500 hover:bg-white/70 hover:text-blue-950")
          }
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[0.62rem] font-semibold">Plus</span>
        </button>
      </nav>
    </>
  );
}
