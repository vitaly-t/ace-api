const _ = require('lodash');
const express = require('express');
const db = require('db');
const sql = require('../services/sql');

module.exports.create = (table, entity) =>
  db.one(
    `INSERT INTO \${table~} (${_.keys(entity)}) VALUES (${_.map(_.keys(entity), key => `\${${key}}`)}) RETURNING *`,
    { table, ...entity }
  );

module.exports.read = (table, where = true) => db.many(sql.common.find, { table, where });
module.exports.readOne = (table, where = true) => db.one(sql.common.find, { table, where });

module.exports.update = (table, id, entity) => {
  console.log('ENTITY', entity);
  console.log(
    `update \${table~} set ${_.map(_.keys(entity), key => `${key}=\${${key}}`)} where id=\${id} RETURNING *`
  );
  return db.one(
    `update \${table~} set ${_.map(_.keys(entity), key => `${key}=\${${key}}`)} where id=\${id} RETURNING *`,
    { id, table, ...entity }
  );
};

module.exports.remove = (table, id) => db.one(sql.common.delete, { table, id });

module.exports.get = (path, middleware, func) => router =>
  router.get(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

module.exports.put = (path, middleware, func) => router =>
  router.put(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(200).json({ result, activity: req.activity });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

module.exports.post = (path, middleware, func) => router =>
  router.post(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(201).json({ result, activity: req.activity });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

module.exports.del = (path, middleware, func) => router =>
  router.delete(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(204).json({ message: 'Successfully deleted entity' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });
