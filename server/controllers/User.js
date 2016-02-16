/**
 * Created by billynegwoo on 08/02/16.
 */
var User    = require('../models/User');
var jwt     = require('jsonwebtoken');
var hash    = require('password-hash');

module.exports = function (app) {

    this.getAll = function (req, res, next) {
        User.find(function (err, users) {
            if (err) return res.json(err);
            return res.json(users);
        });
    };

    this.new = function (req, res, next) {
        var user = new User({
            username: req.body.username,
            password: hash.generate(req.body.password)
        });
        user.save(function (err, user) {
            if (err) return res.json(err);
            return res.json(user);
        })
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
                if (hash.verify( req.body.password,user.password)) {
                    var token = jwt.sign(user, "secret" , {
                        expiresIns: 86400
                    });
                    res.json({
                        success: true,
                        token: token
                    })
                }else{
                    res.json({success: false, message: "Authentication failed. Wrong password."})
                }
            }
        })
    };
    return this
};

