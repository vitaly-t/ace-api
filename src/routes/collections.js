const {
  createResource,
  create,
  read,
  readOne,
  update,
  remove,
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
  const collection = await db.one(sql.collections.findById, {
    collectionId: req.params.collectionId,
  });
  return normalizr.normalize(collection, collectionSchema);
})(router);

put('/:collectionId', authentication, async req => {
  const result = await update('collections', req.params.collectionId, { ...req.body });
  create('notifications', {
    publisher: result.id,
    activity: 'MODIFY_TOPIC',
    message: `${req.user.username} endret temaet '${result.name}'`,
    link: `/topics/${result.id}`,
    user_id: req.user.id,
  });
  return result;
})(router);

get('/:collectionId/exercises', authentication, async req => {
  const result = await read('v_exercises', `collection_id=${req.params.collectionId}`);
  return normalizr.normalize(result, [exerciseSchema]);
})(router);

get('/:collectionId/quiz', [authentication], async (req, res) => {
  const exercises = await db.any(sql.collections.quiz, {
    collectionId: req.params.collectionId,
    userId: req.user.id,
    size: parseInt(req.query.size) || 6,
  });
  const processed = _.map(exercises, exercise => ({
    ...exercise,
    content: { ...exercise.content, alternatives: _.shuffle(exercise.content.alternatives) },
  }));
  return normalizr.normalize(processed, [exerciseSchema]);
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
      create('subscriptions', { subscriber: collection.subject_id, publisher: result.id }),
      create('subscriptions', { subscriber: req.params.collectionId, publisher: result.id }),
    ]);
    await create('notifications', {
      publisher: result.id,
      activity: 'CREATE_EXERCISE',
      message: `${req.user.username} lagde et spørsmål: '${req.body.question.text}'`,
      link: `/exercises/${result.id}`,
      user_id: req.user.id,
    });
    await create('subscriptions', { subscriber: req.user.id, publisher: result.id });
    return result;
  }
)(router);

del('/:collectionId', [authentication], async req => {
  const collection = await db.one(sql.collections.findById, {
    collectionId: req.params.collectionId,
  });
  if (collection.user_id === req.user.id) remove('resources', req.params.collectionId);
})(router);

post('/:id/comments', [authentication, authorization('COMMENT')], async req => {
  const collection = await db.one('select name from collections where id=$1', req.params.id);
  const result = await create('comments', {
    message: req.body.message,
    resource_id: req.params.id,
    user_id: req.user.id,
  });
  await Promise.all([
    create('subscriptions', { publisher: req.params.id, subscriber: req.user.id }),
    create('notifications', {
      publisher: req.params.id,
      activity: 'COMMENT',
      message: `${req.user.username} skrev en kommentar til temaet ${collection.name}`,
      link: `/courses/${req.params.id}`,
      user_id: req.user.id,
    }),
  ]);
  return result;
})(router);

module.exports = router;
