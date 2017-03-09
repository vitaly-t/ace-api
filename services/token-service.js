const
    express = require('express'),
    db = require('db'),
    sql = require('../services/sql'),
    jwt = require('jsonwebtoken');

const getToken = (id, callback) =>
    db.one(sql.users.findOne, { id })
        .then(user => {
            const token = jwt.sign({ user }, process.env.SECRET, {expiresIn: '30 days'});
            callback(null, token);
        })
        .catch(err =>
            callback(new Error('User not found')));

module.exports = { getToken };

