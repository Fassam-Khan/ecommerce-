
import dotenv from "dotenv";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

dotenv.config({ path: ".env.local" });

const { v2 } = cloudinary;

// Your existing models
const { default: Product } = await import("../models/Product.js");
const { default: Media } = await import("../models/Media.js");
const { default: Category } = await import("../models/Category.js");

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Shopify or other image URL -> Cloudinary URL
const uploadedUrls = new Map();

function isCloudinaryUrl(url = "") {
  return url.includes("res.cloudinary.com/");
}

// Convert category arrays or serialized arrays to slugs
function parseSlugs(value) {
  if (Array.isArray(value)) {
    return value.flatMap(parseSlugs);
  }

  if (typeof value !== "string") {
    return [];
  }

  const text = value.trim();

  if (text.startsWith("[") && text.endsWith("]")) {
    try {
      const parsed = JSON.parse(
        text.replace(/'/g, '"')
      );

      if (Array.isArray(parsed)) {
        return parsed.flatMap(parseSlugs);
      }
    } catch {
      return text
        .slice(1, -1)
        .split(",")
        .map((item) =>
          item.trim().replace(/^['"]|['"]$/g, "")
        )
        .filter(Boolean);
    }
  }

  return [text].filter(Boolean);
}

async function uploadImage(oldUrl) {
  if (isCloudinaryUrl(oldUrl)) {
    return oldUrl;
  }

  if (uploadedUrls.has(oldUrl)) {
    return uploadedUrls.get(oldUrl);
  }

  const result = await v2.uploader.upload(oldUrl, {
    folder: "shopify-products",
    resource_type: "image",
  });

  uploadedUrls.set(oldUrl, result.secure_url);

  return result.secure_url;
}

async function migrateImages() {
  let uploaded = 0;
  let failed = 0;
  let mediaCreated = 0;
  let productsUpdated = 0;

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // Read raw documents to avoid Mongoose casting errors
    // from imported Shopify fields.
    const products = await Product.collection
      .find({ "img_url.0": { $exists: true } })
      .toArray();

    console.log("Products found:", products.length);

    for (const product of products) {
      try {
        const images = Array.isArray(product.img_url)
          ? product.img_url
          : [];

        let imageChanged = false;

        // 1. Upload product images and update their URLs.
        for (const image of images) {
          const oldUrl = image.file;

          if (!oldUrl) continue;

          if (isCloudinaryUrl(oldUrl)) {
            continue;
          }

          try {
            const cloudinaryUrl = await uploadImage(oldUrl);

            image.file = cloudinaryUrl;
            imageChanged = true;
            uploaded++;

            console.log("Image uploaded:", product.title);

          } catch (error) {
            failed++;
            console.error(
              "Image upload failed:",
              product.title,
              error.message
            );
          }
        }

        // 2. Resolve Shopify category slugs to MongoDB IDs.
        const slugs = [
          ...new Set(parseSlugs(product.collection)),
        ];

        let categoryIds = slugs;

        if (slugs.length > 0) {
          const categories = await Category.find({
            slug: { $in: slugs },
          })
            .select("_id slug")
            .lean();

          const categoryMap = new Map(
            categories.map((category) => [
              category.slug,
              category._id,
            ])
          );

          const missing = slugs.filter(
            (slug) => !categoryMap.has(slug)
          );

          if (missing.length > 0) {
            console.error(
              "Missing categories:",
              product.title,
              missing
            );

            // Don't overwrite the product's categories with
            // incomplete IDs. Images can still be migrated.
            categoryIds = null;
          } else {
            categoryIds = slugs.map(
              (slug) => categoryMap.get(slug)
            );
          }
        }

        // 3. Update product directly in MongoDB.
        // This avoids unrelated validation failures for
        // imported slug/SKU values.
        const update = {};

        if (imageChanged) {
          update.img_url = images;
        }

        if (categoryIds !== null && slugs.length > 0) {
          update.collection = categoryIds;
        }

        if (Object.keys(update).length > 0) {
          await Product.collection.updateOne(
            { _id: product._id },
            { $set: update }
          );

          productsUpdated++;
        }

        // 4. Add Cloudinary images to Media collection.
        // Reuse existing Media records where possible.
        for (const image of images) {
          if (!isCloudinaryUrl(image.file)) continue;

          const existing = await Media.findOne({
            file: image.file,
          }).select("_id").lean();

          if (!existing) {
            await Media.create({ file: image.file });
            mediaCreated++;
          }
        }

        console.log("Processed:", product.title);

      } catch (error) {
        failed++;
        console.error(
          "Product migration failed:",
          product.title,
          error.message
        );
      }
    }

    console.log("\nMigration finished");
    console.log({
      productsFound: products.length,
      imagesUploaded: uploaded,
      mediaRecordsCreated: mediaCreated,
      productsUpdated,
      failures: failed,
    });

  } catch (error) {
    console.error("Migration error:", error.message);

  } finally {
    await mongoose.disconnect();
  }
}

migrateImages();
