import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function getNewArrivals() {
  await connectDB();

  const products = await Product.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return JSON.parse(JSON.stringify(products));
}

const SORT_MAP = {
  newest: { createdAt: -1, _id: -1 },
  "price-asc": { price: 1, _id: -1 },
  "price-desc": { price: -1, _id: -1 },
  "title-asc": { title: 1, _id: -1 },
};
 
export async function getCollectionProducts(
  slug,
  {
    page = 1,
    limit = 20,
    sort = "newest",
    minPrice,
    maxPrice,
    inStock = false,
    brands = [],
    includeFacets = false,
  } = {}
) {
  await connectDB();
 
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
 
  const fullSlug = slug.startsWith("collections/") ? slug : `collections/${slug}`;
 
  const category = await Category.findOne({ slug: fullSlug }).lean();
  if (!category) return null;
 
  // Base query (without filters) -> used for facets (price range, brands)
  const baseQuery = { collection: category._id, status: "active" };
 
  // Filtered query
  const query = { ...baseQuery };
 
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);
  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    query.price = {};
    if (!Number.isNaN(min)) query.price.$gte = min;
    if (!Number.isNaN(max)) query.price.$lte = max;
  }
 
  // NOTE: apne schema ke hisaab se "stock" field ka naam change kar lo
  if (inStock) query.stock = { $gt: 0 };
 
  // NOTE: agar aapke schema mein "brand" nahi hai to ye aur facets wala hissa hata do
  if (brands.length) query.brand = { $in: brands };
 
  const sortBy = SORT_MAP[sort] || SORT_MAP.newest;
 
  const [products, total, facetAgg] = await Promise.all([
    Product.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
    includeFacets
      ? Product.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
              brands: { $addToSet: "$brand" },
            },
          },
        ])
      : Promise.resolve(null),
  ]);
 
  const facets = facetAgg
    ? {
        minPrice: facetAgg[0]?.minPrice ?? 0,
        maxPrice: facetAgg[0]?.maxPrice ?? 0,
        brands: (facetAgg[0]?.brands || []).filter(Boolean).sort(),
      }
    : null;
 
  return JSON.parse(
    JSON.stringify({
      category,
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets,
    })
  );
}