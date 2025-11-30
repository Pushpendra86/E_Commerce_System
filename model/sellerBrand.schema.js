const mongoose = require("mongoose");

const sellerBrandSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId, //Id is comming from seller schema
    ref: "Seller",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("sellerBrand", sellerBrandSchema);
