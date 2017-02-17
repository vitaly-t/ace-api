const
    express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    authentication = require('../middleware/user-authentication'),
    db = require('db'),
    exerciseService = require('../services/exercises-service'),
    sql = require('../services/sql');



router.get('/:collectionId/quiz', authentication(true), (req, res) => {
    db.any(sql.collections.quiz, {collectionId: req.params.collectionId, userId: req.user.id, quizLength: 6})
        .then(exercises => _.map(exercises, exercise => exerciseService.process(exercise)))
        .then(exercises => res.status(200).send(exercises))
        .catch(err =>
            res.status(500).send({err}));
});

router.post('/:collectionId/exercises', authentication(true), (req, res) => {
    req.body.collectionId = req.params.collectionId;
    req.body.userId = req.user.id;
    db.any(sql.collections.insertExercise, req.body)
        .then(() =>
            res.status(201).send({}))
        .catch(err =>
            res.status(500).send({err})
        );
});

module.exports = router;
