const
    express = require('express'),
    router = express.Router(),
    subjectsDao = require('../dao/subjects'),
    batch = require('batch-request')(),
    uuid = require('uuid');

router.post('/batch', batch.validate, batch);

router.get('/today', (req, res) => {
    subjectsDao.downloadsToday()
        .then(downloads => res.status(200).send({n: downloads}))
        .catch(err =>
            res.status(500).send({err})
        );
});

router.get('/anonymous', (req, res) => {
    res.send({uuid: uuid.v1()})
});

module.exports = router;