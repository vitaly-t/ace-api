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
  normalizr = require('normalizr'),
  _ = require('lodash'),
  assert = require('assert'),
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

get('/:subjectId/exercises', authentication(true), async (req, res) => {
  const result = await read(
    'v_exercises',
    `subject_id=${req.params.subjectId} and updated_by=${req.user.id}`
  );
  return normalizr.normalize(result, [exerciseSchema]);
})(router);

get('/:subjectId/feed', authentication(true), req =>
  getNotifications('subject_id', req.params.subjectId)
)(router);

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

post('/', authentication(true), async (req, res) => {
  const subject = await create('subjects', { ...req.body, published: 'yes', user_id: req.user.id });
  await create('favorites', { user_id: req.user.id, subject_id: subject.id });
  return subject;
})(router);

post('/:subjectId/collections', authentication(true), async (req, res) => {
  const collection = await create('collections', {
    ...req.body,
    subject_id: req.params.subjectId,
    user_id: req.user.id,
  });
  await Promise.all([
    db.one(sql.common.publish, {
      activity: 'CREATE_TOPIC',
      publisher: collection.id,
      userId: req.user.id,
    }),
    db.none(sql.common.subscribe, {
      publisher: collection.id,
      subscriber: req.user.id,
    }),
  ]);
  return collection;
})(router);

router.get('/:subjectId/ranking', (req, res) => {
  db
    .any(sql.subjects.ranking, { subjectId: req.params.subjectId })
    .then(rankings => res.status(200).send(rankings))
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    });
});

router.get('/', [authentication(true)], (req, res) =>
  db
    .any(sql.subjects.findAll, {
      userId: req.user.id,
      search: req.query.search || '',
    })
    .then(subjects => res.status(200).send(normalizr.normalize(subjects, [subjectSchema])))
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    })
);

router.get('/default', authentication(false), (req, res) =>
  res.redirect(`/subjects/${process.env.DEFAULT_SUBJECT_ID}`)
);

get('/:subjectId', authentication(true), async (req, res) => {
  const result = await db.one(sql.subjects.findById, {
    subjectId: req.params.subjectId,
    userId: req.user.id,
  });
  return normalizr.normalize(result, subjectSchema);
})(router);

router.get('/:subjectId/quiz', authentication(true), (req, res) =>
  db
    .any(sql.subjects.findPopularCollections, {
      subjectId: req.params.subjectId,
      count: 3,
    })
    .then(collections =>
      res.redirect(`/collections/${_.sample(collections).id}/quiz?type=daily&size=4`)
    )
    .catch(err => res.status(500).send({ err }))
);

get('/:subjectId/collections', authentication(true), async (req, res) => {
  const result = await db.any(sql.subjects.findCollections, {
    userId: req.user.id,
    subjectId: req.params.subjectId,
  });
  return normalizr.normalize(result, [collectionSchema]);
})(router);

router.post(
  '/favorites',
  [
    authentication(true),
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

put('/:subjectId', [], req => update('subjects', req.params.subjectId, req.body))(router);

post(
  '/:subjectId/comments',
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
    const comment = await db.one(sql.common.comment, {
      message: req.body.message,
      userId: req.user.id,
      resourceType: 'subject_id',
      resource: req.params.subjectId,
    });
    await db.one(sql.common.publish, {
      activity: 'COMMENT_COURSE',
      publisherType: 'subject_id',
      publisher: req.params.subjectId,
      userId: req.user.id,
    });
    await db.none(sql.common.subscribe, {
      publisherType: 'subject_id',
      publisher: req.params.subjectId,
      subscriberType: 'user_id',
      subscriber: req.user.id,
    });
    return comment;
  }
)(router);

get('/:subjectId/comments', [authentication(true)], async (req, res) => {
  console.log(
    `resource_id=(select resources.id from resources join subjects on subject_id=subjects.id where subjects.id=${req.params.subjectId})`
  );
  const result = await read(
    'comments',
    `resource_id=(select resources.id from resources join subjects on subject_id=subjects.id where subjects.id=${req.params.subjectId})`
  );
  return normalizr.normalize(result, [commentSchema]);
})(router);

module.exports = router;
