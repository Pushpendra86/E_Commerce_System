const sellerModel = require("../model/seller.schema");
const bcrypt = require("bcrypt");
const SellerBrand = require("../model/sellerBrand.schema");
const productSchema = require("../model/product.schema");
const couponSchema = require("../model/coupon.schema");
const Joi = require("joi");

// seller register
const sellerRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //joi validation
    const sellerRegister = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    const { error } = sellerRegister.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: "please provide all details" });
    }

    //checking seller
    const existingSeller = await sellerModel.findOne({ email });
    if (existingSeller) {
      return res
        .status(500)
        .send({ sucess: false, message: "Seller is already registered" });
    }

    //hashing its password
    const hashedPassword = await bcrypt.hash(password, 10);

    //creating and saving new seller
    const newSeller = await sellerModel.create({
      name,
      email,
      password: hashedPassword,
    });
    await newSeller.save();

    res.status(201).send({
      success: true,
      message: "New seller is created successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ sucess: false, message: "Error in creating seller" });
  }
};

// Seller Login
const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // joi validation
    const sellerLogin = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    const { error } = sellerLogin.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: "please provide all fields" });
    }
    //check seller

    const seller = await sellerModel.findOne({ email });
    if (!seller) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }

    // compare password || check user password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials",
      });
    }
    //Token for encryption we use sign
    const token = JWT.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    //Hide password
    seller.password = undefined;

    res.status(200).send({
      success: true,
      message: "login successfully",
      token,
      seller,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error occured" });
  }
};

// seller create brand
const sellerCreateBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const sellerBrand = Joi.object({
      name: Joi.string().required(),
    });
    const { error } = sellerBrand.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: "Please provide seller Name" });
    }
    const brand = new SellerBrand({ sellerId: req.user.id, name });
    await brand.save();
    res.status(201).send({ success: true, message: "brand created" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Error occured in creating brand" });
  }
};

//seller list Brand
const sellerListBrand = async (req, res) => {
  try {
    const brands = await SellerBrand.findById({ sellerId: req.user.id });
    if (!brands || brands.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No brand data found" });
    }
    res.status(200).send({ success: true, message: brands });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "error occured" });
  }
};

//seller add product
const sellerAddProduct = async (req, res) => {
  try {
    const { name, price, quantity, brand, coupons } = req.body;

    //joi validation
    const sellerProduct = Joi.object({
      name: Joi.string().required(),
      price: Joi.string().required(),
      quantity: Joi.string().required(),
      brand: Joi.string().required(),
    });
    const { error } = sellerProduct.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: "please provide all details" });
    }
    const product = new productSchema({
      name,
      price,
      quantity,
      brand,
      seller: req.seller.id,
      coupons: coupons || [],
    });
    await product.save();
    res
      .status(201)
      .send({ success: true, message: "product added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ sucess: false, message: "error occured" });
  }
};

//seller list product
const sellerListProduct = async (req, res) => {
  try {
    const products = await productSchema.find({ seller: req.seller.id });
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

//create coupon
const sellerCreateCoupon = async (req, res) => {
  try {
    const { code, discount } = req.body;

    //joi validation
    const sellerCoupon = Joi.object({
      code: Joi.string().required(),
      discount: Joi.string().required(),
    });
    const { error } = sellerCoupon.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: "No coupon is found" });
    }

    // checking coupon is available
    const existingCoupon = await couponSchema.findOne({ code });
    if (existingCoupon) {
      return res
        .status(400)
        .send({ success: false, message: "Coupon code already exists" });
    }
    const coupon = new couponSchema({ code, discount, seller: req.seller.id });
    await coupon.save();
    res.status(201).send({ success: true, message: "coupon created" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error occured in create coupon API",
      error,
    });
  }
};

// seller list coupon
const sellerListCoupon = async (req, res) => {
  try {
    const coupon = await couponSchema.find({ seller: req.seller.id });
    if (!coupon) {
      res
        .status(404)
        .send({ success: false, message: "No coupon is available" });
    }
    res.status(200).send({ success: true, message: coupon });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error occured in list coupon API",
      error,
    });
  }
};

module.exports = {
  sellerRegister,
  sellerLogin,
  sellerCreateBrand,
  sellerListBrand,
  sellerAddProduct,
  sellerListProduct,
  sellerCreateCoupon,
  sellerListCoupon,
};
