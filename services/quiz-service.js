const
    _ = require('lodash'),
    exerciseService = require('./exercises-service');

const process = (exs, quizLength, nAlts) => {
    const d = _.flatten(_.map(exs, ex => ex.me_answers));
    const correctHistory = _.filter(d, a => a).length;
    const wrongHistory = _.filter(d, a => !a).length;
    const scoredExercises = _.map(exs, ex => {
        const
            exercise = exerciseService.process(ex, nAlts),
            c_m = _.filter(ex.me_answers, answer => answer).length,
            w_m = _.filter(ex.me_answers, answer => !answer).length || c_m || 4,
            w_a = _.filter(ex.all_answers, answer => !answer).length,
            c_a = _.filter(ex.all_answers, answer => answer).length;
        // return _.extend(_.omit(exercise, ['meAnswers', 'allAnswers']), {
        return _.extend(exercise, {
            difficultyRating: Math.pow(((1 + w_a) / (1 + c_a)) * Math.pow(2, (w_m - c_m)), 1 - (wrongHistory+1)/(wrongHistory + correctHistory + 1))
        })
    });
    const lotteryExercises = _.flatten(_.map(scoredExercises, ex => Array(Math.ceil(ex.difficultyRating)).fill(ex)));
    const shuffledLotteryExercises = _.shuffle(lotteryExercises);
    // const uniqueLotteryExercises = shuffledLotteryExercises;
    const uniqueLotteryExercises = _.uniqBy(shuffledLotteryExercises, 'id');
    return _.take(uniqueLotteryExercises, quizLength);
};

module.exports = {
    process
};