const { create, read, readOne, update, get, put, post, del } = require('../services/common.js');
const express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  exerciseService = require('../services/exercises-service'),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  db = require('db'),
  sql = require('../services/sql'),
  normalizr = require('normalizr'),
  authorization = require('../middleware/authorization'),
  exerciseSchema = new normalizr.schema.Entity('exercises'),
  commentSchema = new normalizr.schema.Entity('comments');

get('/:exerciseId', [], async (req, res) => {
  const result = await readOne('v_exercises', `id=${req.params.exerciseId}`);
  return normalizr.normalize(result, exerciseSchema);
})(router);

put('/:exerciseId/', authentication, async req => {
  const result = await update('exercises', req.params.exerciseId, { content: req.body });
  await create('notifications', {
    publisher: result.id,
    activity: 'MODIFY_EXERCISE',
    message: `${req.user.username} modified the exercise '${result.content.question.text}'`,
    link: `/exercises/${result.id}`,
    user_id: req.user.id,
  });
  return result;
})(router);

post('/:exerciseId/comments', authentication, async req => {
  const exercise = await readOne('exercises', `id=${req.params.exerciseId}`);
  const result = await create('comments', {
    message: req.body.message,
    resource_id: req.params.exerciseId,
    user_id: req.user.id,
  });
  await create('notifications', {
    publisher: req.params.exerciseId,
    activity: `COMMENT_EXERCISE`,
    message: `${req.user.username} commented on the exercise '${exercise.content.question.text}'`,
    link: `/exercises/${exercise.id}`,
    user_id: req.user.id,
  });
  return result;
})(router);

post(
  '/:exerciseId/answers',
  [
    authentication,
    bodyValidation({
      required: ['answer_status'],
      properties: { answer_status: { type: 'boolean' } },
    }),
  ],
  (req, res) =>
    create('answers', {
      status: req.body.answer_status,
      user_id: req.user.id,
      exercise_id: req.params.exerciseId,
    })
)(router);

module.exports = router;
