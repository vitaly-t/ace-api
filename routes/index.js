const
    GRAPH_URL = 'https://graph.facebook.com',
    express = require('express'),
    router = express.Router(),
    db = require('db'),
    sql = require('../services/sql'),
    superagent = require('superagent-as-promised')(require('superagent')),
    jwt = require('jsonwebtoken'),
    uuid = require('uuid');


router.get('/token', (req, res) => {
    const facebookToken = req.query.facebook_token;
    const findUserAndAssignToken = (id) => {
        db.one(sql.users.findOne, { id })
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
    findUserAndAssignToken(req.query.device_id);
});

module.exports = router;