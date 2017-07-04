const express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  Ajv = require('ajv'),
  ajv = new Ajv(),
  exerciseService = require('../services/exercises-service'),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  db = require('db'),
  sql = require('../services/sql'),
  normalizr = require('normalizr'),
  authorization = require('../middleware/authorization'),
  commentSchema = new normalizr.schema.Entity('comments');

router.get('/:exerciseId', (req, res) =>
  db
    .one(sql.exercises.findOne, { exerciseId: req.params.exerciseId })
    .then(exercise => res.status(200).send(exercise))
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    })
);

router.post(
  '/:exerciseId/reports',
  [
    bodyValidation({
      type: 'object',
      required: ['message'],
      properties: { message: { type: 'string' } },
    }),
  ],
  (req, res) => {
    req.body.exerciseId = req.params.exerciseId;
    db
      .one(sql.reports.insert, {
        exerciseId: req.params.exerciseId,
        userId: req.user.id,
        message: req.body.message,
      })
      .then(result => result.id)
      .then(insertedId => res.status(201).send({ insertedId }))
      .catch(err => {
        res.status(500).send({ err });
      });
  }
);

router.post(
  '/:exerciseId/answers',
  [
    authentication(true),
    bodyValidation({
      type: 'object',
      required: ['answer_status'],
      properties: { answer_status: { type: 'boolean' } },
    }),
  ],
  (req, res) =>
    db
      .none(sql.exercises.answer, {
        answerStatus: req.body.answer_status,
        userId: req.user.id,
        exerciseId: req.params.exerciseId,
      })
      .then(() => res.status(204).send())
      .catch(err => res.status(500).send({ err }))
);

router.put(
  '/:exerciseId',
  [authentication(true), bodyValidation(exerciseService.validExerciseSchema)],
  (req, res) =>
    db
      .none(sql.exercises.update, {
        id: req.params.exerciseId,
        userId: req.user.id,
        content: req.body,
      })
      .then(() =>
        db
          .none(sql.exercises.vote, {
            userId: req.user.id,
            exerciseId: req.params.exerciseId,
            positive: true,
          })
          .then(() => res.status(201).send())
          .catch(err => {
            console.log(err);
            res.status(500).send({ err });
          })
      )
      .catch(err => {
        console.log(err);
        res.status(500).send({ err });
      })
);

router.post(
  '/:exerciseId/votes',
  [
    authentication(true),
    bodyValidation({
      type: 'object',
      required: ['positive'],
      properties: { positive: { type: 'boolean' } },
    }),
  ],
  (req, res) =>
    db
      .none(sql.exercises.vote, {
        userId: req.user.id,
        exerciseId: req.params.exerciseId,
        positive: req.body.positive,
      })
      .then(() => res.status(201).send())
      .catch(err => {
        console.log(err);
        res.status(500).send({ err });
      })
);

router.post(
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
  (req, res) => {
    const comment = req.body;
    db
      .none(sql.comments.create, {
        userId: req.user.id,
        exerciseId: req.params.exerciseId,
        message: comment.message,
        pinned: comment.pinned || false,
      })
      .then(() => res.status(201).send({ reinforcement: req.reinforcement }))
      .catch(err => {
        console.log(err);
        res.status(500).send({ err });
      });
  }
);

router.get('/:exerciseId/comments', (req, res) => {
  db
    .any(sql.comments.find, { exerciseId: req.params.exerciseId })
    .then(comments => res.status(200).send(normalizr.normalize(comments, [commentSchema])))
    .catch(err => res.status(500).send({ err }));
});

module.exports = router;
