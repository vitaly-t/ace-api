const
    express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    Ajv = require('ajv'),
    ajv = new Ajv(),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication'),
    db = require('db'),
    quizService = require('../services/quiz-service'),
    exercisesService = require('../services/exercises-service'),
    sql = require('../services/sql');


router.get('/:collectionId/exercises', (req, res) => {
    db.any(sql.collections.findExercises, {collectionId: req.params.collectionId})
        .then(exercises =>
            _.map(exercises, exercise => exercisesService.process(exercise, req.query.max_alts || 4)))
        .then(exercises => res.status(200).send(exercises))
        .catch(err =>
            res.status(500).send({err}));
});

router.get('/:collectionId/quiz', authentication(true), (req, res) => {
    db.any(sql.collections.quiz, {
        collectionId: req.params.collectionId,
        userId: req.user.id
    })
        .then(exercises =>
            quizService.create(req.params.collectionId, exercises, parseInt(req.query.size) || 6, parseInt(req.query.max_alts) || 4))
        .then(exercises => res.status(200).send(exercises))
        .catch(err =>
            res.status(500).send({err}));
});

router.post('/:collectionId/exercises', [authentication(true), bodyValidation(exercisesService.validExerciseSchema)], (req, res) => {
    const content = req.body;
    const exercise = {content};
    exercise.isFeasible = ajv.validate(exercisesService.feasibleExerciseSchema, content);
    exercise.collectionId = req.params.collectionId;
    exercise.userId = req.user.id;
    db.any(sql.collections.insertExercise, exercise)
        .then(() =>
            res.status(201).send({}))
        .catch(err =>
            res.status(500).send({err})
        );
});

module.exports = router;