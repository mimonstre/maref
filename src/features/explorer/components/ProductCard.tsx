"use client";

import { ArrowUpRight, Layers3 } from "lucide-react";
import { getCategoryIcon } from "@/lib/categories";
import type { Product } from "@/lib/core";

type ProductCardProps = {
  product: Product;
  href: string;
  mode?: "list" | "grid";
  rank?: number | null;
  onOpen: () => void;
};

export default function ProductCard({ product, href, mode = "list", rank, onOpen }: ProductCardProps) {
  const merchantPreview = product.merchants.slice(0, mode === "grid" ? 3 : 4);

  if (mode === "grid") {
    return (
      <div
        onClick={onOpen}
        data-href={href}
        className="premium-card hover-lift group cursor-pointer rounded-[28px] p-4"
      >
        <div className="relative mb-4 overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-100 via-white to-slate-200">
          <div className="flex h-40 w-full items-center justify-center text-4xl">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            ) : (
              <span className="opacity-90">{getCategoryIcon(product.category)}</span>
            )}
          </div>
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/88 px-2.5 py-1 text-[0.65rem] font-bold text-slate-700 shadow-sm">
            <Layers3 className="h-3.5 w-3.5 text-blue-950" />
            {product.offerCount} offre{product.offerCount > 1 ? "s" : ""}
          </div>
        </div>

        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">{product.brand}</p>
        <p className="mt-1 line-clamp-2 text-base font-black text-slate-950 transition-colors group-hover:text-blue-950">{product.title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ouvrir la fiche produit pour voir les offres marchandes, les écarts et les redirections utiles.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {merchantPreview.map((merchant) => (
            <span key={merchant} className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.65rem] font-semibold text-slate-600">
              {merchant}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onOpen}
      data-href={href}
      className="premium-card hover-lift group flex cursor-pointer gap-4 rounded-[30px] p-4"
    >
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-100 via-white to-slate-200 text-3xl">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <span className="opacity-90">{getCategoryIcon(product.category)}</span>
        )}
        {rank !== null && rank !== undefined && (
          <span className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-950 to-blue-900 text-[0.65rem] font-bold text-white shadow-sm">
            {rank}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">{product.brand}</p>
            <p className="mt-1 truncate text-lg font-black text-slate-950 transition-colors group-hover:text-blue-950">{product.title}</p>
          </div>
          <div className="rounded-full bg-blue-50 px-2.5 py-1 text-[0.68rem] font-bold text-blue-950">
            {product.offerCount} offre{product.offerCount > 1 ? "s" : ""}
          </div>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Voir les enseignes, les conditions de vente et les offres vraiment comparables sur une même fiche.
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {merchantPreview.map((merchant) => (
              <span key={merchant} className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-600">
                {merchant}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-950">
            Ouvrir
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
