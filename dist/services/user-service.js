'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUser = exports.getUserByFacebookOrDevice = undefined;

var _common = require('./common.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express'),
    db = require('db'),
    sql = require('../services/sql'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken');

var getUserByFacebookOrDevice = exports.getUserByFacebookOrDevice = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(id) {
    var result, token;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log('ID', id);
            _context.next = 3;
            return (0, _common.readOne)('users', 'device_id=\'' + id + '\' or facebook_id=\'' + id + '\'');

          case 3:
            result = _context.sent;

            console.log('RESULT', result);
            token = jwt.sign({ user: result }, process.env.SECRET, { expiresIn: '30 days' });

            console.log({ user: result, token: token });
            return _context.abrupt('return', { user: result, token: token });

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getUserByFacebookOrDevice(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getUser = exports.getUser = function getUser(facebookIdOrDeviceId, callback) {
  return db.one(sql.users.findOne, { id: facebookIdOrDeviceId }).then(function (user) {
    var token = jwt.sign({ user: user }, process.env.SECRET, {
      expiresIn: '30 days'
    });
    callback(null, _.extend({ user: user }, { token: token }));
  }).catch(function (err) {
    console.log(err);
    callback(new Error('User not found'));
  });
};