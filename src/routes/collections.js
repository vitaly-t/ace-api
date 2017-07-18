const { create, read, update, get, put, post, del } = require('../services/common.js');
const express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  Ajv = require('ajv'),
  ajv = new Ajv(),
  normalizr = require('normalizr'),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
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

get('/:collectionId/quiz', [authentication(true)], async (req, res) => {
  const exercises = await db.any(sql.collections.quiz, {
    collectionId: req.params.collectionId,
    userId: req.user.id,
    size: parseInt(req.query.size) || 6,
  });
  return normalizr.normalize(exercises, [exerciseSchema]);
})(router);

router.post(
  '/:collectionId/exercises',
  [
    authentication(true),
    bodyValidation(exercisesService.validExerciseSchema),
    authorization('CREATE_EXERCISE'),
  ],
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
          .then(() => res.status(201).json())
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
