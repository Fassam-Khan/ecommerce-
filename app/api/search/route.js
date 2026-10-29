import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { searchTerm } = await req.json();

    if (!searchTerm || !searchTerm.trim()) {
      return NextResponse.json({ products: [] });
    }

    // escape regex special characters
    const safe = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    await connectDB();

    const products = await Product.find({
      title: { $regex: safe, $options: "i" },
    })
      .select("title price img_url slug")
      .limit(10)
      .lean();

    // ObjectId isn't JSON-friendly, so convert it to a string
    const result = products.map((p) => ({ ...p, _id: p._id.toString() }));

    return NextResponse.json({ products: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}