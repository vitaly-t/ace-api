'use strict';

var express = require('express'),
    router = express.Router(),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication'),
    db = require('db'),
    _ = require('lodash'),
    sql = require('../services/sql');

router.post('/', [authentication(true), bodyValidation({
  type: 'array',
  items: {
    type: 'object',
    required: ['exerciseId', 'isCorrect'],
    properties: {
      exerciseId: { type: 'integer' },
      isCorrect: { type: 'boolean' }
    }
  }
})], function (req, res) {
  db.tx(function (t) {
    return t.batch(_.map(req.body, function (answer) {
      return t.none(sql.answers.postAnswers, _.extend(answer, { userId: req.user.id }));
    }));
  }).then(function (data) {
    return res.status(201).send();
  }).catch(function (err) {
    return res.status(500).send({ err: err });
  });
});

module.exports = router;