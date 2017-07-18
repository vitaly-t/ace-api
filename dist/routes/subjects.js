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
    exerciseSchema = new normalizr.schema.Entity('exercises'),
    collectionSchema = new normalizr.schema.Entity('topics'),
    subjectSchema = new normalizr.schema.Entity('courses', {
  topics: [collectionSchema]
});

(0, _common.get)('/:subjectId/exercises', authentication(true), function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _common.read)('v_exercises', 'subject_id=' + req.params.subjectId + ' and updated_by=' + req.user.id);

          case 2:
            result = _context.sent;
            return _context.abrupt('return', normalizr.normalize(result, [exerciseSchema]));

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

router.get('/:subjectId/feed', authentication(true), function (req, res) {
  return db.any(sql.subjects.feed, { subjectId: req.params.subjectId }).then(function (feed) {
    return res.status(200).send(_.map(feed, function (a) {
      return a.activity;
    }));
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

router.put('/:subjectId/order', function (req, res) {
  console.log(req.body);
  db.tx(function (t) {
    return t.batch(_.map(req.body.order, function (collectionId, index) {
      return t.none('update collections set position=${index} where id=${collectionId} and subject_id=${subjectId}', { index: index, collectionId: collectionId, subjectId: req.params.subjectId });
    }));
  }).then(function () {
    return res.status(204).send();
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err, message: 'Could not position collections' });
  });
});

router.post('/', authentication(true), function (req, res) {
  return db.one("insert into subjects (code, name, published) values (${code}, ${name}, 'yes') returning *", req.body).then(function (subject) {
    return db.none('insert into favorites (user_id, subject_id) values (${userId}, ${subjectId})', {
      userId: req.user.id,
      subjectId: subject.id
    }).then(function () {
      return res.status(201).send(subject);
    });
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

router.post('/:subjectId/collections', authentication(true), function (req, res) {
  return db.one('insert into collections (name, subject_id) values (${name},${subjectId}) returning id', {
    name: req.body.name,
    subjectId: req.params.subjectId
  }).then(function (row) {
    return res.status(201).send(row);
  }).catch(function (err) {
    return res.status(500).send({ err: err });
  });
});

router.get('/:subjectId/ranking', function (req, res) {
  db.any(sql.subjects.ranking, { subjectId: req.params.subjectId }).then(function (rankings) {
    return res.status(200).send(rankings);
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

router.get('/', [authentication(true)], function (req, res) {
  return db.any(sql.subjects.findAll, {
    userId: req.user.id,
    search: req.query.search || ''
  }).then(function (subjects) {
    return res.status(200).send(normalizr.normalize(subjects, [subjectSchema]));
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

router.get('/default', authentication(false), function (req, res) {
  return res.redirect('/subjects/' + process.env.DEFAULT_SUBJECT_ID);
});

(0, _common.get)('/:subjectId', authentication(true), function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
    var result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return db.one(sql.subjects.findById, {
              subjectId: req.params.subjectId,
              userId: req.user.id
            });

          case 2:
            result = _context2.sent;
            return _context2.abrupt('return', normalizr.normalize(result, subjectSchema));

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

router.get('/:subjectId/quiz', authentication(true), function (req, res) {
  return db.any(sql.subjects.findPopularCollections, {
    subjectId: req.params.subjectId,
    count: 3
  }).then(function (collections) {
    return res.redirect('/collections/' + _.sample(collections).id + '/quiz?type=daily&size=4');
  }).catch(function (err) {
    return res.status(500).send({ err: err });
  });
});

router.get('/:subjectId/collections', authentication(true), function (req, res) {
  return db.any(sql.subjects.findCollections, {
    userId: req.user.id,
    subjectId: req.params.subjectId
  }).then(function (collections) {
    return res.status(200).send(normalizr.normalize(collections, [collectionSchema]));
  }).catch(function (err) {
    return res.status(500).send({ err: err });
  });
});

router.post('/favorites', [authentication(true), bodyValidation({
  required: ['favorite', 'subjectId'],
  properties: { favorite: { type: 'boolean' }, subjectId: { type: 'number' } }
})], function (req, res) {
  var subjectId = req.body.subjectId,
      userId = req.user.id,
      onError = function onError(err) {
    return res.status(500).send({ err: err });
  },
      onSuccess = function onSuccess() {
    return res.status(204).send();
  };
  if (req.body.favorite) db.none(sql.subjects.addToFavorites, { userId: userId, subjectId: subjectId }).then(onSuccess).catch(onError);else db.none(sql.subjects.removeFromFavorites, { userId: userId, subjectId: subjectId }).then(onSuccess).catch(onError);
});

(0, _common.put)('/:subjectId', [], function (req) {
  return (0, _common.update)('subjects', req.params.subjectId, req.body);
})(router);

module.exports = router;