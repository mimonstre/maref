import { NextRequest, NextResponse } from "next/server";
import { fetchBestBuyOffers, fetchBestBuyOffersByIds, hasBestBuyApiKey } from "@/lib/services/bestbuy";

export async function GET(req: NextRequest) {
  if (!hasBestBuyApiKey()) {
    return NextResponse.json({ error: "BESTBUY_API_KEY not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const search = searchParams.get("search") || "";
  const ids = searchParams.get("ids");
  const limit = Number(searchParams.get("limit") || "10");

  try {
    if (ids) {
      const offers = await fetchBestBuyOffersByIds(
        ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      );
      return NextResponse.json({ offers });
    }

    if (!subcategory && !search) {
      return NextResponse.json({ offers: [] });
    }

    const offers = await fetchBestBuyOffers({
      category,
      subcategory,
      search,
      limit: Number.isFinite(limit) ? limit : 10,
    });

    return NextResponse.json({ offers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown Best Buy error" },
      { status: 500 },
    );
  }
}
