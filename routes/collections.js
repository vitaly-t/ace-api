const
    express = require('express'),
    router = express.Router(),
    authentication = require('../middleware/user-authentication'),
    db = require('db'),
    sql = require('../services/sql');



router.get('/:collectionId/quiz', authentication(true), (req, res) => {
    db.any(sql.collections.quiz, {collectionId: req.params.collectionId, clientId: req.clientId})
        .then(exercises =>
            res.status(200).send(exercises))
        .catch(err =>
            res.status(500).send({err})
        );
});

module.exports = router;
