import _ from 'lodash';
import express from 'express';
import db from 'db';
import sql from '../services/sql';

export const create = (table, entity) =>
  db.one(
    `INSERT INTO \${table~} (${_.keys(entity)}) VALUES (${_.map(_.keys(entity), key => `\${${key}}`)}) RETURNING *`,
    { table, ...entity }
  );

export const read = (table, where = true) => db.any(sql.common.find, { table, where });

export const update = (table, id, entity) => {
  console.log(
    `update \${table~} set ${_.map(_.keys(entity), key => `${key}=\${${key}}`)} where id=\${id} RETURNING *`
  );
  return db.one(
    `update \${table~} set ${_.map(_.keys(entity), key => `${key}=\${${key}}`)} where id=\${id} RETURNING *`,
    { table, id, ...entity }
  );
};

export const remove = (table, id) => db.one(sql.common.delete, { table, id });

export const get = (path, middleware, func) => router =>
  router.get(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

export const put = (path, middleware, func) => router =>
  router.put(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(200).json({ result, activity: req.activity });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

export const post = (path, middleware, func) => router =>
  router.post(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(201).json({ result, activity: req.activity });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

export const del = (path, middleware, func) => router =>
  router.delete(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(204).json({ message: 'Successfully deleted entity' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });
