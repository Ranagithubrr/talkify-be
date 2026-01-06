const { Schema, model, Types } = require('mongoose');

const messageSchema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports = model('Message', messageSchema);
