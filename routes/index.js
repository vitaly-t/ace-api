const
    express = require('express'),
    router = express.Router(),
    subjectsDao = require('../dao/subjects'),
    uuid = require('uuid');


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