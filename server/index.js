/**
 * Created by billynegwoo on 08/02/16.
 */
var express     = require('express');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');
var _           = require('underscore');
var consign     = require('consign');
var morgan      = require('morgan');

// Create the application.
var app = express();

// CORS Support
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));





// Load the models and controllers.
consign().include('controllers')
    .then('routes')
    .into(app);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/myirc');
mongoose.connection.once('open', function () {
    console.log('Listening on port 3000...');
    app.listen(3000);
});

