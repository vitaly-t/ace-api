const GRAPH_URL = 'https://graph.facebook.com',
  express = require('express'),
  router = express.Router(),
  superagent = require('superagent-as-promised')(require('superagent')),
  userService = require('../services/user-service');

router.get('/token', (req, res) => {
  const facebookToken = req.query.facebook_token;
  if (facebookToken) {
    return superagent
      .get(`${GRAPH_URL}/me?access_token=${facebookToken}`)
      .then(res => JSON.parse(res.text).id)
      .then(facebookId =>
        userService.getUser(facebookId, (err, user) => {
          if (err) return res.status(404).send({ message: 'User not found' });
          res.status(200).send(user);
        })
      )
      .catch(err => res.status(400).send({ err }));
  }
  userService.getUser(req.query.device_id, (err, user) => {
    if (err) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(user);
  });
});

module.exports = router;
