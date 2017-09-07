const {
  commentResource,
  create,
  read,
  update,
  get,
  put,
  post,
  del,
} = require('../services/common.js');
const _ = require('lodash');
const { remove } = require('../services/common.js');
const { getUserByFacebookOrDevice } = require('../services/user-service.js');

const GRAPH_URL = 'https://graph.facebook.com',
  express = require('express'),
  router = express.Router(),
  superagent = require('superagent-as-promised')(require('superagent')),
  db = require('db'),
  sql = require('../services/sql'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
  normalizr = require('normalizr'),
  commentSchema = new normalizr.schema.Entity('comments'),
  userService = require('../services/user-service');

router.get('/me', authentication, (req, res) =>
  userService.getUser(req.user.id.toString(), (err, user) => {
    if (err) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(user);
  })
);
get('/token', [], async (req, res) => {
  const facebookToken = req.query.facebook_token;
  let facebookId;
  if (facebookToken) {
    const response = await superagent.get(`${GRAPH_URL}/me?access_token=${facebookToken}`);
    facebookId = JSON.parse(response.text).id;
  }
  return await getUserByFacebookOrDevice(req.query.device_id || facebookId);
})(router);

get('/levels', [], () => db.any(sql.common.levels))(router);

get('/:whatever/:resourceId/comments', authentication, async (req, res) => {
  const result = await db.any(sql.common.readComments, { resourceId: req.params.resourceId });
  return normalizr.normalize(result, [commentSchema]);
})(router);

module.exports = router;
