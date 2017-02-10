const
    express = require('express'),
    router = express.Router(),

    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication'),
    db = require('db'),
    sql = require('../services/sql');

router.get('/:exerciseId', (req, res) => {
    db.one(sql.exercises.findOne, {exerciseId: req.params.exerciseId})
        .then(exercise => res.status(200).send(exercise))
        .catch(err => {
            res.status(500).send({err})
        });
});

router.post('/:exerciseId/reports', [bodyValidation({
    type: 'object',
    required: ['message', 'device'],
    properties: {
        message: {type: 'string'},
        device: {type: 'string'},
        email: {type: 'string'}
    }
})], (req, res) => {
    const report = req.body;
    db.one(sql.reports.insert, {
        exerciseId: req.params.exerciseId,
        message: report.message,
        device: report.device,
        email: report.email
    })
        .then(result => result.id)
        .then((insertedId) => res.status(201).send({insertedId}))
        .catch(err => {
            res.status(500).send({err})
        });
});

router.put('/:exerciseId', authentication(true), (req, res) => {
    const exercise = req.body;
    db.none(sql.exercises.answer, {
        answerStatus: exercise.answer_status,
        userId: req.user.id,
        exerciseId: req.params.exerciseId
    })
        .then(() => res.status(204).send())
        .catch(err => {
            res.status(500).send({err})
        });
});

router.post('/:exerciseId/comments', authentication(true), (req, res) => {
    const comment = req.body;
    db.none(sql.comments.create, {userId: req.user.id, exerciseId: req.params.exerciseId, message: comment.message})
        .then(() => res.status(204).send())
        .catch(err =>
            res.status(500).send({err}));
});

router.get('/:exerciseId/comments', (req, res) => {
    db.any(sql.comments.find, {exerciseId: req.params.exerciseId})
        .then((comments) =>
            res.status(200).send(comments))
        .catch(err =>
            res.status(500).send({err}));
});

module.exports = router;