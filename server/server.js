const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {Users} = require('./utils/users');
const {isRealString} = require('./utils/validation');
const {generateMessage, generateLocationMessage} = require('./utils/message')
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection',(socket) => {
  console.log('New user connected!');

  //  socket.emit('newMessage', generateMessage('admin', 'Welcome to the chat app'));
   //
  //  socket.broadcast.emit('newMessage',
  //   generateMessage('Admin', 'New user joined'));

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage',
        generateMessage('Admin', `${user.name} has left.`));
    }
  });

  socket.on('join', (params, callback) => {
    if (isRealString(params.name) && isRealString(params.room)) {
      socket.join(params.room);

      users.removeUser(socket.id);
      users.addUser(socket.id, params.name, params.room);
      io.to(params.room).emit('updateUserList', users.getUserList(params.room));
      console.log(users.getUserList(params.room));
      socket.emit('newMessage',
        generateMessage('Admin', 'Welcome to the chat app'));
      socket.broadcast.to(params.room).emit('newMessage',
         generateMessage('Admin', `${params.name} has joined.`));
      callback();
    } else {
      return callback('Name and room name are required.');
    }
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage',
        generateMessage(user.name, message.text));
    }
    callback('This is from server');
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit('newLocationMessage',
        generateLocationMessage(user.name,coords.latitude, coords.longitude));
    }
  });


});


server.listen(port, () => {
  console.log(`Server is on ${port}`);
});
