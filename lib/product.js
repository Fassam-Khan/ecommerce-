import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function getNewArrivals() {
  await connectDB();

  const products = await Product.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return JSON.parse(JSON.stringify(products));
}