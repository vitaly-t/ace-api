const
    _ = require('underscore');

const process = (exercise, maxAlts) => {
    switch (exercise.type) {
        case 'tf':
            return processTF(exercise);
        case 'mc':
            return processMC(exercise, maxAlts);
        default:
            throw new Error('Neither tf nor mc')
    }
};

const processTF = (exercise) => ({
    id: exercise.id,
    type: exercise.type,
    question: {text: exercise.content.question.text},
    alternatives: [
        {text: 'True', correct: exercise.content.correct.answer},
        {text: 'False', correct: !exercise.content.correct.answer}],
    answer_status: exercise.answer_status,
    approved: exercise.approved
});

const processMC = (exercise, maxAlts) => {
    corrects = _.map(exercise.content.corrects, correctAlt => _.extend(correctAlt, {correct: true}));
    wrongs = _.map(exercise.content.wrongs, wrongAlt => _.extend(wrongAlt, {correct: false}));
    alternatives = _.take(_.map(corrects.concat(wrongs), alt => ({text: alt.answer, correct: alt.correct})), maxAlts);
    shuffledAlternatives = _.shuffle(alternatives);

    return {
        id: exercise.id,
        type: exercise.type,
        question: {text: exercise.content.question.text},
        alternatives: shuffledAlternatives,
        answer_status: exercise.answer_status,
        approved: exercise.approved,
        meAnswers: exercise.me_answers,
        allAnswers: exercise.all_answers
    }
};

module.exports = {
    process
};