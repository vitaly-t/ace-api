const {
  create,
  read,
  update,
  get,
  put,
  post,
  del,
  getNotifications,
} = require('../services/common.js');

const express = require('express'),
  router = express.Router(),
  db = require('db'),
  sql = require('../services/sql'),
  _ = require('lodash');
(authentication = require('../middleware/user-authentication')), (normalizr = require('normalizr')), (commentSchema = new normalizr
  .schema.Entity('comments'));

post('/:resourceId/votes', authentication, req =>
  create('votes', {
    user_id: req.user.id,
    resource_id: req.params.resourceId,
    positive: req.body.positive,
  })
)(router);

get('/:resourceId/feed', authentication, req =>
  getNotifications(req.params.resourceId, req.user.id)
)(router);

module.exports = router;
