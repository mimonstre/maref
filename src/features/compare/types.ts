import type { Offer } from "@/lib/data";

export type CompareFamily = {
  key: string;
  label: string;
};

export type CompareGroup = CompareFamily & {
  offerIds: string[];
  updatedAt: string;
};

export type CompareOfferSnapshot = Pick<
  Offer,
  | "id"
  | "product"
  | "brand"
  | "model"
  | "category"
  | "subcategory"
  | "merchant"
  | "price"
  | "barredPrice"
  | "availability"
  | "delivery"
  | "warranty"
  | "score"
  | "status"
  | "statusColor"
  | "confidence"
  | "freshness"
  | "imageUrl"
  | "sourceUrl"
  | "lastUpdated"
  | "reliabilityScore"
  | "priceHistory"
  | "dataState"
  | "pefas"
  | "mimoShort"
  | "reasons"
  | "vigilances"
  | "specs"
>;

export type PersistedCompareState = {
  groups: CompareGroup[];
  snapshots: Record<string, CompareOfferSnapshot>;
  updatedAt: string;
};
