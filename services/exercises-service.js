const
    _ = require('lodash');

const process = (exercise, maxAlts) => {
    switch (exercise.content.type) {
        case 'tf':
            return processTF(exercise);
        case 'mc':
            return processMC(exercise, maxAlts);
        default:
            throw new Error('Neither tf nor mc')
    }
};

const processTF = (exercise) => {
    exercise.content.alternatives =
        [{text: 'True', correct: exercise.content.correct.answer},
        {text: 'False', correct: !exercise.content.correct.answer}]
    return exercise;
};

const processMC = (exercise) => {
    exercise.content.alternatives = _.shuffle(exercise.content.alternatives);
    return exercise;
};

const validExerciseSchema = {
    required: ['question', 'alternatives', 'type'],
    properties: {
        type: {enum: ['mc']},
        question: { required: ['text'], properties: { text: {type: 'string'}}},
        alternatives: {
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
    required: ['question', 'alternatives', 'type'],
    properties: {
        type: {enum: ['mc']},
        question: { required: ['text'], properties: { text: {type: 'string'}}},
        alternatives: {
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