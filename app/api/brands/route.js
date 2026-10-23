import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";

const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// GET /api/brands
export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ brands });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/brands  { name, logo?, description? }
export async function POST(req) {
  try {
    await connectDB();
    const { name, logo, description } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const slug = slugify(name);
    const existing = await Brand.findOne({ $or: [{ slug }, { name: name.trim() }] });
    if (existing) return NextResponse.json({ brand: existing }); // reuse instead of failing

    const brand = await Brand.create({ name: name.trim(), slug, logo, description });
    return NextResponse.json({ brand }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}