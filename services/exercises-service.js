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
    approved: exercise.approved,
    c_m: exercise.c_m,
    w_m: exercise.w_m,
    c_a: exercise.c_a,
    w_a: exercise.w_a,
    status: exercise.status
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
        approved: exercise.approved,
        c_m: exercise.c_m,
        w_m: exercise.w_m,
        c_a: exercise.c_a,
        w_a: exercise.w_a,
        status: exercise.status
    }
};

const validExerciseSchema = {
    required: ['question', 'answers', 'type'],
    properties: {
        type: {enum: ['mc']},
        question: {type: 'string'},
        answers: {
            type: 'array',
            maxItems: 3,
            items: {
                type: 'object',
                required: ['correct', 'text'],
                properties: {
                    correct: {type: 'boolean'},
                    text: {type: 'string'}
                }
            }
        }
    }
};

const feasibleExerciseSchema = {
    required: ['question', 'answers', 'type'],
    properties: {
        type: {enum: ['mc']},
        question: {type: 'string'},
        answers: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
                type: 'object',
                required: ['correct', 'text'],
                properties: {
                    correct: {type: 'boolean'},
                    text: {type: 'string'}
                }
            }
        }
    }
};

module.exports = {
    validExerciseSchema,
    feasibleExerciseSchema,
    process
};