import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: String,
    slug: String,
    image: String,
    price: { type: Number, required: true }, // price at the time of purchase
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, unique: true, index: true }, // 1001, 1002, ...
    accessToken: { type: String, required: true }, // lets only the buyer open the success page
    customer: {
      email: { type: String, required: true, lowercase: true, trim: true },
      firstName: String,
      lastName: String,
      phone: String,
      newsletter: Boolean,
    },
    shippingAddress: {
      country: String,
      address: String,
      apartment: String,
      city: String,
      postalCode: String,
    },
    items: [OrderItemSchema],
    shippingMethod: String,
    paymentMethod: { type: String, enum: ["cod", "card"], required: true },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    discountCode: String,
    subtotal: Number,
    discount: Number,
    shipping: Number,
    total: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);