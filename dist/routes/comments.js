'use strict';

var express = require('express'),
    router = express.Router(),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication'),
    authorization = require('../middleware/authorization'),
    db = require('db'),
    sql = require('../services/sql');

router.post('/:commentId/votes', [authentication(true), bodyValidation({
  type: 'object',
  required: ['positive'],
  properties: { positive: { type: 'boolean' } }
}), authorization('VOTE_COMMENT')], function (req, res) {
  return db.none(sql.comments.vote, {
    userId: req.user.id,
    commentId: req.params.commentId,
    positive: req.body.positive
  }).then(function () {
    return res.status(201).json();
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

module.exports = router;