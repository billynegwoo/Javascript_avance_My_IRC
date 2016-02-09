/**
 * Created by billynegwoo on 08/02/16.
 */
var restful = require('node-restful');

//Setup the Controller for REST
module.exports = function(app,route){

    var rest = restful.model(
        'movie',
        app.models.movie
    ).methods(['get', 'put' , 'post', 'delete']);

    //Register this endpoint with the application
    rest.register(app,route);

    // Return the middleware
    return function (req,res,next){
        next();
    };

};

