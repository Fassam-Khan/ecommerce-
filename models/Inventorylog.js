import mongoose from "mongoose";

const InventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantRowId: { type: mongoose.Schema.Types.ObjectId, required: true },
    variantLabel: { type: String, default: "" },
    change: { type: Number, required: true }, // +10, -3
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["restock", "sale", "return", "damaged", "correction", "initial"],
      default: "correction",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.InventoryLog || mongoose.model("InventoryLog", InventoryLogSchema);