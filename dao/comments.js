const
    db = require('db'),
    sql = require('../services/sql');


const create = (exerciseId, clientId, message) =>
    db.none(sql.comments.create, {clientId, exerciseId, message});

const find = (exerciseId) =>
    db.any(sql.comments.find, { exerciseId });


module.exports = {
    create,
    find
};

