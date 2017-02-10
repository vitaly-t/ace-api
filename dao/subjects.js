const
    db = require('db'),
    sql = require('../services/sql'),
    subjectService = require('../services/subject-service');

const findById = (subjectId, clientId, showOnlyIfPublished) =>
    db.one(sql.subjects.findById, {subjectId, clientId, forceShow: !showOnlyIfPublished})
        .then(subject => subjectService.processSubject(subject));

const removeFromFavorites = (subjectId, userId) =>
    db.none(sql.subjects.removeFromFavorites, {userId, subjectId});

const downloadsToday = () =>
    db.one(sql.subjects.downloadsToday)
        .then(row =>
            row.count);

const findCollections = (subjectId) =>
    db.any(sql.subjects.findCollections, {subjectId});

module.exports = {
    findById,
    removeFromFavorites,
    downloadsToday,
    findCollections
};