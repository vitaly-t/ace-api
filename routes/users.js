const
    GRAPH_URL = 'https://graph.facebook.com',
    express = require('express'),
    router = express.Router(),
    db = require('db'),
    sql = require('../services/sql'),
    bodyValidation = require('body-validation'),
    morsommeNavn = require('morsomme-navn'),
    userService = require('../services/user-service'),
    superagent = require('superagent-as-promised')(require('superagent'));

const findValidUsername = (username, callback) =>
    db.none('select * from users where username=${username}', {username})
        .then(() =>
            callback(null, username))
        .catch((err) =>
            findValidUsername(username + Math.floor(Math.random() * 10), callback));

router.post('/anonymous', bodyValidation({
        required: ['deviceId'],
        properties: {deviceId: {type: 'string'}}
    }), (req, res) => {
        findValidUsername(morsommeNavn.generate(), (err, username) =>
            db.one(sql.users.createAnonymous, {username, deviceId: req.body.deviceId})
                .then(() => {
                    userService.getUser(req.body.deviceId, (err, user) => {
                        if (err) return res.status(500).send({message: 'This should never happen'});
                        res.status(201).send(user)
                    })
                })
                .catch((err) =>
                    res.status(500).send()))
    }
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
                    .then(() =>
                        userService.getUser(facebookId, (err, user) => {
                            if (err)
                                return res.status(500).send({message: 'This should never happen'});
                            res.status(201).send(user)
                        })
                    )
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
    }), (req, res) =>
        superagent
            .get(`${GRAPH_URL}/me?access_token=${req.body.facebookToken}`)
            .then(res => JSON.parse(res.text).id)
            .then(facebookId =>
                db.none(sql.users.create, {username: req.body.username, facebookId})
                    .then(() => {
                        userService.getUser(facebookId, (err, user) => {
                            if (err)
                                return res.status(500).send({message: 'This should never happen'});
                            res.status(201).send(user)
                        })
                    })
                    .catch(err =>
                        res.status(500).send())
            )
            .catch(err =>
                res.status(400).send({err}))
);

module.exports = router;