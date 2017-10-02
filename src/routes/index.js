const {
  commentResource,
  create,
  read,
  readOne,
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
  jwt = require('jsonwebtoken'),
  superagent = require('superagent-as-promised')(require('superagent')),
  db = require('db'),
  sql = require('../services/sql'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
  normalizr = require('normalizr'),
  commentSchema = new normalizr.schema.Entity('comments'),
  userService = require('../services/user-service');

get('/me', authentication, async req => {
  const user = await readOne('v_users', `id=${req.user.id}`);
  const token = jwt.sign({ user }, process.env.SECRET, { expiresIn: '30 days' });
  return { user, token };
})(router);

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

get('/:whatever/:resourceId/comments', authentication, req =>
  db.any(sql.common.readComments, {
    resourceId: req.params.resourceId,
    userId: req.user.id,
  })
)(router);

post('/notifications/:notificationId/seen', authentication, req =>
  create('user_has_seen_notification', {
    user_id: req.user.id,
    notification_id: req.params.notificationId,
  })
)(router);

module.exports = router;
