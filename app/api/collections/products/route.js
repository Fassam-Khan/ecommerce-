import { NextResponse } from "next/server";
import { getCollectionProducts } from "@/lib/product";

export async function GET(req, { params }) {
  const { slug } = await params;
  const sp = req.nextUrl.searchParams;

  const data = await getCollectionProducts(slug, {
    page: sp.get("page"),
    limit: sp.get("limit"),
    sort: sp.get("sort") || "newest",
    minPrice: sp.get("minPrice"),
    maxPrice: sp.get("maxPrice"),
    inStock: sp.get("inStock") === "1",
    brands: sp.get("brands") ? sp.get("brands").split(",").filter(Boolean) : [],
  });

  if (!data) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}