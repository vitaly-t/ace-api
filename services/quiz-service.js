const
    _ = require('underscore');

const process = (exercises, quizLength) => _.map(exercises, exercise => {
    const
        w_m = _.filter(exercise.me_answers, answer => !answer).length,
        c_m = _.filter(exercise.me_answers, answer => answer).length,
        w_a = _.filter(exercise.all_answers, answer => !answer).length,
        c_a = _.filter(exercise.all_answers, answer => answer).length;
    return _.extend(exercise, {
        difficultyRating: ((1 + w_a) / (1 + c_a)) * Math.pow(2, (w_m - c_m))
    })
});

module.exports = {
    process
};