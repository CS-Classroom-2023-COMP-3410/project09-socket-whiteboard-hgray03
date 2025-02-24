const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// In-memory board state – an array of drawing actions
let boardState = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send full board state to the new client
  socket.emit('init', boardState);

  socket.on('drawing', (data) => {
    boardState.push(data);
    io.emit('drawing', data);
  });

  // Listen for clear board event
  socket.on('clear', () => {
    boardState = [];
    // Notify all clients to clear their boards
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
