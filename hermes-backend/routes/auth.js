const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const joi = require('joi'); // joi is used for data validation (prevents SQL injection)

// Validation schema
const schema = joi.object({
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required()
});


// Registration route
router.post('/register', async (req, res) => {
    try {
      const { email, password, username } = req.body;
  
      // Validate required fields
      if (!email || !password || !username) {
        return res.status(400).send('Email, password, and username are required.');
      }
  
      // Check if email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).send('Email already registered.');
      }
  
      // Generate discriminator
      let discriminator = '0001';
      const usersWithUsername = await User.find({ username });
      if (usersWithUsername.length > 0) {
        // Generate a unique 4-digit discriminator
        const discriminators = usersWithUsername.map(u => parseInt(u.discriminator));
        let newDiscriminator = 1;
        while (discriminators.includes(newDiscriminator)) {
          newDiscriminator++;
        }
        discriminator = newDiscriminator.toString().padStart(4, '0');
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      const user = new User({
        email,
        password: hashedPassword,
        username,
        discriminator,
      });
  
      const savedUser = await user.save();
      res.status(201).send('User registered successfully.');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

// Login route
router.post('/login', async (req, res) => {
    try {
        // Check if the user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send('Email not found');

        // Validate the password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('Invalid password');

        const expiresIn = req.body.rememberMe ? '30d' : '1h';

        // Create and assign a token
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: expiresIn,
          });
      
          // Send the token and userId in the response
            // Return token and user data
            res.header('auth-token', token).send({
                token: token,
                user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                discriminator: user.discriminator,
                },
            });
        } catch (err) {
          res.status(400).send(err);
        }
});

module.exports = router;