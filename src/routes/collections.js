const {
  createResource,
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
  _ = require('lodash'),
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

get('/:collectionId', authentication, async req => {
  const collection = await readOne('collections', `id=${req.params.collectionId}`);
  return normalizr.normalize(collection, collectionSchema);
})(router);

put('/:collectionId', authentication, async req => {
  const result = await update('collections', req.params.collectionId, { ...req.body });
  create('notifications', {
    publisher: result.id,
    activity: 'MODIFY_TOPIC',
    message: `${req.user.username} modified the topic '${result.name}'`,
    link: `/topics/${result.id}`,
    user_id: req.user.id,
  });
  return result;
})(router);

get('/:collectionId/exercises', authentication, async req => {
  const result = await read('exercises', `collection_id=${req.params.collectionId}`);
  return normalizr.normalize(result, [exerciseSchema]);
})(router);

get('/:collectionId/quiz', [authentication], async (req, res) => {
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
    authentication,
    bodyValidation(exercisesService.validExerciseSchema),
    authorization('CREATE_EXERCISE'),
  ],
  async req => {
    const collection = await readOne('collections', `id=${req.params.collectionId}`);
    const result = await create('exercises', {
      content: req.body,
      collection_id: req.params.collectionId,
    });
    await Promise.all([
      create('user_owns_resource', { user_id: req.user.id, resource_id: result.id }),
      create('subscriptions', { subscriber: result.id, publisher: result.id }),
      create('subscriptions', { subscriber: req.user.id, publisher: result.id }),
      create('subscriptions', { subscriber: collection.subject_id, publisher: result.id }),
      create('subscriptions', { subscriber: req.params.collectionId, publisher: result.id }),
      create('notifications', {
        publisher: result.id,
        activity: 'CREATE_EXERCISE',
        message: `${req.user.username} created an exercise '${req.body.question.text}'`,
        link: `/exercises/${result.id}`,
        user_id: req.user.id,
      }),
    ]);
    return result;
  }
)(router);

module.exports = router;
