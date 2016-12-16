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
        rank:             sql('../sql/subjects/rank.sql'),
        downloadsToday:            sql('../sql/subjects/downloads-today.sql')
    },
    exercises: {
        answer:             sql('../sql/exercises/answer.sql'),
        findOne:             sql('../sql/exercises/find-one.sql')
    },
    reports: {
        insert:             sql('../sql/reports/insert.sql')
    },
};