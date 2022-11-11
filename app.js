var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var nicknames = {};

server.listen(process.env.PORT || 3000);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    socket.on('sendMessage', function(data){
        io.sockets.emit('newMessage', {msg: data, nick: socket.nickname});
    });
    socket.on('newUser', function(data, callback){
        if(data in nicknames){
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            nicknames[socket.nickname] = 1;
            updateNicknames();
        }
    });

    socket.on('disconnect', function(data){
        if(!socket.nickname)
            return;
        delete nicknames[socket.nickname];
        updateNicknames();
    });

    function updateNicknames(){
        io.sockets.emit('usernames', nicknames);
    }

});