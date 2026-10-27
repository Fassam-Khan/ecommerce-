import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import InventoryLog from "@/models/Inventorylog";

const bad = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

// GET /api/products/:id/inventory  -> stock summary + last 50 movements
export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id).select(
      "title inventory variantRows totalStock"
    );
    if (!product) return bad("Product not found", 404);

    const logs = await InventoryLog.find({ product: id }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({
      product,
      stockStatus: product.stockStatus,
      logs,
    });
  } catch (err) {
    return bad(err.message, 500);
  }
}

// PATCH /api/products/:id/inventory
// body: { variantRowId, delta?: number, set?: number, reason?: string, note?: string }
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { variantRowId, delta, set, reason, note } = await req.json();

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(variantRowId)) {
      return bad("Invalid product or variant id");
    }
    if (delta === undefined && set === undefined) return bad("Provide delta or set");

    const product = await Product.findById(id);
    if (!product) return bad("Product not found", 404);

    const row = product.variantRows.id(variantRowId);
    if (!row) return bad("Variant row not found", 404);

    const before = row.stock;
    const after = set !== undefined ? Number(set) : before + Number(delta);

    if (!Number.isFinite(after)) return bad("Invalid quantity");
    if (after < 0 && !product.inventory.allowBackorder) {
      return bad(`Not enough stock. Available: ${before}`);
    }

    row.stock = Math.max(0, after);
    await product.save();

    const log = await InventoryLog.create({
      product: product._id,
      variantRowId: row._id,
      variantLabel: row.label,
      change: row.stock - before,
      before,
      after: row.stock,
      reason: reason || "correction",
      note: note || "",
    });

    return NextResponse.json({
      stock: row.stock,
      totalStock: product.totalStock,
      stockStatus: product.stockStatus,
      log,
    });
  } catch (err) {
    return bad(err.message, 500);
  }
}