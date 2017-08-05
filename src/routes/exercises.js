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

post(
  '/:exerciseId/reports',
  [
    authentication(true),
    bodyValidation({ required: ['message'], properties: { message: { type: 'string' } } }),
  ],
  (req, res) =>
    create(
      'reports',
      Object.assign({}, { exercise_id: req.params.exerciseId, user_id: req.user.id }, req.body)
    )
)(router);

post(
  '/:exerciseId/answers',
  [
    authentication(true),
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

put(
  '/:exerciseId',
  [authentication(true), bodyValidation(exerciseService.validExerciseSchema)],
  async (req, res) => {
    const exercise = await update('exercises', req.params.exerciseId, {
      updated_by: req.user.id,
      content: req.body,
    });
    await db.one(sql.common.publish, {
      activity: 'EDIT_EXERCISE',
      publisherType: 'exercise_id',
      publisher: req.params.exerciseId,
      userId: req.user.id,
    });
    await db.none(sql.common.subscribe, {
      publisherType: 'exercise_id',
      publisher: req.params.exerciseId,
      subscriberType: 'user_id',
      subscriber: req.user.id,
    });
    return exercise;
  }
)(router);

post(
  '/:exerciseId/votes',
  [
    authentication(true),
    bodyValidation({ required: ['positive'], properties: { positive: { type: 'boolean' } } }),
    authorization('VOTE_EXERCISE'),
  ],
  (req, res) =>
    create(
      'votes',
      Object.assign(
        {},
        {
          user_id: req.user.id,
          exercise_id: req.params.exerciseId,
        },
        req.body
      )
    )
)(router);

post(
  '/:exerciseId/comments',
  [
    authentication(true),
    bodyValidation({
      type: 'object',
      required: ['message'],
      properties: { message: { type: 'string' } },
    }),
    authorization('COMMENT_EXERCISE'),
  ],
  async (req, res) => {
    const comment = await db.one(sql.common.comment, {
      message: req.body.message,
      userId: req.user.id,
      resourceType: 'exercise_id',
      resource: req.params.exerciseId,
    });
    await db.one(sql.common.publish, {
      activity: 'COMMENT_COURSE',
      publisherType: 'exercise_id',
      publisher: req.params.exerciseId,
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
)(router);
/*post(
  '/:exerciseId/comments',
  [
    authentication(true),
    bodyValidation({
      type: 'object',
      required: ['message'],
      properties: { message: { type: 'string' } },
    }),
    authorization('COMMENT'),
  ],
  async (req, res) => {
    const comment = await create('comments', {
      user_id: req.user.id,
      exercise_id: req.params.exerciseId,
      ...req.body,
    });
    await db.one(sql.common.publish, {
      activity: 'COMMENT_EXERCISE',
      publisherType: 'exercise_id',
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

get('/:exerciseId/comments', [authentication(true)], async (req, res) => {
  const result = await db.any(sql.comments.find, {
    userId: req.user.id,
    exerciseId: req.params.exerciseId,
  });
  return normalizr.normalize(result, [commentSchema]);
})(router);

module.exports = router;
