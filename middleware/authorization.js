const _ = require('lodash');

module.exports = privilege => (req, res, next) =>
  (_.includes(req.user.privileges, privilege)
    ? next()
    : res.status(401).send({ message: 'You do not have privileges to perform this activity' }));
