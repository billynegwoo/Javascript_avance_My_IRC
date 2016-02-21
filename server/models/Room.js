/**
 * Created by billynegwoo on 18/02/16.
 */
var mongoose = require('mongoose');

// Create the RoomSchema.
var RoomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    users:Array,
    creationDate: {
        type: Date,
        required: true
    },
    lastUserConnection: {
        type:Date,
        required:true
    }
});

var Room = mongoose.model('Room', RoomSchema);

module.exports = Room;