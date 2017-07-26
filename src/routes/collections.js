const {
  create,
  read,
  readOne,
  update,
  get,
  put,
  post,
  del,
  getNotifications,
} = require('../services/common.js');
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

get('/:collectionId', authentication(true), async req => {
  const collection = await readOne('collections', `id=${req.params.collectionId}`);
  return normalizr.normalize(collection, collectionSchema);
})(router);

get('/:collectionId/feed', authentication(true), req =>
  getNotifications('collection_id', req.params.collectionId)
)(router);

put('/:collectionId', authentication(true), (req, res) =>
  update('collections', req.params.collectionId, { ...req.body })
)(router);

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

post(
  '/:collectionId/exercises',
  [
    authentication(true),
    bodyValidation(exercisesService.validExerciseSchema),
    authorization('CREATE_EXERCISE'),
  ],
  async (req, res) => {
    const exercise = await create('exercises', {
      content: req.body,
      collection_id: req.params.collectionId,
      updated_by: req.user.id,
    });
    await Promise.all([
      create('votes', { user_id: req.user.id, exercise_id: exercise.id, positive: true }),
      db.one(sql.common.publish, {
        activity: 'CREATE_EXERCISE',
        publisherType: 'exercise_id',
        publisher: exercise.id,
        userId: req.user.id,
      }),
      db.none(sql.common.subscribe, {
        publisherType: 'exercise_id',
        publisher: exercise.id,
        subscriberType: 'user_id',
        subscriber: req.user.id,
      }),
    ]);
    return exercise;
  }
)(router);

module.exports = router;
