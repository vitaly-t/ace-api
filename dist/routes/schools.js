'use strict';

var _common = require('../services/common.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express'),
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

(0, _common.get)('/', [], function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _common.read)('schools');

          case 2:
            result = _context.sent;
            return _context.abrupt('return', normalizr.normalize(result, [schoolSchema]));

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}())(router);

router.get('/:schoolId/subjects', [authentication(true)], function (req, res) {
  return db.any(sql.schools.findAllSubjects, {
    userId: req.user.id,
    search: req.query.search || '',
    schoolId: req.params.schoolId
  }).then(function (subjects) {
    return res.status(200).send(normalizr.normalize(subjects, [subjectSchema]));
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

module.exports = router;