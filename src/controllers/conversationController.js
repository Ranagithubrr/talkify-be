const Conversation = require('../models/Conversation');
const { isValidObjectId } = require('mongoose');

function normalizeMembers(memberA, memberB) {
  return [memberA.toString(), memberB.toString()].sort();
}

async function listConversations(req, res, next) {
  try {
    const { userId } = req.query;
    const tokenUserId = req.user && req.user.id;

    const effectiveUserId = userId || tokenUserId;

    if (!effectiveUserId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!isValidObjectId(effectiveUserId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    if (tokenUserId && userId && tokenUserId !== userId) {
      return res.status(403).json({ message: 'Not allowed to access other users conversations' });
    }

    const conversations = await Conversation.find({ members: effectiveUserId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('lastMessage')
      .populate('members', 'name email photo')
      .lean();

    const formatted = conversations.map((conversation) => {
      const receiver = (conversation.members || []).find(
        (member) => member && member._id.toString() !== effectiveUserId.toString()
      );

      return {
        _id: conversation._id,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        receiver: receiver
          ? {
              id: receiver._id,
              name: receiver.name,
              email: receiver.email,
              photo: receiver.photo,
            }
          : null,
        receiverName: receiver ? receiver.name : null,
      };
    });

    return res.json({ conversations: formatted });
  } catch (err) {
    return next(err);
  }
}

async function createConversation(req, res, next) {
  try {
    const { memberA, memberB } = req.body;
    const tokenUserId = req.user && req.user.id;

    if (!memberA || !memberB) {
      return res.status(400).json({ message: 'memberA and memberB are required' });
    }

    if (!isValidObjectId(memberA) || !isValidObjectId(memberB)) {
      return res.status(400).json({ message: 'Invalid memberA or memberB' });
    }

    if (memberA.toString() === memberB.toString()) {
      return res.status(400).json({ message: 'memberA and memberB must be different' });
    }

    if (
      tokenUserId &&
      tokenUserId !== memberA.toString() &&
      tokenUserId !== memberB.toString()
    ) {
      return res.status(403).json({ message: 'Not allowed to create conversation for other users' });
    }

    const members = normalizeMembers(memberA, memberB);
    const conversation = await Conversation.findOneAndUpdate(
      { members },
      { $setOnInsert: { members } },
      { upsert: true, new: true }
    );

    return res.status(201).json({ conversation });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listConversations,
  createConversation,
};
