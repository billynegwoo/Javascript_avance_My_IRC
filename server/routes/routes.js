/**
 * Created by billynegwoo on 11/02/16.
 */
var express = require('express');
var jwt = require('jsonwebtoken');
module.exports = function(app) {
    var user = app.controllers.User;

    var apiRoutes = express.Router();

    apiRoutes.use(function(req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, "secret", function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
        // protected routes
        app.get('api/user/:id', user.get);
    });
    app.use('/api', apiRoutes);

    // public routes
    app.post('/auth/login', user.auth);
    app.post('/auth/register', user.new);
    return this;
};