const {
  create,
  read,
  readOne,
  update,
  get,
  put,
  post,
  del,
  getNotifications,
} = require('../services/common.js');
const GRAPH_URL = 'https://graph.facebook.com',
  express = require('express'),
  router = express.Router(),
  db = require('db'),
  sql = require('../services/sql'),
  bodyValidation = require('body-validation'),
  morsommeNavn = require('morsomme-navn'),
  userService = require('../services/user-service'),
  authentication = require('../middleware/user-authentication'),
  _ = require('underscore'),
  superagent = require('superagent-as-promised')(require('superagent'));

const findValidUsername = username =>
  db
    .none('select * from users where username=${username}', { username })
    .then(() => username)
    .catch(err => findValidUsername(username + Math.floor(Math.random() * 10), callback));

get('/contribution', authentication, async (req, res) => {
  const result = await db.any(sql.users.contribution, { userId: req.user.id });
  return _.map(result, a => a.activity);
})(router);

get('/notifications', authentication, (req, res) =>
  getNotifications(req.user.id, req.user.id, req.user.id)
)(router);

put('/notifications', authentication, (req, res) =>
  db.one('update users set last_checked_notifications=now() where id=${userId} returning *', {
    userId: req.user.id,
  })
)(router);

post(
  '/anonymous',
  bodyValidation({
    required: ['deviceId'],
    properties: { deviceId: { type: 'string' } },
  }),
  async (req, res) => {
    const username = await findValidUsername(morsommeNavn.generate());
    return create('users', { username, device_id: req.body.deviceId });
  }
)(router);

router.post(
  '/facebook_connection',
  bodyValidation({
    required: ['deviceId', 'facebookToken', 'username'],
    properties: {
      deviceId: { type: 'string' },
      facebookToken: { type: 'string' },
      username: {
        type: 'string',
        minLength: 6,
        maxLength: 25,
      },
    },
  }),
  (req, res) =>
    superagent
      .get(`${GRAPH_URL}/me?access_token=${req.body.facebookToken}`)
      .then(res => JSON.parse(res.text).id)
      .then(facebookId =>
        db
          .none(sql.users.connectAnonToFace, {
            username: req.body.username,
            facebookId,
            deviceId: req.body.deviceId,
          })
          .then(() =>
            userService.getUser(facebookId, (err, user) => {
              if (err) return res.status(500).send({ message: 'This should never happen' });
              res.status(201).send(user);
            })
          )
          .catch(err => res.status(500).send())
      )
      .catch(err => res.status(400).send({ err }))
);

router.post(
  '/facebook',
  bodyValidation({
    required: ['facebookToken'],
    properties: { facebookToken: { type: 'string' } },
  }),
  (req, res) =>
    superagent
      .get(`${GRAPH_URL}/me?access_token=${req.body.facebookToken}`)
      .then(res => JSON.parse(res.text).id)
      .then(facebookId =>
        findValidUsername(morsommeNavn.generate())
          .then(username =>
            db.none(sql.users.create, { username, facebookId }).then(() => {
              userService.getUser(facebookId, (err, user) => {
                if (err) return res.status(500).send({ message: 'This should never happen' });
                res.status(201).send(user);
              });
            })
          )
          .catch(err => {
            console.log(err);
            res.status(500).send();
          })
      )
      .catch(err => {
        console.log(err);
        res.status(400).send({ err });
      })
);

module.exports = router;
