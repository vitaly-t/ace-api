const express = require('express'),
  router = express.Router(),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  db = require('db'),
  _ = require('lodash'),
  sql = require('../services/sql');

router.post(
  '/',
  [
    authentication(true),
    bodyValidation({
      type: 'array',
      items: {
        type: 'object',
        required: ['exerciseId', 'isCorrect'],
        properties: {
          exerciseId: { type: 'integer' },
          isCorrect: { type: 'boolean' }
        }
      }
    })
  ],
  (req, res) =>
    db
      .tx(t =>
        t.batch(
          _.map(req.body, answer =>
            t.none(
              sql.answers.postAnswers,
              _.extend(answer, { userId: req.user.id })
            ))
        ))
      .then(data => res.status(201).send())
      .catch(err => res.status(500).send({ err }))
);

module.exports = router;
