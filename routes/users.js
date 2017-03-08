const
    GRAPH_URL = 'https://graph.facebook.com',
    express = require('express'),
    router = express.Router(),
    db = require('db'),
    sql = require('../services/sql'),
    bodyValidation = require('body-validation'),
    superagent = require('superagent-as-promised')(require('superagent'));

router.post('/anonymous', bodyValidation({
        required: ['deviceId'],
        properties: {deviceId: {type: 'string'}}
    }), (req, res) =>
        db.none(sql.users.createAnonymous, {deviceId: req.body.deviceId})
            .then(() => res.status(201).send())
            .catch((err) =>
                res.status(500).send())
);

router.post('/facebook_connection', bodyValidation({
        required: ['deviceId', 'facebookToken', 'username'],
        properties: {
            deviceId: {type: 'string'},
            facebookToken: {type: 'string'},
            username: {
                type: 'string',
                minLength: 6,
                maxLength: 25
            }
        }
    }), (req, res) =>
        superagent
            .get(`${GRAPH_URL}/me?access_token=${req.body.facebookToken}`)
            .then(res => JSON.parse(res.text).id)
            .then(facebookId =>
                db.none(sql.users.connectAnonToFace, {username: req.body.username, facebookId, deviceId: req.body.deviceId})
                    .then(() => res.status(204).send())
                    .catch((err) =>
                        res.status(500).send())
            )
            .catch(err =>
                res.status(400).send({err}))
);

router.post('/facebook', bodyValidation({
        required: ['facebookToken', 'username'],
        properties: {
            facebookToken: {type: 'string'},
            username: {
                type: 'string',
                minLength: 6,
                maxLength: 25
            }
        }
    }, (req, res) =>
        superagent
            .get(`${GRAPH_URL}/me?access_token=${req.body.facebookToken}`)
            .then(res => JSON.parse(res.text).id)
            .then(facebookId =>
                db.none(sql.users.create, {username: req.body.username, facebookId})
                    .then(() => res.status(201).send())
                    .catch((err) =>
                        res.status(500).send())
            )
            .catch(err =>
                res.status(400).send({err}))
));

module.exports = router;