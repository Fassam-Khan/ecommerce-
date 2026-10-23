
import mongoose from "mongoose";

const OptionValueSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    img_url: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const VariantSchema = new mongoose.Schema(
  {
    varientName: {
      type: String,
      default: "",
      trim: true,
    },

    optionValues: {
      type: [OptionValueSchema],
      default: [],
    },
  },
  { _id: true }
);

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Tiptap HTML description
    description: {
      type: String,
      default: "",
    },

    // Main media selected from your media library
    img_url: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Media",
        },
        file: {
          type: String,
          required: true,
        },
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    isInventoryTrack: {
      type: Boolean,
      default: false,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },

    collection: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],

    varient: {
      type: [VariantSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
