// models/Thread.js
const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroupChat: { type: Boolean, default: false },
  groupName: { type: String, required: function() { return this.isGroupChat; } },
  groupIcon: { type: String }, // URL to the group icon
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // Reference to the last message
  createdAt: { type: Date, default: Date.now },
  unreadMessages: {
    type: Map,
    of: Number,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);