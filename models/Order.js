import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,   // snapshot, so old orders keep their data if the product changes
    price: Number,   // price at time of purchase
    image: String,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, required: true, unique: true, index: true },

    email: { type: String, required: true },
    country: { type: String, default: 'pakistan' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    postalCode: { type: String, default: '' },
    phone: { type: String, required: true },

    items: { type: [OrderItemSchema], required: true },
    totalItems: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingCharges: { type: Number, required: true },
    total: { type: Number, required: true },

    payment: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)