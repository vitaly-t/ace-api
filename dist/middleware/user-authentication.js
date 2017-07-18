'use strict';

var jwt = require('jsonwebtoken'),
    db = require('db'),
    _ = require('lodash'),
    sql = require('../services/sql');

var findUser = function findUser(userId, callback) {
  return db.one(sql.users.findOne, { id: userId.toString() }).then(function (user) {
    console.log(user);
    callback(null, user);
  }).catch(function (err) {
    console.log(err);
    callback(err);
  });
};

module.exports = function (willStop) {
  return function (req, res, next) {
    var token = req.headers['x-access-token'] || '';
    console.log('TOKEN', token);
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
      console.log(err);
      if (err) return willStop ? res.status(401).send({ message: 'X-Access-Token is not valid' }) : next();
      console.log('Decoded', decoded);
      findUser(decoded.user.id, function (err, user) {
        if (err) return res.status(404).send({ message: 'Cannot find user' });
        console.log('USER', user);
        req.user = user;
        next();
      });
    });
  };
};