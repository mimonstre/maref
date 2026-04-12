"use client";

import Link from "next/link";
import { MoreHorizontal, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { mobileMainNavigation, mobileMoreNavigation } from "@/features/navigation/config";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"></div>
          <div
            className="absolute bottom-20 left-3 right-3 animate-scale-in rounded-3xl border border-white/70 bg-white/92 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-bold">Plus</span>
              <button onClick={() => setShowMore(false)} className="rounded-full p-1 hover:bg-slate-100">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {mobileMoreNavigation.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={
                      "flex flex-col items-center gap-1 rounded-2xl p-3 transition-all " +
                      (active ? "bg-slate-100 text-blue-950 shadow-[0_10px_22px_rgba(15,23,42,0.10)]" : "text-gray-600 hover:bg-slate-50")
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-center text-[0.6rem] font-semibold leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-3 left-3 right-3 z-50 flex h-16 items-center justify-around rounded-3xl border border-white/70 bg-white/86 px-1 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {mobileMainNavigation.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all " +
                (active ? "bg-slate-100 text-blue-950" : "text-gray-400 hover:text-blue-950")
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[0.6rem] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore((current) => !current)}
          className={
            "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all " +
            (showMore ? "bg-slate-100 text-blue-950" : "text-gray-400 hover:text-blue-950")
          }
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[0.6rem] font-semibold">Plus</span>
        </button>
      </nav>
    </>
  );
}
