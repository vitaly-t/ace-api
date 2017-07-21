const { create, read, readOne, update, get, put, post, del } = require('../services/common.js');
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

router.get('/:subjectId/feed', authentication(true), (req, res) =>
  db
    .any(sql.subjects.feed, { subjectId: req.params.subjectId })
    .then(feed => res.status(200).send(_.map(feed, a => a.activity)))
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    })
);

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

post('/:subjectId/collections', authentication(true), (req, res) =>
  create('collections', { ...req.body, subject_id: req.params.subjectId, user_id: req.user.id })
)(router);

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

module.exports = router;
