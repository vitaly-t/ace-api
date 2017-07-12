import _ from 'lodash';
import { remove } from '../services/common.js';
const GRAPH_URL = 'https://graph.facebook.com',
  express = require('express'),
  router = express.Router(),
  superagent = require('superagent-as-promised')(require('superagent')),
  db = require('db'),
  sql = require('../services/sql'),
  authentication = require('../middleware/user-authentication'),
  checkParams = require('../middleware/check-params'),
  userService = require('../services/user-service');

router.get('/me', authentication(true), (req, res) =>
  userService.getUser(req.user.id.toString(), (err, user) => {
    if (err) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(user);
  })
);
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

router.delete(
  '/:resource/:id',
  [authentication(true), checkParams('resource', ['subjects', 'collections'])],
  async (req, res) => {
    try {
      const result = await remove(req.params.resource, req.params.id);
      res.status(204).send(result);
    } catch (err) {
      console.log(err);
      res.status(500).send({ err });
    }
  }
);

router.post('/:resource', authentication(true), async (req, res) => {
  try {
    const entity = req.body;
    const result = await db.one(
      `INSERT INTO \${table~} (${_.keys(entity)}) VALUES (${_.map(_.keys(entity), key => `\${${key}}`)}) RETURNING *`,
      {
        table: req.params.resource,
        ...entity,
      }
    );
    res.status(201).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
});

/*router.put('/:resource/:id', async (req, res) => {
  try {
    const entity = req.body;
    const result = await db.one(
      `update \${table~} set ${_.map(_.keys(entity), key => `${key}=\${${key}}`)} where id=\${id} RETURNING *`,
      {
        table: req.params.resource,
        ...entity,
        id: req.params.id,
      }
    );
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
});*/

module.exports = router;
