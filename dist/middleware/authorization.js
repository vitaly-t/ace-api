'use strict';

var _ = require('lodash');
var mung = require('express-mung');

module.exports = function (privilege) {
  return function (req, res, next) {
    var p = _.find(req.user.privileges, { name: privilege });
    if (p) {
      req.activity = { type: p.name, reinforcement: p.reinforcement };
      return next();
    }
    res.status(401).send({ message: 'You do not have privileges to perform this activity' });
  };
};