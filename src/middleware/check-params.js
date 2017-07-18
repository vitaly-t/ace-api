const _ = require('lodash');

module.exports = (param, legal) => (req, res, next) => {
  if (_.includes(legal, req.params[param])) return next();
  res.status(404).send({ message: 'Illegal param' });
};
