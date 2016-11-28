const
    GRAPH_URL = 'https://graph.facebook.com',
    express = require('express'),
    router = express.Router(),
    batch = require('batch-request')({
        max: 100
    }),
    db = require('db'),
    sql = require('../services/sql'),
    superagent = require('superagent-as-promised')(require('superagent')),
    jwt = require('jsonwebtoken'),
    uuid = require('uuid');

router.post('/batch', batch.validate, batch);

router.get('/anonymous', (req, res) => {
    res.send({uuid: uuid.v1()})
});

router.post('/users', (req, res) => {
    const username = req.body.username;
    const facebookToken = req.body.facebook_token;
    if(facebookToken)
        return superagent
            .get(`${GRAPH_URL}/me?access_token=${facebookToken}`)
            .then(res => JSON.parse(res.text).id)
            .then(facebookId =>
                db.none(sql.users.create, { username, facebookId})
                    .then(() => res.status(201).send())
                    .catch((err) =>
                        res.status(500).send())
            )
            .catch(err =>
                res.status(400).send({err}));
    res.status(400).send({message: 'Field \'facebook_token\' is required.'});
});

router.get('/token', (req, res) => {
    const facebookToken = req.query.facebook_token;
    const findUserAndAssignToken = (facebookId) => {
        db.one(sql.users.findOne, {facebookId})
            .then(user => {
                const token = jwt.sign({ user }, process.env.SECRET, {expiresIn: '30 days'});
                res.status(200).send({token});
            })
            .catch(err =>
                res.status(404).send({message: 'User not found'}))
    };

    if (facebookToken) {
        return superagent
            .get(`${GRAPH_URL}/me?access_token=${facebookToken}`)
            .then(res => JSON.parse(res.text).id)
            .then(facebookId =>
                findUserAndAssignToken(facebookId))
            .catch(err => res.status(400).send({err}))
    }

    res.status(401).send();
});

module.exports = router;