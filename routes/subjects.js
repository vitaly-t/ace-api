const
    express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    assert = require('assert'),
    db = require('db'),
    exerciseService = require('../services/exercises-service'),
    sql = require('../services/sql'),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication');

router.get('/', authentication(false), (req, res) =>
    db.any(sql.subjects.findAll, {userId: req.user.id})
        .then(subjects =>
            res.status(200).send(subjects.filter(subject => req.web || !subject.web_only)))
        .catch(err =>
            res.status(500).send({err}))
);

router.get('/:subjectId', authentication(false), (req, res) =>
    db.one(sql.subjects.findById, {subjectId: req.params.subjectId, userId: req.user.id, forceShow: false})
        .then(subject =>
            _.extend(subject, {collections: `/subjects/${req.params.subjectId}/collections`}))
        .then(subject =>
            res.status(200).send(subject))
        .catch(err =>
            res.status(500).send({err}))
);

router.get('/:subjectId/quiz', authentication(true), (req, res) =>
    db.any(sql.subjects.quiz, {
        quizLength: req.query.length || 6,
        subjectId: req.params.subjectId,
        userId: req.user.id
    })
        .then(exercises => _.map(exercises, exercise => exerciseService.process(exercise, parseInt(req.query.max_alts) || 4)))
        .then(exercises => res.status(200).send(exercises))
        .catch(err =>
            res.status(500).send({err}))
);

router.get('/:subjectId/collections', authentication(true), (req, res) =>
    db.any(sql.subjects.findCollections, {userId: req.user.id, subjectId: req.params.subjectId})
        .then(collections =>
            res.status(200).send(collections))
        .catch(err =>
            res.status(500).send({err})));

router.put('/:subjectId', [authentication(true), bodyValidation({
    required: ['favorite'],
    properties: {subjectId: {type: 'boolean'}}
}), authentication(true)], (req, res) => {
    const
        subjectId = req.params.subjectId,
        userId = req.user.id,
        onError = err =>
            res.status(500).send({err}),
        onSuccess = () =>
            res.status(204).send();
    if (req.body.favorite)
        db.none(sql.subjects.addToFavorites, {userId, subjectId}).then(onSuccess).catch(onError);
    else
        db.none(sql.subjects.removeFromFavorites, {userId, subjectId}).then(onSuccess).catch(onError);
});


module.exports = router;