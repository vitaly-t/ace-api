const
    db = require('db'),
    sql = require('../services/sql'),
    subjectService = require('../services/subject-service');

const findAll = (clientId) => db.any(sql.subjects.findAll, {clientId});

const findById = (subjectId, clientId, showOnlyIfPublished) =>
    db.one(sql.subjects.findById, {subjectId, clientId, forceShow: !showOnlyIfPublished})
        .then(subject => subjectService.processSubject(subject));

const addToFavorites = (subjectId, clientId) =>
    db.none(sql.subjects.addToFavorites, {clientId, subjectId});

const removeFromFavorites = (subjectId, clientId) =>
    db.none(sql.subjects.removeFromFavorites, {clientId, subjectId});

module.exports = {
    findAll,
    findById,
    addToFavorites,
    removeFromFavorites
};