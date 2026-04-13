"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
};

export default function AppBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-slate-300" />}
          {item.href ? (
            <Link
              href={item.href}
              className={
                "rounded-full px-3 py-1.5 transition-colors " +
                (item.current
                  ? "bg-blue-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-blue-950")
              }
            >
              {item.label}
            </Link>
          ) : item.onClick ? (
            <button
              onClick={item.onClick}
              className={
                "rounded-full px-3 py-1.5 transition-colors " +
                (item.current
                  ? "bg-blue-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-blue-950")
              }
            >
              {item.label}
            </button>
          ) : (
            <span className="rounded-full bg-blue-950 px-3 py-1.5 text-white">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
