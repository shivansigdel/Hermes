// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    discriminator: { type: String, required: true },
    profilePicture: { type: String }, // URL or file path to the profile picture
});

module.exports = mongoose.model('User', userSchema);