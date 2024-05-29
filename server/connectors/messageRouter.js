const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const conversationModel = require("../models/conversationModel");
const messageModel = require("../models/messageModel");

const router = express.Router();

//send message
router.post("/send/:id", protectRoute, async (req, res) => {
  try {
    const { message } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params.id;

    let conversation = await conversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new conversationModel({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    const newMessage = new messageModel({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
    });

    await newMessage.save();

    conversation.messages.push(newMessage._id);
    await conversation.save();

    return res.status(201).json({
      status: "success",
      message: "Message successfully created",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//get messages
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let conversation = await conversationModel
      .findOne({
        participants: { $all: [receiverId, senderId] },
      })
      .populate("messages")
      .exec();

    if (!conversation) {
      return res.json({
        status: "error",
        message: "Conversation not found",
        data: [],
      });
    }

    return res.json({
      status: "success",
      data: conversation.messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

module.exports = router;
