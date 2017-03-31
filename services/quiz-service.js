const _ = require('lodash'), exerciseService = require('./exercises-service');

const deduceRelevance = (skillLevel, initialDifficulty) =>
  ex => {
    const c_m = ex.c_m,
      w_m = ex.w_m,
      w_a = ex.w_a,
      c_a = ex.c_a,
      subjDifficulty = w_m + c_m > 0
        ? Math.pow(2, w_m - c_m)
        : initialDifficulty,
      objDifficulty = (1 + w_a) / (1 + w_a + c_a),
      difficulty = objDifficulty * subjDifficulty,
      relevance = Math.pow(difficulty, skillLevel);
    return _.extend(ex, {
      difficulty,
      relevance,
      skillLevel
    });
  };

const create = (collectionId, exs, quizLength, nAlts) => {
  const exercises = _.map(_.filter(exs, ex => ex.is_feasible), ex => exerciseService.process(ex, nAlts)),
    correctHistory = _.reduce(exercises, (sum, ex) => sum + ex.c_m, 0),
    wrongHistory = _.reduce(exercises, (sum, ex) => sum + ex.w_m, 0),
    skillLevel = 2 *
      (correctHistory / (1 + wrongHistory + correctHistory) - 0.5),
    measuredExercises = _.map(exercises, deduceRelevance(skillLevel, 4)),
    lotteryIds = _.shuffle(
      _.flatten(
        _.map(measuredExercises, ex =>
          Array(Math.ceil(100 * ex.relevance)).fill(ex.id))
      )
    ),
    chosenIds = _.uniq(lotteryIds),
    chosenExercises = _.filter(measuredExercises, ex =>
      _.includes(chosenIds, ex.id));

  return _.take(chosenExercises, quizLength);
  // return _.union(_.take(chosenExercises, quizLength), [{ id: 0, collection_id: collectionId, is_feasible: false, content: { type: 'mc', question: '', alternatives: [] }}]);
};

module.exports = {
  create
};
