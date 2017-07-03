const express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  Ajv = require('ajv'),
  ajv = new Ajv(),
  normalizr = require('normalizr'),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  db = require('db'),
  quizService = require('../services/quiz-service'),
  exercisesService = require('../services/exercises-service'),
  sql = require('../services/sql'),
  exerciseSchema = new normalizr.schema.Entity('exercises'),
  collectionSchema = new normalizr.schema.Entity('topics', { exercises: [exerciseSchema] });

router.get('/:collectionId/exercises', (req, res) => {
  db
    .any(sql.collections.findExercises, {
      collectionId: req.params.collectionId,
    })
    .then(exercises => res.status(200).send(normalizr.normalize(exercises, [exerciseSchema])))
    .catch(err => res.status(500).send({ err }));
});

router.get('/:collectionId/quiz', authentication(true), (req, res) =>
  db
    .any(sql.collections.quiz, {
      collectionId: req.params.collectionId,
      userId: req.user.id,
      isDaily: req.query.type === 'daily',
    })
    .then(exercises =>
      quizService.create(
        exercises,
        parseInt(req.query.size) || 6,
        parseInt(req.query.max_alts) || 3
      )
    )
    .then(exercises => res.status(200).send(normalizr.normalize(exercises, [exerciseSchema])))
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    })
);

router.post(
  '/:collectionId/exercises',
  [authentication(true), bodyValidation(exercisesService.validExerciseSchema)],
  (req, res) => {
    const content = req.body;
    const exercise = { content };
    exercise.isFeasible = ajv.validate(exercisesService.feasibleExerciseSchema, content);
    exercise.collectionId = req.params.collectionId;
    exercise.userId = req.user.id;
    db
      .one(sql.collections.insertExercise, exercise)
      .then(exercise =>
        db
          .none(sql.exercises.vote, {
            userId: req.user.id,
            exerciseId: exercise.id,
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
      });
  }
);

module.exports = router;
