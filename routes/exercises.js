const
    express = require('express'),
    router = express.Router(),

    exercisesDao = require('../dao/exercises'),
    reportsDao = require('../dao/reports'),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication');

router.post('/:exerciseId/reports', [bodyValidation({
    type: 'object',
    required: ['message', 'device'],
    properties: {
        message: {type: 'string'},
        device: {type: 'string'},
        email: {type: 'string'}
    }
})], (req, res) => {
    reportsDao.send(req.params.exerciseId, req.body)
        .then((insertedId) => res.status(201).send({insertedId}))
        .catch(err => res.status(500).send({err}));
});

router.put('/:exerciseId', authentication(true), (req, res) => {
    const exercise = req.body;
    exercisesDao.answer(req.params.exerciseId, req.clientId, exercise.correct)
        .then(() => res.status(204).send())
        .catch(err => res.status(500).send({err}));
});

module.exports = router;