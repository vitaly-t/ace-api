const
    _ = require('underscore');

const processExercises = (exercises) => {
    processPhraseDefinitions(exercises.filter((exercise) => exercise && exercise.type === 'pd'));
};

const processPhraseDefinitions = (exercises) => {
    const tags = {};
    exercises.forEach((exercise) => {
        exercise.content.tags =  _.map(exercise.content.tags, (tag) => tag.text);
        exercise.content.tags.forEach((tag) => {
            tags[tag] = tags[tag] || [];
            tags[tag].push(exercise);
        });
    });
    exercises.forEach((exercise) => {
        exercise.content.wrongs = [];
        exercise.content.tags.forEach((tag) => {
            tags[tag].forEach((matchingExercise) => {
                if (exercise.id !== matchingExercise.id) {
                    exercise.content.wrongs.push(matchingExercise.content.correct.answer);
                }
            });
        });
    });
    exercises.forEach((exercise) => {
        exercise.content.wrongs = _.filter(exercise.content.wrongs, (val, index) => exercise.content.wrongs.indexOf(val) == index);
        exercise.content.corrects = [{answer: exercise.content.correct.answer}];
        exercise.content.wrongs = _.map(exercise.content.wrongs, (correct) => {
            return {answer: correct}
        });
        delete exercise.content.correct;
        delete exercise.content.tags;
    });
};

module.exports = {
    processExercises: processExercises
};