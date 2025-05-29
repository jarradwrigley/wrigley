// models/UserCart.ts
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: String,
  key: String,
  size: String,
  quantity: Number,
  price: Number,
  title: String,
  image: String,
});

const UserCartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  total: Number,
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserCart ||
  mongoose.model("UserCart", UserCartSchema);
