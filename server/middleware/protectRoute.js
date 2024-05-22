const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers["token"];
    jwt.verify(token, process.env.JWT_KEY, async (error, decoded) => {
      if (error) {
        return res.json({
          status: "error",
          message: "unautherized user",
        });
      } else {
        const user = await userModel.findById(decoded.id).select("-password");
        if (!user) {
          return res.json({
            status: "error",
            message: "user not found",
          });
        }
        req.user = user;
        next();
      }
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: "error",
      message: "internal server error",
    });
  }
};
module.exports = protectRoute;
