const express = require('express');
const path = require('path');
const morgan = require('morgan');
const PORT = 3000;
const app = express();

app.use(morgan('dev'));
app.use(express.json());

const messages = [
  'This is a test message'
];

// serve up the files in the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Standard HTTP API for getting the messages
app.get('/api/messages', (req, res, next) => {
  res.json(messages);
});

// And sending a new one.
app.post('/api/messages', (req, res, next) => {
  const { message } = req.body;
  messages.push(message);
  res.json(message);
});

// Any other URL just returns the react index.html
app.use('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'public/index.html'));
}); 

// We need the return value from app.listen, which is the httpServer
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// We require the socket.io library and call it with the server
const io = require('socket.io')(server);

// Anytime someone connects this callback happens.
io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  // Anytime we get a message over this socket and it's 'new-message'
  // we do a broadcast emit, which sends it to all OTHER connected sockets.
  socket.on('new-message', message => {
    socket.broadcast.emit('message-from-others', message);
  });

})

