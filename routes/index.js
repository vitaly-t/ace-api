const
    express = require('express'),
    router = express.Router(),
    subjectsDao = require('../dao/subjects');


router.get('/today', (req, res) => {
    subjectsDao.downloadsToday()
        .then(downloads => res.status(200).send({n: downloads}))
        .catch(err =>
            res.status(500).send({err})
        );
});

module.exports = router;