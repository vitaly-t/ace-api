const
    db = require('db'),
    sql = require('../services/sql');

const answer = (exerciseId, clientId, correct, callback) => {
    db.none(sql.exercises.answer, {
        correct: correct,
        clientId: clientId,
        exerciseId: exerciseId
    })
        .then(callback)
        .catch(callback);
};

module.exports = {
    answer
};
