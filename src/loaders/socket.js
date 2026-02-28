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
    const socketUserId = userId && isValidObjectId(userId) ? userId : null;
    if (socketUserId) {
      socket.join(socketUserId);
      const current = activeCounts.get(socketUserId) || 0;
      activeCounts.set(socketUserId, current + 1);
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

    socket.on('conversations:list', async (payload, ack) => {
      try {
        const requestedUserId = payload && payload.userId;
        const effectiveUserId = requestedUserId || socketUserId;

        if (!effectiveUserId || !isValidObjectId(effectiveUserId)) {
          const error = 'Valid userId is required';
          if (ack) ack({ ok: false, error });
          return;
        }

        if (socketUserId && requestedUserId && requestedUserId !== socketUserId) {
          const error = 'Not allowed to access other users conversations';
          if (ack) ack({ ok: false, error });
          return;
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

        if (ack) ack({ ok: true, conversations: formatted });
      } catch (err) {
        console.error('Socket conversations list error', err);
        if (ack) ack({ ok: false, error: 'Internal error' });
      }
    });

    socket.on('disconnect', () => {
      if (socketUserId && activeCounts.has(socketUserId)) {
        const next = (activeCounts.get(socketUserId) || 1) - 1;
        if (next <= 0) {
          activeCounts.delete(socketUserId);
        } else {
          activeCounts.set(socketUserId, next);
        }
        broadcastActiveUsers();
      }
    });
  });

  return io;
}

module.exports = setupSocket;
