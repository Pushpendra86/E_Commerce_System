const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");

//dotenv configration
dotenv.config({ path: __dirname + "/.env" });

// Databse connection
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// //routes
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/seller", require("./routes/sellerRoute"));

// Main route
app.get("/", (req, res) => {
  return res.status(200).send("Hello, Welcome to E-Commerce System");
});
app.listen(PORT, () => {
  console.log(`server is running on localhost http://${PORT}`);
});
