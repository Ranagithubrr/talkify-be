const Message = require('../models/Message');
const { isValidObjectId } = require('mongoose');

async function sendMessage(req, res, next) {
  try {
    const { senderId, recipientId, content } = req.body;

    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ message: 'senderId, recipientId, and content are required' });
    }

    if (!isValidObjectId(senderId) || !isValidObjectId(recipientId)) {
      return res.status(400).json({ message: 'Invalid senderId or recipientId' });
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content: trimmedContent,
    });

    return res.status(201).json({
      message: {
        id: message._id,
        sender: message.sender,
        recipient: message.recipient,
        content: message.content,
        sentAt: message.sentAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    const { userA, userB } = req.query;

    if (!userA || !userB) {
      return res.status(400).json({ message: 'userA and userB are required' });
    }

    if (!isValidObjectId(userA) || !isValidObjectId(userB)) {
      return res.status(400).json({ message: 'Invalid user ids' });
    }

    const messages = await Message.find({
      $or: [
        { sender: userA, recipient: userB },
        { sender: userB, recipient: userA },
      ],
    })
      .sort({ sentAt: 1 })
      .lean();

    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  sendMessage,
  getConversation,
};
