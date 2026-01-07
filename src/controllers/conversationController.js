const Conversation = require('../models/Conversation');
const { isValidObjectId } = require('mongoose');

function normalizeMembers(memberA, memberB) {
  return [memberA.toString(), memberB.toString()].sort();
}

async function listConversations(req, res, next) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const conversations = await Conversation.find({ members: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('lastMessage')
      .lean();

    return res.json({ conversations });
  } catch (err) {
    return next(err);
  }
}

async function createConversation(req, res, next) {
  try {
    const { memberA, memberB } = req.body;

    if (!memberA || !memberB) {
      return res.status(400).json({ message: 'memberA and memberB are required' });
    }

    if (!isValidObjectId(memberA) || !isValidObjectId(memberB)) {
      return res.status(400).json({ message: 'Invalid memberA or memberB' });
    }

    if (memberA.toString() === memberB.toString()) {
      return res.status(400).json({ message: 'memberA and memberB must be different' });
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
