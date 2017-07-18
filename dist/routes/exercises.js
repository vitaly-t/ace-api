'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _common = require('../services/common.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    exerciseService = require('../services/exercises-service'),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication'),
    db = require('db'),
    sql = require('../services/sql'),
    normalizr = require('normalizr'),
    authorization = require('../middleware/authorization'),
    exerciseSchema = new normalizr.schema.Entity('exercises'),
    commentSchema = new normalizr.schema.Entity('comments');

(0, _common.get)('/:exerciseId', [], function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _common.readOne)('v_exercises', 'id=' + req.params.exerciseId);

          case 2:
            result = _context.sent;
            return _context.abrupt('return', normalizr.normalize(result, exerciseSchema));

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

(0, _common.post)('/:exerciseId/reports', [authentication(true), bodyValidation({ required: ['message'], properties: { message: { type: 'string' } } })], function (req, res) {
  return (0, _common.create)('reports', _extends({
    exercise_id: req.params.exerciseId,
    user_id: req.user.id
  }, req.body));
})(router);

(0, _common.post)('/:exerciseId/answers', [authentication(true), bodyValidation({
  required: ['answer_status'],
  properties: { answer_status: { type: 'boolean' } }
})], function (req, res) {
  return (0, _common.create)('answers', {
    status: req.body.answer_status,
    user_id: req.user.id,
    exercise_id: req.params.exerciseId
  });
})(router);

(0, _common.put)('/:exerciseId', [authentication(true), bodyValidation(exerciseService.validExerciseSchema)], function (req, res) {
  return (0, _common.update)('exercises', req.params.exerciseId, {
    updated_by: req.user.id,
    content: req.body
  });
})(router);

(0, _common.post)('/:exerciseId/votes', [authentication(true), bodyValidation({ required: ['positive'], properties: { positive: { type: 'boolean' } } }), authorization('VOTE_EXERCISE')], function (req, res) {
  return (0, _common.create)('votes', _extends({
    user_id: req.user.id,
    exercise_id: req.params.exerciseId
  }, req.body));
})(router);

(0, _common.post)('/:exerciseId/comments', [authentication(true), bodyValidation({
  type: 'object',
  required: ['message'],
  properties: { message: { type: 'string' } }
}), authorization('COMMENT')], function (req, res) {
  return (0, _common.create)('comments', _extends({}, req.body, {
    user_id: req.user.id,
    exercise_id: req.params.exerciseId
  }));
})(router);

(0, _common.get)('/:exerciseId/comments', [authentication(true)], function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
    var result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return db.any(sql.comments.find, {
              userId: req.user.id,
              exerciseId: req.params.exerciseId
            });

          case 2:
            result = _context2.sent;
            return _context2.abrupt('return', normalizr.normalize(result, [commentSchema]));

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}())(router);

module.exports = router;