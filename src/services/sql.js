const QueryFile = require('pg-promise').QueryFile,
  path = require('path'),
  sql = file => {
    return new QueryFile(path.join(__dirname, file), { minify: true });
  };

module.exports = {
  common: {
    find: sql('../../sql/common/find.sql'),
    delete: sql('../../sql/common/delete.sql'),
    create: sql('../../sql/common/create.sql'),
    subscribe: sql('../../sql/common/subscribe.sql'),
    publish: sql('../../sql/common/publish.sql'),
    notifications: sql('../../sql/common/notifications.sql'),
    comment: sql('../../sql/common/comment.sql'),
    levels: sql('../../sql/common/levels.sql'),
    readComments: sql('../../sql/common/read-comments.sql'),
  },
  answers: {
    postAnswers: sql('../../sql/answers/post-answers.sql'),
  },
  subjects: {
    findById: sql('../../sql/subjects/find-by-id.sql'),
    findAll: sql('../../sql/subjects/find-all.sql'),
    addToFavorites: sql('../../sql/subjects/add-to-favorites.sql'),
    removeFromFavorites: sql('../../sql/subjects/remove-from-favorites.sql'),
    findCollections: sql('../../sql/subjects/find-collections.sql'),
    downloadsToday: sql('../../sql/subjects/downloads-today.sql'),
    quiz: sql('../../sql/subjects/quiz.sql'),
    ranking: sql('../../sql/subjects/ranking.sql'),
    feed: sql('../../sql/subjects/feed.sql'),
    delete: sql('../../sql/subjects/delete.sql'),
    update: sql('../../sql/subjects/update.sql'),
    exercises: sql('../../sql/subjects/exercises.sql'),
  },
  exercises: {
    update: sql('../../sql/exercises/update.sql'),
    answer: sql('../../sql/exercises/answer.sql'),
    findOne: sql('../../sql/exercises/find-one.sql'),
    vote: sql('../../sql/exercises/like.sql'),
  },
  reports: {
    insert: sql('../../sql/reports/insert.sql'),
  },
  collections: {
    quiz: sql('../../sql/collections/quiz.sql'),
    delete: sql('../../sql/collections/delete.sql'),
    insertExercise: sql('../../sql/collections/insert-exercise.sql'),
    findExercises: sql('../../sql/collections/find-exercises.sql'),
    findById: sql('../../sql/collections/find-by-id.sql'),
  },
  users: {
    findOne: sql('../../sql/users/find-one.sql'),
    relevance: sql('../../sql/users/relevance.sql'),
    create: sql('../../sql/users/create.sql'),
    notifications: sql('../../sql/users/notifications.sql'),
    createAnonymous: sql('../../sql/users/create-anonymous.sql'),
    connectAnonToFace: sql('../../sql/users/connect-anon-to-face.sql'),
    contribution: sql('../../sql/users/contribution.sql'),
  },
  comments: {
    create: sql('../../sql/comments/create.sql'),
    find: sql('../../sql/comments/find.sql'),
    vote: sql('../../sql/comments/vote.sql'),
  },
  schools: {
    findAllSubjects: sql('../../sql/schools/find-all-subjects.sql'),
  },
};
