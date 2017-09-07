const { post, create } = require('../services/common.js');
const express = require('express'),
  router = express.Router(),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  db = require('db'),
  _ = require('lodash'),
  sql = require('../services/sql');

post(
  '/',
  [
    authentication,
    bodyValidation({
      type: 'array',
      items: {
        type: 'object',
        required: ['exerciseId', 'isCorrect'],
        properties: {
          exerciseId: { type: 'integer' },
          isCorrect: { type: 'boolean' },
        },
      },
    }),
  ],
  req =>
    Promise.all(
      _.map(req.body, answer =>
        create('answers', {
          exercise_id: answer.exerciseId,
          user_id: req.user.id,
          status: answer.isCorrect,
        })
      )
    )
)(router);

module.exports = router;
