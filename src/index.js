const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { getUser, addUser, removeUser, getUsersInRoom } = require('./utils/users');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);
const path = require('path');
const { createMessage, createLocationMessage }= require('./utils/messages');

const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback ) => {
        const { error, user } = addUser({ id: socket.id, room, username });
        
        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('sendMessage', createMessage('admin','Welcome!'));
        socket.broadcast.to(user.room).emit('sendMessage',createMessage(`${user.username} has joined!`));
        io.to(user.room).emit('userData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (text, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);

        if (filter.isProfane(text)) {
            return callback('Profanity is not allowed.')
        }

        io.to(user.room).emit('sendMessage', createMessage(user.username,text));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('sendMessage', createMessage('admin',`${user.username} has left the chat.`));
            io.to(user.room).emit('userData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    });

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', createLocationMessage(user.username,`https://www.google.com/maps?q=${location.lat},${location.lon}`));
        callback();
    });

});

server.listen(port, () => { //port
    console.log(`Server is running on port ${port}`);
});