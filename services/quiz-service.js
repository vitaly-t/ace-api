const _ = require('lodash'), exerciseService = require('./exercises-service');

const deduceRelevance = (skillLevel, initialDifficulty) =>
  ex => {
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

const tournamentSelection = (
  xs,
  evaluate,
  winners,
  nRounds,
  tournamentSize = 3
) => {
  if (nRounds === 0 || _size(xs) === 0) return winners;
  const winner = _.maxBy(_.sampleSize(xs, tournamentSize), evaluate);
  return tournamentSelection(
    _.pull(xs, winner),
    evaluate,
    _.union([winner], winners),
    nRounds - 1,
    tournamentSize
  );
};

const create = (collectionId, exs, quizLength, nAlts) => {
  const exercises = _.map(_.filter(exs, ex => ex.is_feasible), ex =>
    exerciseService.process(ex, nAlts || 3)),
    correctHistory = _.reduce(exercises, (sum, ex) => sum + ex.c_m, 0),
    wrongHistory = _.reduce(exercises, (sum, ex) => sum + ex.w_m, 0),
    skillLevel = 2 *
      (correctHistory / (1 + wrongHistory + correctHistory) - 0.5),
    measuredExercises = _.map(exercises, deduceRelevance(skillLevel, 4));
  console.log(
    _.map(measuredExercises, ex => ({ id: ex.id, relevance: ex.relevance }))
  );
  const chosenExercises = tournamentSelection(
    measuredExercises,
    ex => ex.relevance,
    [],
    quizLength,
    3
  );
  console.log(
    _.map(chosenExercises, ex => ({ id: ex.id, relevance: ex.relevance }))
  );

  return _.take(chosenExercises, quizLength);
  // return _.union(_.take(chosenExercises, quizLength), [{ id: 0, collection_id: collectionId, is_feasible: false, content: { type: 'mc', question: '', alternatives: [] }}]);
};

module.exports = {
  create,
};
