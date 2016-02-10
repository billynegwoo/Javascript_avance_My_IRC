/**
 * Created by billynegwoo on 08/02/16.
 */

module.exports = function(app, route) {

    app.post('/user', function(req,res){

       var user = new app.models.user();

        user.username = req.body.username;

        user.password = req.body.password;

        res.json(user);
    });

    return function(req, res, next) {
        next();
    };
};

