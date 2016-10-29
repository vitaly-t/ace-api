const
    db = require('db'),
    sql = require('../services/sql');


const send = (exerciseId, report, callback) => {
    db.one(sql.reports.insert, {
            exerciseId,
            message: report.message,
            device: report.device,
            email: report.email
        })
        .then((reportId) => callback(null, reportId.id))
        .catch(callback);
};

module.exports = {
    send
};
