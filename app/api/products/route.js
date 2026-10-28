
import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

import Product from "@/models/Product";
import Category from "@/models/Category";
import connectDB from "@/lib/mongodb";

// =========================
// POST: Create Product
// =========================
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate title
    if (!body.title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 }
      );
    }

    // Validate price
    if (
      body.price === "" ||
      body.price === undefined ||
      body.price === null ||
      !Number.isFinite(Number(body.price)) ||
      Number(body.price) < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid price is required",
        },
        { status: 400 }
      );
    }

    // Handle multiple categories
    let selected = body.collection ?? [];

    if (!Array.isArray(selected)) {
      selected = [selected];
    }

    const categoryIds = [];

    for (const item of selected) {
      // Accept a string, ObjectId, or category object
      const value =
        typeof item === "string"
          ? item
          : item?._id || item?.slug || item?.id;

      if (!value) continue;

      const categoryValue = String(value).trim();

      let category;

      // MongoDB ObjectId
      if (
        Types.ObjectId.isValid(categoryValue) &&
        categoryValue.length === 24
      ) {
        category = await Category.findById(categoryValue);
      } else {
        // Keep the complete slug:
        // collections/crayons-pastels
        category = await Category.findOne({
          slug: categoryValue,
        });
      }

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: `Category not found: ${categoryValue}`,
          },
          { status: 400 }
        );
      }

      // Prevent duplicate categories
      const alreadyExists = categoryIds.some(
        (id) => id.toString() === category._id.toString()
      );

      if (!alreadyExists) {
        categoryIds.push(category._id);
      }
    }

    // Create product with category references
    const productData = {
      ...body,
      collection: categoryIds,
      price: Number(body.price),
    };

    const product = await Product.create(productData);

    // Return product with complete category details
    const populatedProduct = await Product.findById(product._id)
      .populate("collection")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: populatedProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// =========================
// GET: Fetch Products
// Supports pagination, search, status
// =========================
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugify = (str = "") =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// GET /api/products?page=1&limit=50&search=varnish&status=active
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit")) || 50, 1), 100);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";

    const query = {};

    // Status filter ("all" = no filter)
    if (["active", "draft", "archived"].includes(status)) {
      query.status = status;
    }

    // Search by title or slug (case-insensitive, regex-safe)
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ title: regex }, { slug: regex }];
    }

    const [data, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1, _id: -1 }) // stable order across pages
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

