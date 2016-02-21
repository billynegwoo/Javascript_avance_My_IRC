/**
 * Created by billynegwoo on 08/02/16.
 */
var app = require('express')();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var _ = require('underscore');
var consign = require('consign');
var morgan = require('morgan');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Room = require('./models/Room');
var User = require('./models/User');
var hash = require('password-hash');

// CORS Support
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Load the models and controllers.
consign().include('controllers')
    .then('routes')
    .into(app);

io.on('connection', function (socket) {

    socket.on('disconnect', function () {
        Room.find(function (err, rooms) {
            if (err)return console.log(err);
            for (var i = 0; i < rooms.length; i++) {
                rooms[i].users.splice(rooms[i].users.indexOf(socket.me), 1);
                rooms[i].save()
            }
        });
        User.findOne({
            username: socket.me
        }, function (err, user) {
            if (err)return console.log(err);
            if(user){
                user.socketId = 'disconnected';
                user.save();
            }
        });

    });
    socket.on('logout', function () {
        Room.find(function (err, rooms) {
            if (err)return console.log(err);
            for (var i = 0; i < rooms.length; i++) {
                rooms[i].users.splice(rooms[i].users.indexOf(socket.me), 1);
                rooms[i].save()
            }
        });
        User.findOne({
            username: socket.me
        }, function (err, user) {
            if (err)return console.log(err);
            if(user){
                user.socketId = 'disconnected';
                user.save();
            }
        });
    });
    var defaultRoom = 'default';
    // new user
    socket.on('new_user', function (data) {
        User.findOne({
            username: data.me
        }, function (err, user) {
            if (err)return console.log(err);
            user.socketId = socket.id;
            user.save();
        });

        socket.me = data.me;
        data.room = defaultRoom;

        // join the default room
        socket.join(defaultRoom);
        var room = Room.findOne({
            name: defaultRoom
        }, function (err, room) {
            if (room) {
                room.users.push(socket.me);
                room.lastUserConnection = new Date();
                room.save();
            } else {
                var newroom = new Room({
                    name: defaultRoom,
                    users: [socket.me],
                    creationDate: new Date(),
                    lastUserConnection: new Date()
                });
                newroom.save();
            }
        });
        // notify users in the room
        socket.emit('user_joined', data);
        socket.to(defaultRoom).emit('message', {
            message: data.me + 'System : join the room.',
            room: defaultRoom
        });
        socket.emit('message', {
            message: 'System : Welcome ' + data.me + ' you are in ' + defaultRoom + ' room.',
            room: defaultRoom
        });
    });

    //server receive a message
    socket.on('message', function (data) {
        // parse message to see if there is a command
        var match = data.message.match(/(\/\S+).?(\S+)?.?(.*)?$/);
        if (match && data.message.indexOf('/') == 0) {
            var parsed = {
                command: match[1],
                arg: match[2]
            };
            switch (parsed.command) {
                case '/nick':
                    if (parsed.arg == undefined) {
                        socket.emit('message', {
                            message: 'System : Please provide a username.',
                            room: data.room
                        })
                    } else {
                        User.findOne({
                            username: parsed.arg
                        }, function (err, user) {
                            if (err)return console.log(err);
                            if (!user) {
                                User.findOne({
                                    username: socket.me
                                }, function (err, user) {
                                    user.username = parsed.arg;
                                    user.save();
                                    socket.emit('user_switch', parsed.arg);
                                    socket.emit('message', {
                                        message: "System : Your username switch from " + socket.me + " to " + parsed.arg + ' .',
                                        room: data.room
                                    });
                                    socket.to(data.room).emit('message', {
                                        message: 'System : ' + socket.me + ' change his username for ' + parsed.arg + ' .',
                                        room: data.room
                                    });
                                    socket.me = parsed.arg
                                })
                            } else if (user) {
                                socket.emit('message', {
                                    message: 'System : ' + parsed.arg + " already in use",
                                    room: room
                                })
                            }
                        });
                    }
                    break;
                case '/list':
                    var message = 'System : Available rooms: ';
                    if (parsed.arg == undefined) {
                        Room.find(function (err, rooms) {
                            if (err)return console.log(err);
                            for (var i = 0; i < rooms.length; i++) {
                                message += rooms[i].name + ' ';
                                if (i == rooms.length - 1) {
                                    socket.emit('message', {
                                        message: message,
                                        room: data.room
                                    })
                                }
                            }
                        })
                    } else {
                        Room.find({
                            name: new RegExp(parsed.arg, "i")
                        }, function (err, rooms) {
                            if (err)return console.log(err);
                            if (rooms.length == 0) {
                                message = 'System : No results found.';
                                socket.emit('message', {
                                    message: message,
                                    room: data.room
                                })
                            }
                            for (var i = 0; i < rooms.length; i++) {
                                message += rooms[i].name + ' ';
                                if (i == rooms.length - 1) {
                                    socket.emit('message', {
                                        message: message,
                                        room: data.room
                                    })
                                }
                            }
                        })
                    }
                    break;
                case '/join':
                    if (parsed.arg == undefined) {
                        socket.emit('message', {
                            message: 'System : Please provide a room name.',
                            room: data.room
                        })
                    }
                    else if (parsed.arg == data.room) {
                        return socket.emit('message', {
                            message: 'System : You\'ve already join the ' + parsed.arg + ' room.',
                            room: data.room
                        })
                    } else {
                        Room.findOne({
                            name: parsed.arg
                        }, function (err, room) {
                            if (err)return console.log(err);
                            if (room) {
                                newroom = room.name;
                                room.lastUserConnection = new Date();
                                room.users.push(socket.me);
                                room.save()
                            } else {
                                var neoroom = new Room({
                                    name: parsed.arg,
                                    users: [socket.me],
                                    creationDate: new Date(),
                                    lastUserConnection: new Date()
                                });
                                neoroom.save();
                            }
                            socket.join(parsed.arg);
                            socket.emit('join', parsed.arg);
                            socket.to(parsed.arg).emit('message', {
                                message: 'System : ' + socket.me + ' join the room.',
                                room: parsed.arg
                            });
                            socket.emit('message', {
                                message: 'System : You\'ve join the room ' + parsed.arg + '.',
                                room: parsed.arg
                            })
                        });

                    }
                    break;
                case '/part':
                    if (data.room == 'default') {
                        return socket.emit('message', {
                            message: 'System : You cant leave the default room.',
                            room: data.room
                        })
                    }
                    socket.emit('leave_room', data.room);
                    socket.leave(data.room);
                    socket.broadcast.to(data.room).emit('message', {
                        message: 'System : ' + socket.me + ' leave the room.',
                        room: data.room
                    });
                    Room.findOne({
                        name: data.room
                    }, function (err, room) {
                        if (err)return console.log(err);
                        room.users.splice(room.users.indexOf(socket.me), 1);
                        room.save();
                    });
                    break;
                case '/users':
                    var message = 'System : Users in this room are ';
                    var room = Room.findOne({
                            name: data.room
                        }, function (err, room) {
                            if (room.users.length == 1) {
                                return socket.emit('message', {
                                    message: 'System : There\'s no users bro !',
                                    room: data.room
                                })
                            }
                            for (var i = 0; i < room.users.length; i++) {
                                if (room.users[i] != socket.me) {
                                    message += room.users[i] + ' ';
                                }
                                if (i == room.users.length - 1) {
                                    socket.emit('message', {
                                        message: message,
                                        room: data.room
                                    })
                                }
                            }
                        }
                    );
                    break;
                case '/msg':
                    if (parsed.arg == undefined) {
                        return socket.emit('message', {
                            message: 'System : Provide a username bro !',
                            room: data.room
                        })
                    } else if (match[3] == undefined) {
                        return socket.emit('message', {
                            message: 'System : Provide a message bro !',
                            room: data.room
                        })
                    } else {
                        User.findOne({
                            username: parsed.arg
                        }, function (err, user) {
                            if (err) return console.log(err);
                            if (!user) {
                                return socket.emit('message', {
                                    message: 'System : 404 User not found',
                                    room: data.room
                                })
                            } else if (user.socketId == 'disconnected') {
                                return socket.emit('message', {
                                    message: 'System : ' + user.username + '\'s not connected try later',
                                    room: data.room
                                })
                            } else {
                                return socket.broadcast.to(user.socketId).emit('message', {
                                    message: socket.me + ' whisper : ' + match[3],
                                    room: 'default'
                                });
                            }
                        })
                    }
                    break;
                case '/email':
                    if (parsed.arg == undefined) {
                        return socket.emit('message', {
                            message: 'System : Please provide an email dude !',
                            room: data.room
                        })
                    } else {
                        User.findOne({
                            username: socket.me
                        }, function (err, user) {
                            if (err)return console.log(err);
                            user.email = parsed.arg;
                            user.save()
                        })
                    }
                    break;
                case '/password':
                    if (parsed.arg == undefined) {
                        socket.emit('message', {
                            message: 'System : Please provide a password nigga !',
                            room: data.room
                        })
                    } else {
                        User.findOne({
                            username: socket.me
                        }, function (err, user) {
                            if (err)return console.log(err);
                            user.password = hash.generate(parsed.arg);
                            user.save()
                        })
                    }
                    break;
                default:
                    socket.emit('message', {
                        message: 'System : Try one of these /nick, /list, /join, /part, /users, /email, /password, BITCH!',
                        room: data.room
                    })

            }
        } else {
            //if there is no command send the message
            socket.broadcast.to(data.room).emit('message', {
                message: socket.me + " : " + data.message,
                room: data.room
            });
            socket.emit('message', {
                message: data.message,
                room: data.room
            })
        }
    })
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost/myirc');
mongoose.connection.once('open', function () {
    console.log('Listening on port 3000...');
    http.listen(3000);
});
