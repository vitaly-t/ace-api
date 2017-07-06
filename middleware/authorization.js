const _ = require('lodash');
const mung = require('express-mung');

module.exports = privilege => (req, res, next) => {
  const p = _.find(req.user.privileges, { name: privilege });
  console.log(p);
  p
    ? mung.json(body => ({ type: p.name, reinforcement: p.reinforcement }))(req, res, next)
    : res.status(401).send({ message: 'You do not have privileges to perform this activity' });
};
