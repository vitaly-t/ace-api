const {
  create,
  read,
  readOne,
  update,
  remove,
  get,
  put,
  post,
  del,
} = require('../services/common.js');
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

post('/:exerciseId/comments', [authentication, authorization('COMMENT_EXERCISE')], async req => {
  const exercise = await readOne('exercises', `id=${req.params.exerciseId}`);
  const result = await create('comments', {
    message: req.body.message,
    resource_id: req.params.exerciseId,
    user_id: req.user.id,
  });
  await Promise.all([
    create('subscriptions', { publisher: exercise.id, subscriber: req.user.id }),
    create('notifications', {
      publisher: req.params.exerciseId,
      activity: `COMMENT_EXERCISE`,
      message: `${req.user.username} commented on the exercise '${exercise.content.question.text}'`,
      link: `/exercises/${exercise.id}`,
      user_id: req.user.id,
    }),
  ]);
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

post('/:exerciseId/votes', [authentication, authorization('VOTE_EXERCISE')], async req => {
  const exercise = await db.one(`select * from v_exercises where id=${req.params.exerciseId}`);
  await create('votes', {
    user_id: req.user.id,
    resource_id: exercise.id,
    positive: req.body.positive,
  });
  const result = await readOne('v_resource_vote_count', `resource_id=${exercise.id}`);
  await create('notifications', {
    publisher: exercise.id,
    activity: 'VOTE_EXERCISE',
    message: `Someone ${req.body.positive ? 'upvoted' : 'downvoted'} exercise: '${exercise.content.question.text}'`,
    link: `/exercises/${exercise.id}`,
    user_id: exercise.user_id,
  });
  if (result.votes >= 1 && !exercise.is_approved) {
    await update('exercises', exercise.id, { is_approved: true });
    await create('notifications', {
      publisher: exercise.id,
      activity: 'APPROVE_EXERCISE',
      message: `Exercise got approved: '${exercise.content.question.text}'`,
      link: `/exercises/${exercise.id}`,
      user_id: exercise.user_id,
    });
  } else if (result.votes <= -4) await delete ('exercises', `id=${exercise.id}`);
})(router);

del('/:exerciseId', [authentication], async req => {
  const exercise = await readOne('v_exercises', `id=${req.params.exerciseId}`);
  if (exercise.user_id === req.user.id) remove('resources', req.params.exerciseId);
})(router);

module.exports = router;
