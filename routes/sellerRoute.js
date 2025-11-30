const express = require("express");
const router = express.Router();
const {
  sellerRegister,
  sellerLogin,
  sellerCreateBrand,
  sellerListBrand,
  sellerAddProduct,
  sellerListProduct,
  sellerCreateCoupon,
  sellerListCoupon,
} = require("../controller/sellerController");
const sellerAuth = require("../middleware/seller.authentication");

//seller register || POST
router.post("/register", sellerRegister);

//Seller login || POST
router.post("/login", sellerLogin);

// seller create brand (don’t take sellerId from body, only use req.user.id from JWT.) || POST
router.post("/createBrand", sellerAuth, sellerCreateBrand);

// seller list Brand || GET
router.get("/listBrand", sellerAuth, sellerListBrand);

// seller add product || POST
router.post("/addProduct", sellerAuth, sellerAddProduct);

// seller list product || GET
router.get("/listProduct", sellerAuth, sellerListProduct);

// create coupon || POST
router.post("/createCoupon", sellerAuth, sellerCreateCoupon);

// seller list coupon || GET
router.get("/listCoupon", sellerAuth, sellerListCoupon);
module.exports = router;
