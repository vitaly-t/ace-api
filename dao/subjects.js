const
    db = require('db'),
    sql = require('../services/sql'),
    subjectService = require('../services/subject-service');

const findAll = (clientId) => db.any(sql.subjects.findAll, {clientId});

const findById = (subjectId, clientId, showOnlyIfPublished) =>
    db.one(sql.subjects.findById, {subjectId, clientId, forceShow: !showOnlyIfPublished})
        .then(subject => subjectService.processSubject(subject));

const addToFavorites = (subjectId, clientId) =>
    db.none('insert into favorites (client_id, subject_id) values (${clientId}, ${subjectId})', {clientId, subjectId});

const removeFromFavorites = (subjectId, clientId) =>
    db.none('delete from favorites where client_id = ${clientId} and subject_id = ${subjectId}', {clientId, subjectId});

module.exports = {
    findAll,
    findById,
    addToFavorites,
    removeFromFavorites
};