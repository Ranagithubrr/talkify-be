const { Server } = require('socket.io');
const { isValidObjectId } = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const config = require('../config');

function normalizeMembers(senderId, recipientId) {
  return [senderId.toString(), recipientId.toString()].sort();
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
    },
  });

  const activeCounts = new Map(); // userId -> connection count

  const broadcastActiveUsers = () => {
    const users = Array.from(activeCounts.keys());
    io.emit('active:users', users);
  };

  io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;
    if (userId && isValidObjectId(userId)) {
      socket.join(userId);
      const current = activeCounts.get(userId) || 0;
      activeCounts.set(userId, current + 1);
      broadcastActiveUsers();
    }

    socket.on('message:send', async (payload, ack) => {
      try {
        const { senderId, recipientId, content } = payload || {};
        if (!senderId || !recipientId || !content) {
          const error = 'senderId, recipientId, and content are required';
          if (ack) ack({ ok: false, error });
          return;
        }

        if (!isValidObjectId(senderId) || !isValidObjectId(recipientId)) {
          const error = 'Invalid senderId or recipientId';
          if (ack) ack({ ok: false, error });
          return;
        }

        const trimmedContent = content.trim();
        if (!trimmedContent) {
          const error = 'Message content cannot be empty';
          if (ack) ack({ ok: false, error });
          return;
        }

        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content: trimmedContent,
        });

        const members = normalizeMembers(senderId, recipientId);
        await Conversation.findOneAndUpdate(
          { members },
          {
            $set: {
              lastMessage: message._id,
              lastMessageAt: message.sentAt,
            },
            $setOnInsert: { members },
          },
          { upsert: true }
        );

        const payloadOut = {
          id: message._id,
          sender: message.sender,
          recipient: message.recipient,
          content: message.content,
          sentAt: message.sentAt,
        };

        io.to(senderId.toString()).to(recipientId.toString()).emit('message:new', payloadOut);
        if (ack) ack({ ok: true, message: payloadOut });
      } catch (err) {
        console.error('Socket message error', err);
        if (ack) ack({ ok: false, error: 'Internal error' });
      }
    });

    socket.on('disconnect', () => {
      if (userId && isValidObjectId(userId) && activeCounts.has(userId)) {
        const next = (activeCounts.get(userId) || 1) - 1;
        if (next <= 0) {
          activeCounts.delete(userId);
        } else {
          activeCounts.set(userId, next);
        }
        broadcastActiveUsers();
      }
    });
  });

  return io;
}

module.exports = setupSocket;
