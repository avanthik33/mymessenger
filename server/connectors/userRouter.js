const express = require("express");
const userModel = require("../models/userModel");
const protectRoute = require("../middleware/protectRoute");

const router = express.Router();

//view all users
router.get("/viewAll", protectRoute, async (req, res) => {
  try {
    const loggedUser = req.user._id;
    let data = await userModel
      .find({ _id: { $ne: loggedUser } })
      .select("-password");
    return res.json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: "error",
      message: "internal server error",
    });
  }
});

module.exports = router;
