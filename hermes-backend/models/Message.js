// models/Message.js
const mongoose = require('mongoose');

// Will attempt to modify this in the future to allow for photos and other attachments
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);