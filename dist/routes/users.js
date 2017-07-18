'use strict';

var _common = require('../services/common.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var GRAPH_URL = 'https://graph.facebook.com',
    express = require('express'),
    router = express.Router(),
    db = require('db'),
    sql = require('../services/sql'),
    bodyValidation = require('body-validation'),
    morsommeNavn = require('morsomme-navn'),
    userService = require('../services/user-service'),
    authentication = require('../middleware/user-authentication'),
    _ = require('underscore'),
    superagent = require('superagent-as-promised')(require('superagent'));

var findValidUsername = function findValidUsername(username) {
  return db.none('select * from users where username=${username}', { username: username }).then(function () {
    return username;
  }).catch(function (err) {
    return findValidUsername(username + Math.floor(Math.random() * 10), callback);
  });
};

router.get('/notifications', authentication(true), function (req, res) {
  return db.any(sql.users.notifications, {
    userId: req.user.id,
    lastChecked: req.user.last_checked_notifications
  }).then(function (feed) {
    return db.none('update users set last_checked_notifications=now() where id=${userId}', {
      userId: req.user.id
    }).then(function () {
      return res.status(200).send(_.map(feed, function (a) {
        return a.activity;
      }));
    });
  }).catch(function (err) {
    console.log(err);
    res.status(500).send({ err: err });
  });
});

(0, _common.post)('/anonymous', bodyValidation({
  required: ['deviceId'],
  properties: { deviceId: { type: 'string' } }
}), function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var username;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return findValidUsername(morsommeNavn.generate());

          case 2:
            username = _context.sent;
            return _context.abrupt('return', (0, _common.create)('users', { username: username, device_id: req.body.deviceId }));

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

router.post('/facebook_connection', bodyValidation({
  required: ['deviceId', 'facebookToken', 'username'],
  properties: {
    deviceId: { type: 'string' },
    facebookToken: { type: 'string' },
    username: {
      type: 'string',
      minLength: 6,
      maxLength: 25
    }
  }
}), function (req, res) {
  return superagent.get(GRAPH_URL + '/me?access_token=' + req.body.facebookToken).then(function (res) {
    return JSON.parse(res.text).id;
  }).then(function (facebookId) {
    return db.none(sql.users.connectAnonToFace, {
      username: req.body.username,
      facebookId: facebookId,
      deviceId: req.body.deviceId
    }).then(function () {
      return userService.getUser(facebookId, function (err, user) {
        if (err) return res.status(500).send({ message: 'This should never happen' });
        res.status(201).send(user);
      });
    }).catch(function (err) {
      return res.status(500).send();
    });
  }).catch(function (err) {
    return res.status(400).send({ err: err });
  });
});

router.post('/facebook', bodyValidation({
  required: ['facebookToken'],
  properties: { facebookToken: { type: 'string' } }
}), function (req, res) {
  return superagent.get(GRAPH_URL + '/me?access_token=' + req.body.facebookToken).then(function (res) {
    return JSON.parse(res.text).id;
  }).then(function (facebookId) {
    return findValidUsername(morsommeNavn.generate()).then(function (username) {
      return db.none(sql.users.create, { username: username, facebookId: facebookId }).then(function () {
        console.log('lol');
        userService.getUser(facebookId, function (err, user) {
          if (err) return res.status(500).send({ message: 'This should never happen' });
          res.status(201).send(user);
        });
      });
    }).catch(function (err) {
      console.log(err);
      res.status(500).send();
    });
  }).catch(function (err) {
    console.log(err);
    res.status(400).send({ err: err });
  });
});

router.put('/me', [bodyValidation({
  required: ['lastSubjectId'],
  properties: {
    lastSubjectId: { type: 'integer' }
  }
}), authentication(true)], function (req, res) {
  return db.one('update users set last_subject_id=${lastSubjectId} where id=${userId} returning *', {
    lastSubjectId: req.body.lastSubjectId,
    userId: req.user.id
  }).then(function (row) {
    return res.redirect(303, '/subjects/' + req.body.lastSubjectId);
  }).catch(function (err) {
    return res.status(500).send({ err: err, message: "Couldn't update lastSubjectId" });
  });
});

module.exports = router;