import mongoose from "mongoose";

// One document per counter, e.g. { _id: "order", seq: 3 }
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter || mongoose.model("Counter", CounterSchema);