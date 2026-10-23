import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand"; "@/models/Brand";

const bad = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

// GET /api/products/:id   (id or slug)
export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const product = await Product.findOne(query)
      .populate("category", "name slug")
      .populate("brand", "name slug");
    if (!product) return bad("Product not found", 404);
    return NextResponse.json({ product });
  } catch (err) {
    return bad(err.message, 500);
  }
}

// PUT /api/products/:id
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return bad("Invalid id");

    const body = await req.json();
    const product = await Product.findById(id);
    if (!product) return bad("Product not found", 404);

    // slug must stay unique
    if (body.slug && body.slug !== product.slug) {
      const taken = await Product.exists({ slug: body.slug, _id: { $ne: id } });
      if (taken) return bad("Slug already in use");
    }

    product.set({
      ...body,
      category: body.category || undefined,
      brand: body.brand || undefined,
    });
    await product.save(); // runs the pre-validate hook (totalStock, minPrice)

    return NextResponse.json({ product });
  } catch (err) {
    return bad(err.message, err.name === "ValidationError" ? 400 : 500);
  }
}

// DELETE /api/products/:id
export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return bad("Product not found", 404);
    return NextResponse.json({ success: true });
  } catch (err) {
    return bad(err.message, 500);
  }
}