/**
 * Created by billynegwoo on 08/02/16.
 */
var mongoose = require('mongoose');

// Create Movie Schema
var movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

// Export movie Schema
module.exports = movieSchema;