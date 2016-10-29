const
    db = require('db'),
    sql = require('../services/sql');

const answer = (exerciseId, clientId, answerStatus) => db.none(sql.exercises.answer, {
    answerStatus,
    clientId,
    exerciseId
});

module.exports = {
    answer
};
