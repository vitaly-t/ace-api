'use strict';

var _ = require('lodash');

module.exports = function (param, legal) {
  return function (req, res, next) {
    if (_.includes(legal, req.params[param])) return next();
    res.status(404).send({ message: 'Illegal param' });
  };
};