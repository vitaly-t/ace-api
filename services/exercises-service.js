const _ = require('lodash');

const process = (exercise, maxAlts) => {
  switch (exercise.content.type) {
    case 'tf':
      return processTF(exercise);
    case 'mc':
      return processMC(exercise, maxAlts);
    case 'pd':
      return processMC(exercise, maxAlts);
    default:
      throw new Error('Neither tf nor mc');
  }
};

const processTF = exercise => {
  exercise.content.alternatives = [
    { text: 'True', correct: exercise.content.correct },
    { text: 'False', correct: !exercise.content.correct },
  ];
  return exercise;
};

const processMC = (exercise, maxAlts) => {
  exercise.content.alternatives = _.filter(
    exercise.content.alternatives,
    alt => alt
  );
  exercise.content.alternatives = _.shuffle(
    _.take(
      _.union(
        [
          _.first(
            _.shuffle(
              _.filter(exercise.content.alternatives, alt => alt.correct)
            )
          ),
        ],
        _.filter(exercise.content.alternatives, alt => !alt.correct)
      ),
      maxAlts
    )
  );
  exercise.content.alternatives = _.filter(
    exercise.content.alternatives,
    alt => alt
  );
  return exercise;
};

const validExerciseSchema = {
  required: ['question', 'alternatives', 'type'],
  properties: {
    type: { enum: ['mc'] },
    question: { required: ['text'], properties: { text: { type: 'string' } } },
    alternatives: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        required: ['correct', 'text'],
        properties: {
          correct: { type: 'boolean' },
          text: { type: 'string' },
        },
      },
    },
  },
};

const feasibleExerciseSchema = {
  required: ['question', 'alternatives', 'type'],
  properties: {
    type: { enum: ['mc'] },
    question: { required: ['text'], properties: { text: { type: 'string' } } },
    alternatives: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        required: ['correct', 'text'],
        properties: {
          correct: { type: 'boolean' },
          text: { type: 'string' },
        },
      },
    },
  },
};

module.exports = {
  validExerciseSchema,
  feasibleExerciseSchema,
  process,
};
