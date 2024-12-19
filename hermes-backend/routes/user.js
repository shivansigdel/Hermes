const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const User = require('../models/User');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const userId = req.user._id;
    const ext = file.mimetype.split('/')[1];
    cb(null, `profile_${userId}.${ext}`);
  },
});

router.get('/me', verifyToken, async (req, res) => {
    try {
      console.log('req.user:', req.user);
  
      // Find the user by ID and exclude the password field
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        console.log('User not found in database.');
        return res.status(404).send('User not found');
      }
  
      res.json(user);
    } catch (err) {
      console.error('Error in /api/user/me:', err);
      res.status(500).send(err.message);
    }
  });


const upload = multer({ storage: storage });

// Profile picture upload route
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user._id;
    const filePath = req.file.path;

    // Update user's profilePicture field
    await User.findByIdAndUpdate(userId, { profilePicture: filePath });

    res.status(200).send('Profile picture uploaded successfully.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;