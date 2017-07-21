const jwt = require('jsonwebtoken'),
  db = require('db'),
  _ = require('lodash'),
  sql = require('../services/sql');

const findUser = (userId, callback) =>
  db
    .one(sql.users.findOne, { id: userId.toString() })
    .then(user => callback(null, user))
    .catch(err => {
      console.log(err);
      callback(err);
    });

module.exports = willStop => (req, res, next) => {
  const token = req.headers['x-access-token'] || '';
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err)
      return willStop ? res.status(401).send({ message: 'X-Access-Token is not valid' }) : next();
    findUser(decoded.user.id, (err, user) => {
      if (err) return res.status(404).send({ message: 'Cannot find user' });
      req.user = user;
      next();
    });
  });
};
