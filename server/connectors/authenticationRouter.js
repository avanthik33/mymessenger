const express = require("express");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

const router = express.Router();
require("dotenv").config();

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

//send otp
router.post("/sendOtp", async (req, res) => {
  try {
    const email = req.body.email;
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Send OTP to the user's email
    await transporter.sendMail({
      to: email,
      subject: "Your MyMessenger Signup Verification Code",
      text: `Welcome,

              Thank you for signing up with MyMessenger. To complete your registration, please use the following verification code:

              Verification Code: ${otp}

              If you did not request this code, please ignore this email.

              Best regards,
              MyMessenger Support Team`,
              html: `<p>Dear User,</p>
                <p>Thank you for signing up with <strong>MyMessenger</strong>. To complete your registration, please use the following verification code:</p>
                <h2>${otp}</h2>
                <p>If you did not request this code, please ignore this email.</p>
                <p>Best regards,</p>
                <p><strong>MyMessenger Support Team</strong></p>`,
    });

    return res.json({
      status: "success",
      otp: otp,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
});

// USER signup
router.post("/signup", async (req, res) => {
  try {
    let { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.json({
        status: "error",
        message: "input not completed",
      });
    }

    let existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.json({
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
