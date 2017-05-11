const express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  assert = require('assert'),
  db = require('db'),
  sql = require('../services/sql'),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication');

router.post('/', authentication(true), (req, res) =>
  db
    .one(
      "insert into subjects (code, name, published, color) values (${code}, ${name}, 'yes', ${color}) returning id",
      req.body
    )
    .then(row => res.status(201).send(row))
    .catch(err => res.status(500).send({ err }))
);

router.post('/:subjectId/collections', authentication(true), (req, res) =>
  db
    .one(
      'insert into collections (name, subject_id) values (${name},${subjectId}) returning id',
      {
        name: req.body.name,
        subjectId: req.params.subjectId,
      }
    )
    .then(row => res.status(201).send(row))
    .catch(err => res.status(500).send({ err }))
);

router.get('/:subjectId/ranking', (req, res) => {
  db
    .any(sql.subjects.ranking, { subjectId: req.params.subjectId })
    .then(rankings => res.status(200).send(rankings))
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    });
});

router.get('/', authentication(true), (req, res) =>
  db
    .any(sql.subjects.findAll, { userId: req.user.id })
    .then(subjects =>
      res
        .status(200)
        .send(subjects.filter(subject => req.web || !subject.web_only))
    )
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    })
);

router.get('/default', authentication(false), (req, res) =>
  res.redirect(`/subjects/${process.env.DEFAULT_SUBJECT_ID}`)
);

router.get('/:subjectId', authentication(true), (req, res) =>
  db
    .one(sql.subjects.findById, {
      subjectId: req.params.subjectId,
      userId: req.user.id,
    })
    .then(subject =>
      db
        .any(sql.subjects.findCollections, {
          userId: req.user.id,
          subjectId: req.params.subjectId,
        })
        .then(collections =>
          res.status(200).send(
            _.extend(subject, {
              collections,
            })
          )
        )
        .catch(err =>
          res.status(500).send({ message: 'Could not fetch collections', err })
        )
    )
    .catch(err => {
      console.log(process.env.DATABASE_URL);
      console.log(err);
      res.status(500).send({ message: 'Could not fetch subject', err });
    })
);

router.get('/:subjectId/quiz', authentication(true), (req, res) =>
  db
    .any(sql.subjects.findPopularCollections, {
      subjectId: req.params.subjectId,
      count: 3,
    })
    .then(collections =>
      res.redirect(
        `/collections/${_.sample(collections).id}/quiz?type=daily&size=4`
      )
    )
    .catch(err => res.status(500).send({ err }))
);

router.get('/:subjectId/collections', authentication(true), (req, res) =>
  db
    .any(sql.subjects.findCollections, {
      userId: req.user.id,
      subjectId: req.params.subjectId,
    })
    .then(collections => res.status(200).send(collections))
    .catch(err => res.status(500).send({ err }))
);

router.put(
  '/:subjectId',
  [
    authentication(true),
    bodyValidation({
      required: ['favorite'],
      properties: { subjectId: { type: 'boolean' } },
    }),
    authentication(true),
  ],
  (req, res) => {
    const subjectId = req.params.subjectId,
      userId = req.user.id,
      onError = err => res.status(500).send({ err }),
      onSuccess = () => res.status(204).send();
    if (req.body.favorite)
      db
        .none(sql.subjects.addToFavorites, { userId, subjectId })
        .then(onSuccess)
        .catch(onError);
    else
      db
        .none(sql.subjects.removeFromFavorites, { userId, subjectId })
        .then(onSuccess)
        .catch(onError);
  }
);

module.exports = router;
