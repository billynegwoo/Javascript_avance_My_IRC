/**
 * Created by billynegwoo on 08/02/16.
 */
var mongoose = require('mongoose');

// Create the MovieSchema.
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin:Boolean
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
