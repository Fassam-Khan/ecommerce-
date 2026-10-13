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

