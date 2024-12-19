const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socket = require('./socket');
const userRoute = require('./routes/user');

// Import and use routes
const authRoute = require('./routes/auth');
const threadRoute = require('./routes/threads');

// Initialize socket.io
const io = socket.init(server);

dotenv.config();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middleware
app.use(express.json());


// Export io for use in other files


app.use('/api/user', userRoute);
app.use('/api/user', authRoute);
app.use('/api/threads', threadRoute);
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected...');
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });