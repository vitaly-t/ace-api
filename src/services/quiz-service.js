const _ = require('lodash'), exerciseService = require('./exercises-service');

const deduceRelevance = (skillLevel, initialDifficulty) => ex => {
  const c_m = ex.c_m,
    w_m = ex.w_m,
    w_a = ex.w_a,
    c_a = ex.c_a,
    subjDifficulty = w_m + c_m > 0
      ? Math.pow(2, w_m - c_m < -10 ? -10 : w_m - c_m > 10 ? 10 : w_m - c_m)
      : initialDifficulty,
    objDifficulty = (1 + w_a) / (1 + w_a + c_a),
    difficulty = objDifficulty * subjDifficulty,
    relevance = Math.pow(difficulty, skillLevel);
  return _.extend(ex, {
    difficulty,
    relevance,
    skillLevel,
  });
};

const tournamentSelection = (xs, evaluate, winners, nRounds, tournamentSize = 3) => {
  if (nRounds === 0 || _.size(xs) === 0) return winners;
  const winner = _.maxBy(_.sampleSize(xs, tournamentSize), evaluate);
  return tournamentSelection(
    _.pull(xs, winner),
    evaluate,
    _.union([winner], winners),
    nRounds - 1,
    tournamentSize
  );
};

const create = (exs, quizLength, nAlts) => {
  const exercises = _.map(
    exs,
    ex => (ex.is_feasible ? exerciseService.process(ex, nAlts || 3) : ex)
  ),
    correctHistory = _.reduce(exercises, (sum, ex) => sum + ex.c_m, 0),
    wrongHistory = _.reduce(exercises, (sum, ex) => sum + ex.w_m, 0),
    skillLevel = 2 * (correctHistory / (1 + wrongHistory + correctHistory) - 0.5),
    measuredExercises = _.map(exercises, deduceRelevance(skillLevel, 4));
  const chosenExercises = tournamentSelection(
    measuredExercises,
    ex => ex.relevance,
    [],
    quizLength,
    3
  );
  return _.take(_.shuffle(chosenExercises), quizLength);
};

module.exports = {
  create,
};
