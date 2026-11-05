import mongoose from "mongoose";



const OrderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    optionalAdress: {
      type: String,
      
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      
    },
    payment: {
      type: String,
      required: true
    },
  

  },

  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);