import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";    // apna model

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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

// PUT /api/products/:id
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ success: false, message: "Invalid product id" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    // in fields ko kabhi client se update nahi karna
    const { _id, __v, createdAt, updatedAt, sku, barcode, ...fields } = body;

    const update = { $set: fields };

    // sku / barcode null aaye to field hata do (unique index ke liye behtar hai)
    const $unset = {};
    if (sku) update.$set.sku = sku; else $unset.sku = "";
    if (barcode) update.$set.barcode = barcode; else $unset.barcode = "";
    if (Object.keys($unset).length) update.$unset = $unset;

    const product = await Product.findById(id)
    .populate("collection")
    .lean();

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    // duplicate slug / sku
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return NextResponse.json(
        { success: false, message: `This ${field} is already used by another product` },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}