const
    express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    assert = require('assert'),
    mixpanel = require('mixpanel').init('88c1f7835742091ce51bd106fef2638e'),
    crypto = require('crypto'),
    db = require('db'),
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
    db.one(sql.subjects.findById, {subjectId:req.params.subjectId, userId: req.user.id, forceShow: false })
        .then(subject =>
            _.extend(subject, {collections: `/subjects/${req.params.subjectId}/collections`}))
        .then(subject =>
            res.status(200).send(subject))
        .catch(err =>
            res.status(500).send({err}))
);

router.get('/:subjectId/collections', (req, res) => {
    db.any(sql.subjects.findCollections, {subjectId: req.params.subjectId})
        .then(collections =>
            res.status(200).send(collections))
        .catch(err =>
            res.status(500).send({err}));
});

router.get('/:subjectId/:hash', authentication(false), (req, res) => {
    const
        subjectId = req.params.subjectId,
        hashed = crypto.createHash('md5').update(subjectId).digest('hex');
    if (hashed !== req.params.hash) return res.status(404).send();
    db.one(sql.subjects.findById, {subjectId:req.params.subjectId, userId: req.user.id, forceShow: true })
        .then(subject => res.status(200).send(subject))
        .catch(err => res.status(500).send({err}));
});

router.put('/:subjectId', [authentication(true), bodyValidation({
    required: ['favorite'],
    properties: {subjectId: {type: 'boolean'}}
}), authentication(true)], (req, res)=> {
    const
        subjectId = req.params.subjectId,
        userId = req.user.id,
        onError = err =>
            res.status(500).send({err}),
        onSuccess = () =>
            res.status(204).send();
    if(req.body.favorite)
        db.none(sql.subjects.addToFavorites, {userId, subjectId}).then(onSuccess).catch(onError);
    else
        db.none(sql.subjects.removeFromFavorites, {userId, subjectId}).then(onSuccess).catch(onError);
});


module.exports = router;