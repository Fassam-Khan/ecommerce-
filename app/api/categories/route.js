import { NextResponse } from "next/server";
import Category from "@/models/Category";
import connectDB from "@/lib/mongodb";


export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("Request body:", body);

    const result = await Category.create(body);

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 5

    const data = await Category.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Category.countDocuments()

    return NextResponse.json({ success: true, data, total })
  } catch (error) {
    console.log("Error in Get Api from categories", error)

    return NextResponse.json(
      { success: false, error: "Error in api" },
      { status: 500 }
    )
  }
}
