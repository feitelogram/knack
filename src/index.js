const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, getUser, removeUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));


io.on('connection', (socket) => {
  console.log('New Web Socket Connection!');

  socket.on('sent', (toBeSent, cb)=> {
    const user = getUser(socket.id)
    const filter = new Filter();
    if (filter.isProfane(toBeSent)) {
      return cb('Profanity is not allowed.');
    }
    io.to(user.room).emit('message', generateMessage(toBeSent, user.username));
    cb();
  });

  socket.on('join', (options, cb) => {
    const {id} = socket;
    const {error, user} = addUser({id, ...options});
    if (error) return cb(error);
    socket.join(user.room);
    socket.emit('message', generateMessage('Welcome to (k)Nack!'));
    const hello = `${user.username} has joined!`;
    socket.broadcast.to(user.room).emit('message', generateMessage(hello));
    const { room } = user 
    io.to(room).emit("roomData", {
        room,
        users: getUsersInRoom(room)
    })
    cb();
  });

  socket.on('sendLocation', (locationData, cb) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(locationData, user.username));
    cb('Location delivered');
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      const { room, username } = user
      const bai = `${username} has left.`;
      io.to(room).emit('message', generateMessage(bai));
      io.to(room).emit('roomData', {
        room,
        users: getUsersInRoom(room)
      })
    }
  });
});


server.listen(port, () => console.log(`App listening on port ${port}!`));

