const { create, read, update, get, put, post, del } = require('../services/common.js');
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
  checkParams = require('../middleware/check-params'),
  commentSchema = new normalizr.schema.Entity('comments'),
  userService = require('../services/user-service');

router.get('/me', authentication(true), (req, res) =>
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

/*post(
  '/:resource/:id/comments',
  [
    authentication(true),
    (req, res, next) =>
      authorization(`COMMENT_${_.upperCase(_.initial(req.params.resource).join(''))}`)(
        req,
        res,
        next
      ),
  ],
  async req => {
    const comment = await db.one(sql.common.comment, {
      message: req.body.message,
      userId: req.user.id,
      resourceType: `${_.initial(req.params.resource).join('')}_id`,
      resource: req.params.id,
    });
    await db.one(sql.common.publish, {
      activity: `COMMENT_${_.upperCase(_.initial(req.params.resource).join(''))}`,
      publisherType: `${_.initial(req.params.resource).join('')}_id`,
      publisher: comment.exercise_id,
      userId: req.user.id,
    });
    await db.none(sql.common.subscribe, {
      publisherType: 'exercise_id',
      publisher: req.params.exerciseId,
      subscriberType: 'user_id',
      subscriber: req.user.id,
    });
    return comment;
  }
)(router);*/

/*get('/:resource/:id/comments', authentication(true), async req => {
  const result = await read(
    'comments',
    `resource_id=(select resources.id from resources join ${req.params.resource} on ${_.initial(req.params.resource).join('')}_id=${req.params.resource}.id where ${req.params.resource}.id=${req.params.id})`
  );
  return normalizr.normalize(result, [commentSchema]);
})(router);*/

router.delete(
  '/:resource/:id',
  [authentication(true), checkParams('resource', ['subjects', 'collections', 'exercises'])],
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

module.exports = router;
