const
    QueryFile   = require('pg-promise').QueryFile,
    path        = require('path'),
    sql = (file) => {
        return new QueryFile(path.join(__dirname, file), {minify: true});
    };



module.exports = {
    subjects: {
        findById: sql('../sql/subjects/find-by-id.sql'),
        findAll:            sql('../sql/subjects/find-all.sql'),
        update:             sql('../sql/subjects/update.sql'),
        addToFavorites:            sql('../sql/subjects/add-to-favorites.sql'),
        removeFromFavorites:            sql('../sql/subjects/remove-from-favorites.sql'),
        findCollections:             sql('../sql/subjects/find-collections.sql'),
        downloadsToday:            sql('../sql/subjects/downloads-today.sql'),
        quiz:             sql('../sql/subjects/quiz.sql'),
    },
    exercises: {
        update:             sql('../sql/exercises/update.sql'),
        answer:             sql('../sql/exercises/answer.sql'),
        findOne:             sql('../sql/exercises/find-one.sql'),
        vote:             sql('../sql/exercises/vote.sql')
    },
    reports: {
        insert:             sql('../sql/reports/insert.sql')
    },
    collections: {
        quiz:             sql('../sql/collections/quiz.sql'),
        insertExercise:             sql('../sql/collections/insert-exercise.sql'),
        findExercises:             sql('../sql/collections/find-exercises.sql')
    },
    users: {
        findOne:             sql('../sql/users/find-one.sql'),
        create:             sql('../sql/users/create.sql'),
        createAnonymous:             sql('../sql/users/create-anonymous.sql'),
        connectAnonToFace:             sql('../sql/users/connect-anon-to-face.sql')
    },
    comments: {
        create:             sql('../sql/comments/create.sql'),
        find:             sql('../sql/comments/find.sql')
    }
};