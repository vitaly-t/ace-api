const
    db = require('db'),
    sql = require('../services/sql');

const findAll = (clientId = 0, callback) => {
    db.any(sql.subjects.findAll, {clientId})
        .then(subjects => callback(null, subjects))
        .catch(callback)
};

const findById = (subjectId, clientId, showOnlyIfPublished, callback) => {
    db.one(sql.subjects.findById, {subjectId, clientId, forceShow: !showOnlyIfPublished})
        .then(subject => callback(null, subject))
        .catch(callback);
};

const addToFavorites = (subjectId, clientId, callback) => {
    db.none('insert into favorites (client_id, subject_id) values (${clientId}, ${subjectId})', {clientId, subjectId})
        .then(() => callback(null))
        .catch(callback);
};

const removeFromFavorites = (subjectId, clientId, callback) => {
    db.none('delete from favorites where client_id = ${clientId} and subject_id = ${subjectId}', {clientId, subjectId})
        .then(() => callback(null))
        .catch(callback);
};

module.exports = {
    findAll,
    findById,
    addToFavorites,
    removeFromFavorites
};