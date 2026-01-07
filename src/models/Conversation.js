const { Schema, model, Types } = require('mongoose');

const conversationSchema = new Schema(
  {
    members: {
      type: [Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length === 2;
        },
        message: 'Conversation must have exactly two members',
      },
    },
    lastMessage: {
      type: Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ members: 1 });

module.exports = model('Conversation', conversationSchema);
