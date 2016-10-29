const
    db = require('db'),
    sql = require('../services/sql');

const answer = (exerciseId, clientId, correct) => db.none(sql.exercises.answer, {
        correct: correct,
        clientId: clientId,
        exerciseId: exerciseId
    });

module.exports = {
    answer
};
