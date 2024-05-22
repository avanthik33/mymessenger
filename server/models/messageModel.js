const mongoose = require("mongoose");

const messageModel = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  //createdAt updatedAt
  { timestamps: true }
);

module.exports = mongoose.model("messages", messageModel);
