// routes/threads.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Thread = require('../models/Thread');
const Message = require('../models/Message');
const User = require('../models/User');
const socket = require('../socket');

// Get all threads for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const threads = await Thread.find({
      participants: req.user._id,
    })
      .populate('participants', 'username discriminator profilePicture email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(threads);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get messages for a specific thread
router.get('/:threadId/messages', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ thread: req.params.threadId })
      .populate('sender', 'email username discriminator profilePicture')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Send a message in a thread
router.post('/:threadId/messages', verifyToken, async (req, res) => {
  try {
    const threadId = req.params.threadId;
    const senderId = req.user._id;
    const { content } = req.body;

    // Create and save the message
    const message = new Message({
      thread: threadId,
      sender: senderId,
      content: content,
    });
    const savedMessage = await message.save();

    // Populate sender information
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'username discriminator profilePicture')
      .populate('thread');
    
    const thread = await Thread.findById(threadId);

    // Update the thread's last message timestamp
    await Thread.findByIdAndUpdate(threadId, { updatedAt: Date.now() });


    thread.participants.forEach((participantId) => {
      if (participantId.toString() !== senderId.toString()) {
        // Increment unread count for other participants
        const currentCount = thread.unreadMessages.get(participantId.toString()) || 0;
        thread.unreadMessages.set(participantId.toString(), currentCount + 1);
      }
    });

    // Save the thread
    await thread.save();

    // Get the io instance
    const io = socket.getIo();

    // Emit the message to all clients in the thread room
    io.to(threadId).emit('receive_message', populatedMessage);

    // Also emit to individual participants
    populatedMessage.thread.participants.forEach((participantId) => {
      io.to(`user_${participantId}`).emit('receive_message_global', populatedMessage);
    });

    // Send the populated message as the response
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).send('Server error while sending message.');
  }
});

// Reset unread messages for a thread
router.post('/:threadId/reset-unread', verifyToken, async (req, res) => {
  try {
    const threadId = req.params.threadId;
    const userId = req.user._id;

    const thread = await Thread.findById(threadId);

    if (!thread) {
      return res.status(404).send('Thread not found.');
    }

    thread.unreadMessages.set(userId.toString(), 0);
    await thread.save();

    res.status(200).send('Unread messages reset.');
  } catch (err) {
    console.error('Error resetting unread messages:', err);
    res.status(500).send('Server error while resetting unread messages.');
  }
});


// Create a new group thread
router.post('/create-group', verifyToken, async (req, res) => {
  try {
    const { groupName, participants } = req.body;

    if (!groupName || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).send('Group name and participants are required.', groupName, participants);
    }

    // Find participants by email or username#discriminator
    const participantUsers = await User.find({
      $or: [
        { email: { $in: participants } },
        { $expr: { $in: [{ $concat: ['$username', '#', '$discriminator'] }, participants] } },
      ],
    });

    // Include the current user
    participantUsers.push(req.user);

    // Remove duplicates
    const uniqueParticipants = [...new Set(participantUsers.map((user) => user._id))];

    // Create the group thread
    const thread = new Thread({
      participants: uniqueParticipants,
      isGroupChat: true,
      groupName: groupName.trim(),
    });

    const savedThread = await thread.save();

    // Populate participants
    const populatedThread = await Thread.findById(savedThread._id)
      .populate('participants', 'username discriminator profilePicture email')
      .populate('lastMessage');

    res.status(201).json(populatedThread);
  } catch (err) {
    console.error('Error creating group thread:', err);
    res.status(500).send(err.message);
  }
});
  
// Create a new direct message thread
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { participantIdentifier } = req.body;

    if (!participantIdentifier) {
      return res.status(400).send('Participant identifier is required');
    }

    let participant;

    // Check if identifier is an email
    if (participantIdentifier.includes('@')) {
      participant = await User.findOne({ email: participantIdentifier });
    } else if (participantIdentifier.includes('#')) {
      // Split username and discriminator
      const [username, discriminator] = participantIdentifier.split('#');
      participant = await User.findOne({ username, discriminator });
    } else {
      return res.status(400).send('Invalid participant identifier');
    }

    if (!participant) {
      return res.status(404).send('User not found');
    }

    // Prevent users from messaging themselves
    if (participant._id.toString() === req.user._id) {
      return res.status(400).send('You cannot message yourself');
    }

    // Check if a thread already exists between these users
    let thread = await Thread.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, participant._id], $size: 2 },
    });

    if (thread) {
      return res.status(200).json(thread);
    }

    // Create a new thread
    thread = new Thread({
      participants: [req.user._id, participant._id],
      isGroupChat: false,
    });

    const savedThread = await thread.save();

    // Populate participants for the response
    const populatedThread = await Thread.findById(savedThread._id).populate('participants', 'email username discriminator profilePicture');

    res.status(201).json(populatedThread);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;