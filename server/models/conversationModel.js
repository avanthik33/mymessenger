const mongoose = require("mongoose");

const conversationModel = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversations", conversationModel);
