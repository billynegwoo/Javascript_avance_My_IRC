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
    }
});

// Export the model.
module.exports = mongoose.model('user', UserSchema);