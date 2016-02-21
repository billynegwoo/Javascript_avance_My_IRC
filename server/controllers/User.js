/**
 * Created by billynegwoo on 08/02/16.
 */
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var hash = require('password-hash');

module.exports = function (app) {

    this.getAll = function (req, res, next) {
        User.find(function (err, users) {
            if (err) return res.json(err);
            return res.json(users);
        });
    };

    this.new = function (req, res, next) {
        User.findOne({
            username: req.body.username
        }, function (err, data) {
            if (!data) {
                User.findOne({
                    email: req.body.email
                }, function (err, data) {
                    if (!data) {
                        var user = new User({
                            username: req.body.username,
                            password: hash.generate(req.body.password),
                            email: req.body.email
                        });
                        user.save(function (err, user) {
                            if (err) return res.json(err);
                            return res.json(user);
                        })
                    } else {
                        return res.json({success: false, message: "Email already in use."});
                    }
                });

            } else {
                return res.json({success: false, message: "Username already in use."});
            }
        });

    };
    this.get = function (req, res, next) {
        User.findById(req.params.id, function (err, user) {
            if (err) return res.json(err);
            return res.json(user);
        })
    };
    this.auth = function (req, res, next) {
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({success: false, message: "Authentication failed. User not found."})
            } else if (user) {
                if (hash.verify(req.body.password, user.password)) {
                    var token = jwt.sign(user, "secret", {
                        expiresIns: 86400
                    });
                    res.json({
                        success: true,
                        token: token,
                        user: user.username
                    })
                } else {
                    res.json({success: false, message: "Authentication failed. Wrong password."})
                }
            }
        })
    };
    return this
};

