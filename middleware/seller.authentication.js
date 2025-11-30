const JWT = require("jsonwebtoken");
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }
    const token = req.headers["authorization"].split(" ")[1];
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({
          success: false,
          message: "Un-Authorize seller",
        });
      }
      if (decode.role != "seller") {
        return res.status(404).send({
          success: false,
          message: "Access denied, You're not a seller",
        });
      }
      req.seller = { id: decode.id };
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Authentication",
      error,
    });
  }
};
