const QueryFile = require('pg-promise').QueryFile,
  path = require('path'),
  sql = file => {
    return new QueryFile(path.join(__dirname, file), { minify: true });
  };

module.exports = {
  answers: {
    postAnswers: sql('../sql/answers/post-answers.sql'),
  },
  subjects: {
    findPopularCollections: sql('../sql/subjects/find-popular-collections.sql'),
    findById: sql('../sql/subjects/find-by-id.sql'),
    findAll: sql('../sql/subjects/find-all.sql'),
    update: sql('../sql/subjects/update.sql'),
    addToFavorites: sql('../sql/subjects/add-to-favorites.sql'),
    removeFromFavorites: sql('../sql/subjects/remove-from-favorites.sql'),
    findCollections: sql('../sql/subjects/find-collections.sql'),
    downloadsToday: sql('../sql/subjects/downloads-today.sql'),
    quiz: sql('../sql/subjects/quiz.sql'),
    ranking: sql('../sql/subjects/ranking.sql'),
    feed: sql('../sql/subjects/feed.sql'),
    delete: sql('../sql/subjects/delete.sql'),
  },
  exercises: {
    update: sql('../sql/exercises/update.sql'),
    answer: sql('../sql/exercises/answer.sql'),
    findOne: sql('../sql/exercises/find-one.sql'),
    vote: sql('../sql/exercises/like.sql'),
  },
  reports: {
    insert: sql('../sql/reports/insert.sql'),
  },
  collections: {
    quiz: sql('../sql/collections/quiz.sql'),
    insertExercise: sql('../sql/collections/insert-exercise.sql'),
    findExercises: sql('../sql/collections/find-exercises.sql'),
    findById: sql('../sql/collections/find-by-id.sql'),
  },
  users: {
    findOne: sql('../sql/users/find-one.sql'),
    relevance: sql('../sql/users/relevance.sql'),
    create: sql('../sql/users/create.sql'),
    createAnonymous: sql('../sql/users/create-anonymous.sql'),
    connectAnonToFace: sql('../sql/users/connect-anon-to-face.sql'),
  },
  comments: {
    create: sql('../sql/comments/create.sql'),
    find: sql('../sql/comments/find.sql'),
  },
};
