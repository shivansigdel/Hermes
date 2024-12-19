// socket.js
const socketIo = require('socket.io');
let io;

function init(server) {
  io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket'],
  });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a thread room
  socket.on('join_thread', (threadId) => {
    socket.join(threadId);
    console.log(`Socket ${socket.id} joined thread ${threadId}`);
  });

  // Leave a thread room
  socket.on('leave_thread', (threadId) => {
    socket.leave(threadId);
    console.log(`Socket ${socket.id} left thread ${threadId}`);
  });

  // Join user's personal room
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room user_${userId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = {
  init,
  getIo,
};