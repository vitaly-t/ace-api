'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.del = exports.post = exports.put = exports.get = exports.remove = exports.update = exports.readOne = exports.read = exports.create = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _db = require('db');

var _db2 = _interopRequireDefault(_db);

var _sql = require('../services/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var create = exports.create = function create(table, entity) {
  return _db2.default.one('INSERT INTO ${table~} (' + _lodash2.default.keys(entity) + ') VALUES (' + _lodash2.default.map(_lodash2.default.keys(entity), function (key) {
    return '${' + key + '}';
  }) + ') RETURNING *', _extends({ table: table }, entity));
};

var read = exports.read = function read(table) {
  var where = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return _db2.default.many(_sql2.default.common.find, { table: table, where: where });
};
var readOne = exports.readOne = function readOne(table) {
  var where = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return _db2.default.one(_sql2.default.common.find, { table: table, where: where });
};

var update = exports.update = function update(table, id, entity) {
  console.log('ENTITY', entity);
  console.log('update ${table~} set ' + _lodash2.default.map(_lodash2.default.keys(entity), function (key) {
    return key + '=${' + key + '}';
  }) + ' where id=${id} RETURNING *');
  return _db2.default.one('update ${table~} set ' + _lodash2.default.map(_lodash2.default.keys(entity), function (key) {
    return key + '=${' + key + '}';
  }) + ' where id=${id} RETURNING *', _extends({ table: table, id: id }, entity));
};

var remove = exports.remove = function remove(table, id) {
  return _db2.default.one(_sql2.default.common.delete, { table: table, id: id });
};

var get = exports.get = function get(path, middleware, func) {
  return function (router) {
    return router.get(path, middleware, function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
        var result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return func(req, res);

              case 3:
                result = _context.sent;

                res.status(200).json(result);
                _context.next = 11;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context['catch'](0);

                console.log(_context.t0);
                res.status(500).json({ err: _context.t0 });

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined, [[0, 7]]);
      }));

      return function (_x3, _x4) {
        return _ref.apply(this, arguments);
      };
    }());
  };
};

var put = exports.put = function put(path, middleware, func) {
  return function (router) {
    return router.put(path, middleware, function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
        var result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return func(req, res);

              case 3:
                result = _context2.sent;

                res.status(200).json({ result: result, activity: req.activity });
                _context2.next = 11;
                break;

              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2['catch'](0);

                console.log(_context2.t0);
                res.status(500).json({ err: _context2.t0 });

              case 11:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, undefined, [[0, 7]]);
      }));

      return function (_x5, _x6) {
        return _ref2.apply(this, arguments);
      };
    }());
  };
};

var post = exports.post = function post(path, middleware, func) {
  return function (router) {
    return router.post(path, middleware, function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
        var result;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return func(req, res);

              case 3:
                result = _context3.sent;

                res.status(201).json({ result: result, activity: req.activity });
                _context3.next = 11;
                break;

              case 7:
                _context3.prev = 7;
                _context3.t0 = _context3['catch'](0);

                console.log(_context3.t0);
                res.status(500).json({ err: _context3.t0 });

              case 11:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined, [[0, 7]]);
      }));

      return function (_x7, _x8) {
        return _ref3.apply(this, arguments);
      };
    }());
  };
};

var del = exports.del = function del(path, middleware, func) {
  return function (router) {
    return router.delete(path, middleware, function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
        var result;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                _context4.next = 3;
                return func(req, res);

              case 3:
                result = _context4.sent;

                res.status(204).json({ message: 'Successfully deleted entity' });
                _context4.next = 11;
                break;

              case 7:
                _context4.prev = 7;
                _context4.t0 = _context4['catch'](0);

                console.log(_context4.t0);
                res.status(500).json({ err: _context4.t0 });

              case 11:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined, [[0, 7]]);
      }));

      return function (_x9, _x10) {
        return _ref4.apply(this, arguments);
      };
    }());
  };
};