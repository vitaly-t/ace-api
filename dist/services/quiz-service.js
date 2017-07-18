'use strict';

var _ = require('lodash'),
    exerciseService = require('./exercises-service');

var deduceRelevance = function deduceRelevance(skillLevel, initialDifficulty) {
  return function (ex) {
    var c_m = ex.c_m,
        w_m = ex.w_m,
        w_a = ex.w_a,
        c_a = ex.c_a,
        subjDifficulty = w_m + c_m > 0 ? Math.pow(2, w_m - c_m < -10 ? -10 : w_m - c_m > 10 ? 10 : w_m - c_m) : initialDifficulty,
        objDifficulty = (1 + w_a) / (1 + w_a + c_a),
        difficulty = objDifficulty * subjDifficulty,
        relevance = Math.pow(difficulty, skillLevel);
    return _.extend(ex, {
      difficulty: difficulty,
      relevance: relevance,
      skillLevel: skillLevel
    });
  };
};

var tournamentSelection = function tournamentSelection(xs, evaluate, winners, nRounds) {
  var tournamentSize = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 3;

  if (nRounds === 0 || _.size(xs) === 0) return winners;
  var winner = _.maxBy(_.sampleSize(xs, tournamentSize), evaluate);
  return tournamentSelection(_.pull(xs, winner), evaluate, _.union([winner], winners), nRounds - 1, tournamentSize);
};

var create = function create(exs, quizLength, nAlts) {
  var exercises = _.map(exs, function (ex) {
    return ex.is_feasible ? exerciseService.process(ex, nAlts || 3) : ex;
  }),
      correctHistory = _.reduce(exercises, function (sum, ex) {
    return sum + ex.c_m;
  }, 0),
      wrongHistory = _.reduce(exercises, function (sum, ex) {
    return sum + ex.w_m;
  }, 0),
      skillLevel = 2 * (correctHistory / (1 + wrongHistory + correctHistory) - 0.5),
      measuredExercises = _.map(exercises, deduceRelevance(skillLevel, 4));
  var chosenExercises = tournamentSelection(measuredExercises, function (ex) {
    return ex.relevance;
  }, [], quizLength, 3);
  return _.take(_.shuffle(chosenExercises), quizLength);
};

module.exports = {
  create: create
};