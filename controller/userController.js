const bcrypt = require("bcrypt");
const userModel = require("../model/user.schema");
const JWT = require("jsonwebtoken");
const productSchema = require("../model/product.schema");
const orderSchema = require("../model/order.schema");
const Joi = require("joi");
// user Register
const registerUser = async (req, res) => {
  try {
    const userRegister = Joi.object({
      userName: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      address: Joi.string(),
      phone: Joi.string(),
    });
    const { error } = userRegister.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }
    const { userName, email, password, address, phone } = req.body;
    //validation
    if (!userName || !email || !password || !address || !phone) {
      return res.status(500).send({
        success: false,
        message: "Please fill all details",
      });
    }
    //check user whether he/she is already registerd of not
    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(500).send({
        success: false,
        message: "User already registered, Please login with another account",
      });
    }

    //hashing password
    var salt = bcrypt.genSaltSync(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //create new user
    const user = await userModel.create({
      userName,
      email,
      password: hashPassword,
      address,
      phone,
    });
    res.status(201).send({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "error in Register API",
      error,
    });
  }
};

// user Login
const loginUser = async (req, res) => {
  try {
    const userLogin = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    const { error } = userLogin.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "please provide email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }

    // compare password || check user password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials",
      });
    }
    //Token for encryption we use sign
    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    //Hide password
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "login successfully",
      token,
      user,
    });

    //wallet point (5 bonus point per login)
    user.wallet += 5;
    await user.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: " error in login",
      error,
    });
  }
};

// user list product
const userListProduct = async (req, res) => {
  try {
    const products = await productSchema.find();
    if (!products) {
      return res
        .status(404)
        .send({ success: false, message: "No product is available" });
    }
    res.status(200).send({ success: true, message: products });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error occured in product list API",
      error,
    });
  }
};

// add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    //Joi validation
    const addToCart = Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.string().required(),
    });
    const { error } = addToCart.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }
    const user = await userModel.findOne({ _id: req.user.id });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "user not found" });
    }
    const product = await productSchema.findById(productId);
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "product not found" });
    }
    // Check if item already exists
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity; // update quantity
    } else {
      user.cart.push({ product: productId, quantity }); // add new item
    }

    await user.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(
        { success: false, message: "error occured in add to cart API" },
        error
      );
  }
};

//Order
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let total = 0;

    // Check quantity and calculate total
    for (let item of user.cart) {
      const product = await productSchema.findById(item.product);
      if (!product)
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });

      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      }

      total += product.price * item.quantity;
      total -= couponDiscount;
      total -= user.wallet;

      // Deduct quantity
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new orderSchema({
      userId,
      items: user.cart,
      total,
      status: "pending",
    });

    // Example: after "payment gateway call"
    order.status = paymentSuccess ? "completed" : "failed";
    await order.save();

    // Clear user cart and wallet
    user.cart = [];
    user.wallet = 0;
    await user.save();

    res.status(200).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  userListProduct,
  addToCart,
  placeOrder,
};
