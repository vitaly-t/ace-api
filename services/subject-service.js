const
    _ = require('underscore'),
    exercisesService = require('./exercises-service');

const project = (subject, subjectKeys, collectionKeys, exerciseKeys) => {
    const
        s = _.pick(subject, subjectKeys);

    collections = _.map(subject.collections, (collection) => {
        const exercises = _.map(collection.exercises, (exercise) => _.pick(exercise, [exerciseKeys]));
        return _.extend(_.pick(collection, [collectionKeys]), { exercises});
    });
    return _.extend(s, {collections});
};

var processSubject = (subject) => {
    var exercises = [];
    subject.collections.forEach((collection) => {
        exercises = exercises.concat(collection.exercises);
    });
    exercisesService.processExercises(exercises);
    subject.nExercises = exercises.length;
    return subject;
};

module.exports = {
    processSubject,
    project
};