const { post, create } = require('../services/common.js');
const express = require('express'),
  router = express.Router(),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
  db = require('db'),
  _ = require('lodash'),
  sql = require('../services/sql');

post(
  '/',
  [
    authentication,
    authorization('FINISH_QUIZ'),
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
  async req => {
    await Promise.all(
      _.map(req.body, answer =>
        create('answers', {
          exercise_id: answer.exerciseId,
          user_id: req.user.id,
          status: answer.isCorrect,
        })
      )
    );
    create('notifications', {
      publisher: req.user.id,
      activity: 'FINISH_QUIZ',
      message: `Du fullførte en quiz!`,
      user_id: req.user.id,
    });
  }
)(router);

module.exports = router;
