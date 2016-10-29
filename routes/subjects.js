const
    express = require('express'),
    router = express.Router(),
    assert = require('assert'),
    mixpanel = require('mixpanel').init('88c1f7835742091ce51bd106fef2638e'),
    crypto = require('crypto'),
    db = require('db'),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication'),
    subjectsDao = require('../dao/subjects');



router.get('/', authentication(false), (req, res) => {
    subjectsDao.findAll(req.clientId, (err, subjects) => {
        err ? res.status(500).send({err}) : res.status(200).send(subjects);
    });
});

router.get('/:subjectId', authentication(false), (req, res) => {
    subjectsDao.findById(req.params.subjectId, req.clientId, true, (err, subject) => {
        err ? res.status(404).send({err}) : res.status(200).send(subject);
    });
});

router.get('/:subjectId/:hash', authentication(false), (req, res) => {
    const
        subjectId = req.params.subjectId,
        hashed = crypto.createHash('md5').update(subjectId).digest('hex');
    if (hashed !== req.params.hash) return res.status(404).send();
    subjectsDao.findById(subjectId, req.clientId, false, (err, subject) => {
        err ? res.status(404).send({err}) : res.status(200).send(subject);
    });
});

router.put('/:subjectId', [authentication(true), bodyValidation({
    required: ['favorite'],
    properties: {subjectId: {type: 'boolean'}}
}), authentication(true)], (req, res)=> {
    const
        subjectId = req.params.subjectId,
        clientId = req.clientId,
        callback = err => {
            err ? res.status(500).send({err}) : res.status(204).send();
        };
    if(req.body.favorite) subjectsDao.addToFavorites(subjectId, clientId, callback);
    else subjectsDao.removeFromFavorites(subjectId, clientId, callback);
});


module.exports = router;