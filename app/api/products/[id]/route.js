import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";    // apna model

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const ALLOWED_FIELDS = [
  "title",
  "description",
  "img_url",
  "price",
  "costPrice",
  "isInventoryTrack",
  "stock",
  "status",
  "collection",
  "slug",
  "metaTitle",
  "metaDescription",
  "varient",
];

const slugify = (str = "") =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// GET /api/products/:id
export async function GET(req, { params }) {
  try {
    const { id } = await params; // Next 15+: params ek Promise hai
    console.log(id)
    if (!isValidId(id)) {
      return NextResponse.json({ success: false, message: "Invalid product id" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



// PUT /api/products/:id  (update)
export async function PUT(req, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 });
    }

    const body = await req.json();

    // Pick only allowed fields
    const update = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    // Basic validation
    if (update.title !== undefined && !String(update.title).trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }
    if (update.price !== undefined && (isNaN(update.price) || Number(update.price) < 0)) {
      return NextResponse.json({ success: false, message: "Invalid price" }, { status: 400 });
    }
    if (update.stock !== undefined && (isNaN(update.stock) || Number(update.stock) < 0)) {
      return NextResponse.json({ success: false, message: "Invalid stock" }, { status: 400 });
    }
    if (update.status !== undefined && !["active", "draft", "archived"].includes(update.status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    // Regenerate slug if title changed and no slug provided
    if (update.title && !update.slug) {
      update.slug = slugify(update.title);
    }

    // Ensure slug is unique (excluding this product)
    if (update.slug) {
      const exists = await Product.findOne({ slug: update.slug, _id: { $ne: id } });
      if (exists) {
        return NextResponse.json(
          { success: false, message: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: update }, // updatedAt is handled by { timestamps: true }
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
