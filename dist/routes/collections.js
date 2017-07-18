'use strict';

var _common = require('../services/common.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    Ajv = require('ajv'),
    ajv = new Ajv(),
    normalizr = require('normalizr'),
    bodyValidation = require('body-validation'),
    authentication = require('../middleware/user-authentication'),
    authorization = require('../middleware/authorization'),
    db = require('db'),
    quizService = require('../services/quiz-service'),
    exercisesService = require('../services/exercises-service'),
    sql = require('../services/sql'),
    exerciseSchema = new normalizr.schema.Entity('exercises'),
    collectionSchema = new normalizr.schema.Entity('topics', { exercises: [exerciseSchema] });

router.get('/:collectionId/exercises', function (req, res) {
  db.any(sql.collections.findExercises, {
    collectionId: req.params.collectionId
  }).then(function (exercises) {
    return res.status(200).send(normalizr.normalize(exercises, [exerciseSchema]));
  }).catch(function (err) {
    return res.status(500).send({ err: err });
  });
});

(0, _common.get)('/:collectionId/quiz', [authentication(true)], function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var exercises;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return db.any(sql.collections.quiz, {
              collectionId: req.params.collectionId,
              userId: req.user.id,
              size: parseInt(req.query.size) || 6
            });

          case 2:
            exercises = _context.sent;
            return _context.abrupt('return', normalizr.normalize(exercises, [exerciseSchema]));

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

router.post('/:collectionId/exercises', [authentication(true), bodyValidation(exercisesService.validExerciseSchema), authorization('CREATE_EXERCISE')], function (req, res) {
  var content = req.body;
  var exercise = { content: content };
  exercise.isFeasible = ajv.validate(exercisesService.feasibleExerciseSchema, content);
  exercise.collectionId = req.params.collectionId;
  exercise.userId = req.user.id;
  db.one(sql.collections.insertExercise, exercise).then(function (exercise) {
    return db.none(sql.exercises.vote, {
      userId: req.user.id,
      exerciseId: exercise.id,
      positive: true
    }).then(function () {
      return res.status(201).json();
    }).catch(function (err) {
      console.log(err);
      res.status(500).send({ err: err });
    });
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

module.exports = router;