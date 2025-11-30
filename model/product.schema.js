const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    brand: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "seller" },
    coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "coupon" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
