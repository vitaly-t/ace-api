const jwt = require('jsonwebtoken');
const { readOne } = require('../services/common.js');

module.exports = (req, res, next) => {
  try {
    jwt.verify(req.headers['x-access-token'], process.env.SECRET, async (err, decoded) => {
      if (err) return res.status(401).send({ message: 'X-Access-Token is not valid' });
      try {
        const user = await readOne('v_users', `id=${decoded.user.id}`);
        console.log(user.username);
        req.user = user;
        next();
      } catch (err) {
        res.status(401).send({ message: 'Cannot find user' });
      }
    });
  } catch (err) {
    res.status(500).send();
  }
};
