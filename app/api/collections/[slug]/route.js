// app/api/collections/[slug]/route.js
import { NextResponse } from "next/server";
import { getCollectionProducts } from "@/lib/product";


export async function GET(req, { params }) {
  try {
    const { slug } = await params; // Next.js 15 mein params Promise hai
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit")) || 20, 1), 100);

    const result = await getCollectionProducts(slug, { page, limit });

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}