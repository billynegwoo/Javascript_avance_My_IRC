/**
 * Created by billynegwoo on 08/02/16.
 */
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    _ = require('lodash');

// Create the application
var app = express();

// Add middleware for a REST API
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

// CORS Support
app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next()
});

// Connect to Mongodb
mongoose.connect('mongodb://localhost/myirc');
mongoose.connection.once('open', function(){

    // Load the Models
    app.models = require('./models/index.js')

    // Load the Routes
    var routes = require('./routes');
    _.each(routes,function(controller, route){
        app.use(route, controller(app,route))
    });
    console.log('Listening on port 3000...');
    app.listen(3000)
});