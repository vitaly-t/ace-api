'use strict';

var _ = require('lodash');

var process = function process(exercise, maxAlts) {
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

var processTF = function processTF(exercise) {
  exercise.content.alternatives = [{ text: 'True', correct: exercise.content.correct }, { text: 'False', correct: !exercise.content.correct }];
  return exercise;
};

var processMC = function processMC(exercise, maxAlts) {
  exercise.content.alternatives = _.filter(exercise.content.alternatives, function (alt) {
    return alt;
  });
  exercise.content.alternatives = _.shuffle(_.take(_.union([_.first(_.shuffle(_.filter(exercise.content.alternatives, function (alt) {
    return alt.correct;
  })))], _.filter(exercise.content.alternatives, function (alt) {
    return !alt.correct;
  })), maxAlts));
  exercise.content.alternatives = _.filter(exercise.content.alternatives, function (alt) {
    return alt;
  });
  return exercise;
};

var validExerciseSchema = {
  required: ['question', 'alternatives', 'type'],
  properties: {
    type: { enum: ['mc'] },
    question: { required: ['text'], properties: { text: { type: 'string' } } },
    alternatives: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        required: ['correct', 'text'],
        properties: {
          correct: { type: 'boolean' },
          text: { type: 'string' }
        }
      }
    }
  }
};

var feasibleExerciseSchema = {
  required: ['question', 'alternatives', 'type'],
  properties: {
    type: { enum: ['mc'] },
    question: { required: ['text'], properties: { text: { type: 'string' } } },
    alternatives: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: {
        type: 'object',
        required: ['correct', 'text'],
        properties: {
          correct: { type: 'boolean' },
          text: { type: 'string' }
        }
      }
    }
  }
};

module.exports = {
  validExerciseSchema: validExerciseSchema,
  feasibleExerciseSchema: feasibleExerciseSchema,
  process: process
};