const jwt = require('jsonwebtoken'),
  db = require('db'),
  _ = require('lodash'),
  sql = require('../services/sql');

const findUser = (userId, callback) =>
  db
    .one(sql.users.findOne, { id: userId.toString() })
    .then(user => {
      console.log(user);
      callback(null, user);
    })
    .catch(err => {
      console.log(err);
      callback(err);
    });

module.exports = willStop => (req, res, next) => {
  const token = req.headers['x-access-token'] || '';
  console.log('TOKEN', token);
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    console.log(err);
    if (err)
      return willStop ? res.status(401).send({ message: 'X-Access-Token is not valid' }) : next();
    console.log('Decoded', decoded);
    findUser(decoded.user.id, (err, user) => {
      if (err) return res.status(404).send({ message: 'Cannot find user' });
      console.log('USER', user);
      req.user = user;
      next();
    });
  });
};
