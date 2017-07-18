const { create, read, readOne, update, get, put, post, del } = require('../services/common.js');
const express = require('express'),
  router = express.Router(),
  normalizr = require('normalizr'),
  _ = require('lodash'),
  assert = require('assert'),
  db = require('db'),
  sql = require('../services/sql'),
  bodyValidation = require('body-validation'),
  authentication = require('../middleware/user-authentication'),
  authorization = require('../middleware/authorization'),
  subjectSchema = new normalizr.schema.Entity('courses'),
  schoolSchema = new normalizr.schema.Entity('schools');

get('/', [], async (req, res) => {
  const result = await read('schools');
  return normalizr.normalize(result, [schoolSchema]);
})(router);

router.get('/:schoolId/subjects', [authentication(true)], (req, res) =>
  db
    .any(sql.schools.findAllSubjects, {
      userId: req.user.id,
      search: req.query.search || '',
      schoolId: req.params.schoolId,
    })
    .then(subjects => res.status(200).send(normalizr.normalize(subjects, [subjectSchema])))
    .catch(err => {
      console.log(err);
      res.status(500).send({ err });
    })
);

module.exports = router;
