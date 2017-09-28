const { create, post } = require('../services/common.js');
const express = require('express'),
  router = express.Router(),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
  db = require('db'),
  sql = require('../services/sql');

post(
  '/:commentId/votes',
  [
    bodyValidation({
      type: 'object',
      required: ['positive'],
      properties: { positive: { type: 'boolean' } },
    }),
    authentication,
    authorization('VOTE_COMMENT'),
  ],
  (req, res) =>
    create('votes', {
      resource_id: req.params.commentId,
      user_id: req.user.id,
      positive: req.body.positive,
    })
)(router);

module.exports = router;
