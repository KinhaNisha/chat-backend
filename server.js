const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://127.0.0.1:5500, *",
    methods: ["GET", "POST"]
  }
});
const users = {};

// Serve static files
app.use(express.static('../index.html'));

io.on('connection', socket => {

    // Listen for new user joined event
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        console.log(`${name} connected`);
        socket.broadcast.emit('user-joined', name);
    });

    // Listen for send message event
    socket.on('send-message', message => {
        socket.broadcast.emit('receive-message', { name: users[socket.id], message: message });
    });

    // Listen for disconnect event
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-left', {name: users[socket.id], message: "leaves the chat"});
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
