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
  normalizr = require('normalizr'),
  _ = require('lodash'),
  db = require('db'),
  sql = require('../services/sql'),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
  exerciseSchema = new normalizr.schema.Entity('exercises'),
  collectionSchema = new normalizr.schema.Entity('topics'),
  commentSchema = new normalizr.schema.Entity('comments'),
  subjectSchema = new normalizr.schema.Entity('courses', {
    topics: [collectionSchema],
  });

get('/:subjectId/quiz', [authentication], async req => {
  const exercises = await db.any(sql.subjects.quiz, {
    userId: req.user.id,
    subjectId: req.params.subjectId,
    size: req.query.size || 6,
  });
  const processed = _.map(exercises, exercise => ({
    ...exercise,
    content: { ...exercise.content, alternatives: _.shuffle(exercise.content.alternatives) },
  }));
  return normalizr.normalize(processed, [exerciseSchema]);
})(router);

router.put('/:subjectId/order', (req, res) => {
  db
    .tx(t =>
      t.batch(
        _.map(req.body.order, (collectionId, index) =>
          t.none(
            'update collections set position=${index} where id=${collectionId} and subject_id=${subjectId}',
            { index, collectionId, subjectId: req.params.subjectId }
          )
        )
      )
    )
    .then(() => res.status(204).send())
    .catch(err => {
      console.log(err);
      res.status(500).send({ err, message: 'Could not position collections' });
    });
});

post('/', [authentication, authorization('CREATE_COURSE')], async req => {
  const result = await create('subjects', req.body);
  await Promise.all([
    create('subscriptions', { subscriber: result.id, publisher: result.id }),
    create('user_owns_resource', { user_id: req.user.id, resource_id: result.id }),
    create('favorites', { subject_id: result.id, user_id: req.user.id }),
  ]);
  await create('notifications', {
    publisher: result.id,
    activity: 'CREATE_COURSE',
    message: `${req.user.username} lagde et emne '${_.truncate(req.body.name, 20)}'`,
    link: `/courses/${result.id}`,
    user_id: req.user.id,
  });
  await create('subscriptions', { subscriber: req.user.id, publisher: result.id });
  return result;
})(router);

del('/:subjectId', [authentication], async req => {
  const subject = await db.one(sql.subjects.findById, {
    subjectId: req.params.subjectId,
    userId: req.user.id,
  });
  if (subject.user_id === req.user.id) remove('resources', req.params.subjectId);
})(router);

post('/:subjectId/collections', [authentication, authorization('CREATE_TOPIC')], async req => {
  const result = await create('collections', { ...req.body, subject_id: req.params.subjectId });
  await Promise.all([
    create('subscriptions', { subscriber: result.id, publisher: result.id }),
    create('subscriptions', { subscriber: req.params.subjectId, publisher: result.id }),
    create('user_owns_resource', { user_id: req.user.id, resource_id: result.id }),
  ]);
  create('notifications', {
    publisher: result.id,
    activity: 'CREATE_TOPIC',
    message: `${req.user.username} lagde et tema '${_.truncate(req.body.name, 20)}'`,
    link: `/topics/${result.id}`,
    user_id: req.user.id,
  });
  await create('subscriptions', { subscriber: req.user.id, publisher: result.id });
  return result;
})(router);

get('/', [authentication], async req => {
  const result = await db.any(sql.subjects.findAll, {
    userId: req.user.id,
    search: req.query.search || '',
  });
  console.log(result);
  return normalizr.normalize(result, [subjectSchema]);
})(router);

get('/:subjectId', authentication, async (req, res) => {
  const result = await db.one(sql.subjects.findById, {
    subjectId: req.params.subjectId,
    userId: req.user.id,
  });
  return normalizr.normalize(result, subjectSchema);
})(router);

get('/:subjectId/collections', authentication, async (req, res) => {
  const result = await db.any(sql.subjects.findCollections, {
    userId: req.user.id,
    subjectId: req.params.subjectId,
  });
  return normalizr.normalize(result, [collectionSchema]);
})(router);

router.post(
  '/favorites',
  [
    authentication,
    bodyValidation({
      required: ['favorite', 'subjectId'],
      properties: { favorite: { type: 'boolean' }, subjectId: { type: 'number' } },
    }),
  ],
  (req, res) => {
    const subjectId = req.body.subjectId,
      userId = req.user.id,
      onError = err => res.status(500).send({ err }),
      onSuccess = () => res.status(204).send();
    if (req.body.favorite)
      db.none(sql.subjects.addToFavorites, { userId, subjectId }).then(onSuccess).catch(onError);
    else
      db
        .none(sql.subjects.removeFromFavorites, { userId, subjectId })
        .then(onSuccess)
        .catch(onError);
  }
);

put('/:subjectId', authentication, async req => {
  const subject = await update('subjects', req.params.subjectId, req.body);
  create('notifications', {
    publisher: req.params.subjectId,
    activity: 'MODIFY_COURSE',
    message: `${req.user.username} endret emnet '${subject.name}'`,
    link: `/courses/${subject.id}`,
    user_id: req.user.id,
  });
  return subject;
})(router);

post('/:id/comments', [authentication, authorization('COMMENT_COURSE')], async req => {
  const subject = await db.one('select name from subjects where id=$1', req.params.id);
  const result = await create('comments', {
    message: req.body.message,
    resource_id: req.params.id,
    user_id: req.user.id,
  });
  await Promise.all([
    create('subscriptions', { publisher: req.params.id, subscriber: req.user.id }),
    create('notifications', {
      publisher: req.params.id,
      activity: 'COMMENT_COURSE',
      message: `${req.user.username} skrev en kommentar til emnet ${subject.name}`,
      link: `/courses/${req.params.id}`,
      user_id: req.user.id,
    }),
  ]);
  return result;
})(router);

module.exports = router;
