const express = require("express");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Hash password
const hashFunction = async (pass) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// USER signup
router.post("/signup", async (req, res) => {
  try {
    let { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "input not completed",
      });
    }

    let existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "already existing user",
      });
    }
    let hashedPassword = await hashFunction(password);
    let newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({
      status: "success",
      message: "successfully created account",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
});

// USER signin
router.post("/signin", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        status: "error",
        message: "input not completed",
      });
    }

    let admin = await adminModel.findOne({ email: email });
    let user = await userModel.findOne({ email: email });

    if (admin) {
      if (email === admin.email && password === admin.password) {
        jwt.sign(
          { email: email, id: admin._id },
          process.env.JWT_KEY,
          { expiresIn: "1d" },
          (error, token) => {
            if (error) {
              return res.json({
                status: "error",
                message: "Error in jwt token",
              });
            } else {
              return res.json({
                status: "success",
                message: "admin authenticated",
                data: admin,
                token: token,
              });
            }
          }
        );
      } else {
        return res.json({
          status: "error",
          message: "authentication failed",
        });
      }
    } else if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        jwt.sign(
          { email: email, id: user._id },
          process.env.JWT_KEY,
          { expiresIn: "1d" },
          (error, token) => {
            if (error) {
              return res.json({
                status: "error",
                message: "Error in jwt token",
              });
            } else {
              return res.json({
                status: "success",
                message: "user authenticated",
                data: user,
                token: token,
              });
            }
          }
        );
      } else {
        return res.json({
          status: "error",
          message: "authentication failed",
        });
      }
    } else {
      return res.json({
        status: "error",
        message: "no user found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
