
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/lib/mongodb";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (
      body.price === "" ||
      body.price === undefined ||
      body.price === null ||
      !Number.isFinite(Number(body.price)) ||
      Number(body.price) < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Valid price is required" },
        { status: 400 }
      );
    }

    const product = await Product.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product POST error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);

//     const page = Math.max(
//       1,
//       parseInt(searchParams.get("page") || "1", 10) || 1
//     );

//     const limit = Math.min(
//       100,
//       Math.max(
//         1,
//         parseInt(searchParams.get("limit") || "10", 10) || 10
//       )
//     );

//     const search = searchParams.get("search")?.trim();

//     const filter = {};

//     if (search) {
//       filter.title = { $regex: search, $options: "i" };
//     }

//     const [products, total] = await Promise.all([
//       Product.find(filter)
//         .populate("collection")
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),

//       Product.countDocuments(filter),
//     ]);

//     return NextResponse.json({
//       success: true,
//       products,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Product GET error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to fetch products" },
//       { status: 500 }
//     );
//   }
// }


export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 50

    const data = await Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Product.countDocuments()

    return NextResponse.json({ success: true, data, total })
  } catch (error) {
    console.log("Error in Get Api from categories", error)

    return NextResponse.json(
      { success: false, error: "Error in api" },
      { status: 500 }
    )
  }
}
