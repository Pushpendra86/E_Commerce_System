const express = require("express");
const {
  registerUser,
  loginUser,
  userListProduct,
  addToCart,
  placeOrder,
} = require("../controller/userController");
const router = express.Router();
const userAuth = require("../middleware/user.authentication");

//routes for user
//Register || POST
router.post("/register", registerUser);

//Login || POST
router.post("/login", loginUser);

// product list
router.get("/product", userAuth, userListProduct);

// add to cart
router.post("/addToCart", userAuth, addToCart);

//place order
router.post("/placeOrder", userAuth, placeOrder);

module.exports = router;
