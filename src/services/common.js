const _ = require('lodash');
const express = require('express');
const db = require('db');
const sql = require('../services/sql');
const normalizr = require('normalizr');
const feedSchema = new normalizr.schema.Entity('feed');

const getNotifications = async (subscriber, userId, excludeUserId = 0) => {
  const result = await db.any(sql.common.notifications, { subscriber, userId, excludeUserId });
  return normalizr.normalize(result, [feedSchema]);
};

const commentResource = async (userId, resourceType, resourceId, message) => {
  const result = await create('comments', { message, resource_id: resourceId });
  await Promise.all([
    db.one(sql.common.publish, {
      activity: `COMMENT_${_.upperCase(resourceType.slice(0, -1))}`,
      publisher: resourceId,
      userId,
    }),
    await db.none(sql.common.subscribe, {
      publisher: result.id,
      subscriber: userId,
    }),
  ]);
  return result;
};

const create = async (table, entity) => {
  const result = await db.oneOrNone(
    `INSERT INTO \${table~} (${_.keys(entity)}) VALUES (${_.map(_.keys(entity), key => `\${${key}}`)}) ON CONFLICT DO NOTHING RETURNING *;`,
    { table, ...entity }
  );
  return (
    result ||
    (await db.one(
      `SELECT * from \${table~} where ${_.map(_.keys(entity), key => `${key} = \${${key}}`).join(' and ')}`,
      { table, ...entity }
    ))
  );
};

const read = (table, where = true) => db.any(sql.common.find, { table, where });
const readOne = (table, where = true) => db.one(sql.common.find, { table, where });

const update = (table, id, entity) => {
  console.log(
    `update \${table~} set ${_.map(_.keys(entity), key => `${key}=\${${key}}`)} where id=\${id} RETURNING *`
  );
  return db.one(
    `update \${table~} set ${_.map(_.keys(entity), key => `${key}=\${${key}}`)} where id=\${id} RETURNING *`,
    { id, table, ...entity }
  );
};

const remove = (table, id) => db.one(sql.common.delete, { table, id });

const get = (path, middleware, func) => router =>
  router.get(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

const put = (path, middleware, func) => router =>
  router.put(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(200).json({ result, activity: req.activity });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

const post = (path, middleware, func) => router =>
  router.post(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(201).json({ result, activity: req.activity });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

const del = (path, middleware, func) => router =>
  router.delete(path, middleware, async (req, res) => {
    try {
      const result = await func(req, res);
      res.status(204).json({ message: 'Successfully deleted entity' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  });

module.exports = {
  getNotifications,
  commentResource,
  create,
  read,
  readOne,
  update,
  remove,
  get,
  put,
  post,
  del,
};
