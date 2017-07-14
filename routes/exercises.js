import { create, read, update, get, put, post, del } from '../services/common.js';
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
  const result = await read('v_exercises', `id=${req.params.exerciseId}`);
  console.log(result);
  return normalizr.normalize(result[0], exerciseSchema);
})(router);

post(
  '/:exerciseId/reports',
  [
    authentication(true),
    bodyValidation({ required: ['message'], properties: { message: { type: 'string' } } }),
  ],
  (req, res) =>
    create('reports', {
      exercise_id: req.params.exerciseId,
      user_id: req.user.id,
      ...req.body,
    })
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
  (req, res) =>
    update('exercises', req.params.exerciseId, {
      updated_by: req.user.id,
      content: req.body,
    })
)(router);

post(
  '/:exerciseId/votes',
  [
    authentication(true),
    bodyValidation({ required: ['positive'], properties: { positive: { type: 'boolean' } } }),
    authorization('VOTE_EXERCISE'),
  ],
  (req, res) =>
    create('votes', {
      user_id: req.user.id,
      exercise_id: req.params.exerciseId,
      ...req.body,
    })
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
    authorization('COMMENT'),
  ],
  (req, res) =>
    create('comments', {
      ...req.body,
      user_id: req.user.id,
      exercise_id: req.params.exerciseId,
    })
)(router);

get('/:exerciseId/comments', [authentication(true)], async (req, res) => {
  const result = await db.any(sql.comments.find, {
    userId: req.user.id,
    exerciseId: req.params.exerciseId,
  });
  return normalizr.normalize(result, [commentSchema]);
})(router);

module.exports = router;
