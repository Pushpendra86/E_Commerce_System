const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Seller name is required"],
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);
