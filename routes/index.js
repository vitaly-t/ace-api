const
    express = require('express'),
    router = express.Router(),
    subjectsDao = require('../dao/subjects'),
    batch = require('batch-request')(),
    db = require('db'),
    sql = require('../services/sql'),
    uuid = require('uuid');

router.post('/batch', batch.validate, batch);

router.get('/statistics', (req, res) => {
    db.any(sql.statistics, {nHours: parseInt(req.query.n) || 12})
        .then(result =>
            res.status(200).send(result))
        .catch(err =>
            res.status(500).send({err}));
});

router.get('/anonymous', (req, res) => {
    res.send({uuid: uuid.v1()})
});

module.exports = router;