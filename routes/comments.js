const express = require('express'),
  router = express.Router(),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
  db = require('db'),
  sql = require('../services/sql');

router.post(
  '/:commentId/votes',
  [
    authentication(true),
    bodyValidation({
      type: 'object',
      required: ['positive'],
      properties: { positive: { type: 'boolean' } },
    }),
    authorization('VOTE_COMMENT'),
  ],
  (req, res) =>
    db
      .none(sql.comments.vote, {
        userId: req.user.id,
        commentId: req.params.commentId,
        positive: req.body.positive,
      })
      .then(() => res.status(201).send())
      .catch(err => {
        console.log(err);
        res.status(500).send({ err });
      })
);

module.exports = router;
