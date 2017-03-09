const
    GRAPH_URL = 'https://graph.facebook.com',
    express = require('express'),
    router = express.Router(),
    superagent = require('superagent-as-promised')(require('superagent')),
    uuid = require('uuid'),
    tokenService = require('../services/token-service');


router.get('/token', (req, res) => {
    const facebookToken = req.query.facebook_token;
    if (facebookToken) {
        return superagent
            .get(`${GRAPH_URL}/me?access_token=${facebookToken}`)
            .then(res => JSON.parse(res.text).id)
            .then(facebookId =>
                tokenService.getToken(facebookId, (err, token) => {
                        if (err) return res.status(404).send({message: 'User not found'})
                        res.status(200).send({token});
                    }
                ))
            .catch(err => res.status(400).send({err}))
    }
    tokenService.getToken(req.query.device_id, (err, token) => {
        if (err) return res.status(404).send({message: 'User not found'})
        res.status(200).send({token});
    })
});

module.exports = router;