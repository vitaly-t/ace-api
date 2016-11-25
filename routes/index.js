const
    express = require('express'),
    router = express.Router(),
    subjectsDao = require('../dao/subjects'),
    batch = require('batch-request')({
        max: 100
    }),
    db = require('db'),
    sql = require('../services/sql'),
    uuid = require('uuid');

router.post('/batch', batch.validate, batch);

router.get('/anonymous', (req, res) => {
    res.send({uuid: uuid.v1()})
});

module.exports = router;