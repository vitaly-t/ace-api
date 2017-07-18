'use strict';

var _common = require('../services/common.js');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _userService = require('../services/user-service.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var GRAPH_URL = 'https://graph.facebook.com',
    express = require('express'),
    router = express.Router(),
    superagent = require('superagent-as-promised')(require('superagent')),
    db = require('db'),
    sql = require('../services/sql'),
    authentication = require('../middleware/user-authentication'),
    checkParams = require('../middleware/check-params'),
    userService = require('../services/user-service');

router.get('/me', authentication(true), function (req, res) {
  return userService.getUser(req.user.id.toString(), function (err, user) {
    if (err) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(user);
  });
});
(0, _common.get)('/token', [], function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var facebookToken, facebookId, response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            facebookToken = req.query.facebook_token;
            facebookId = void 0;

            if (!facebookToken) {
              _context.next = 7;
              break;
            }

            _context.next = 5;
            return superagent.get(GRAPH_URL + '/me?access_token=' + facebookToken);

          case 5:
            response = _context.sent;

            facebookId = JSON.parse(response.text).id;

          case 7:
            _context.next = 9;
            return (0, _userService.getUserByFacebookOrDevice)(req.query.device_id || facebookId);

          case 9:
            return _context.abrupt('return', _context.sent);

          case 10:
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

router.delete('/:resource/:id', [authentication(true), checkParams('resource', ['subjects', 'collections'])], function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
    var result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return (0, _common.remove)(req.params.resource, req.params.id);

          case 3:
            result = _context2.sent;

            res.status(204).send(result);
            _context2.next = 11;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2['catch'](0);

            console.log(_context2.t0);
            res.status(500).send({ err: _context2.t0 });

          case 11:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[0, 7]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

module.exports = router;