const
    db = require('db'),
    sql = require('../services/sql');


const send = (exerciseId, report) => {
    db.one(sql.reports.insert, {
            exerciseId,
            message: report.message,
            device: report.device,
            email: report.email
        })
        .then(result => result.id)
};

module.exports = {
    send
};
