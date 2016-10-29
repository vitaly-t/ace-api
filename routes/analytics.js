const
    express = require('express'),
    router = express.Router();

let db;

require('mongodb').MongoClient.connect(process.env.MONGODB_URI, (err, database) => {
    db = database;
});

router.post('/', (req, res) => {
    db.collection('documents').insertOne(req.body, (err) => {
        err ? res.status(500).send({err}) : res.status(204).send();
    })
});

module.exports = router;