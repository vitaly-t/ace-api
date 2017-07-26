const _ = require('lodash');
const express = require('express');
const db = require('db');
const sql = require('../services/sql');
const normalizr = require('normalizr');
const feedSchema = new normalizr.schema.Entity('feed');

module.exports.getNotifications = async (
  subscriberType,
  subscriber,
  userId = 0,
  lastChecked = 'now()'
) => {
  const result = await db.any(sql.common.notifications, {
    subscriber,
    subscriberType,
    lastChecked,
    userId,
  });
  const notifications = _.map(result, row => {
    let generalNotification = {
      id: row.id,
      type: row.activity,
      hasSeen: row.has_seen,
      time: row.time,
    };
    let exerciseNotification = { link: `/exercises/${row.exercise.id}` };
    let collectionNotification = {
      link: `/topics/${row.collection.id}`,
    };
    switch (row.activity) {
      case 'COMMENT_EXERCISE':
        return {
          ...generalNotification,
          ...exerciseNotification,
          text: `${row.user.username} commented on exercise '${row.exercise.content.question.text}'`,
          symbol: 'comment-o',
        };
      case 'EDIT_EXERCISE':
        return {
          ...generalNotification,
          ...exerciseNotification,
          text: `${row.user.username} modified the exercise '${row.exercise.content.question.text}'`,
          symbol: 'angellist',
        };
      case 'CREATE_EXERCISE':
        return {
          ...generalNotification,
          ...exerciseNotification,
          text: `${row.user.username} created the exercise '${row.exercise.content.question.text}'`,
          symbol: 'tasks',
        };
      case 'CREATE_TOPIC':
        return {
          ...generalNotification,
          ...collectionNotification,
          text: `${row.user.username} created the topic '${row.collection.name}'`,
          symbol: 'comment-o',
        };
    }
  });
  return normalizr.normalize(notifications, [feedSchema]);
};

module.exports.create = (table, entity) =>
  db.one(
    `INSERT INTO \${table~} (${_.keys(entity)}) VALUES (${_.map(_.keys(entity), key => `\${${key}}`)}) RETURNING *`,
    { table, ...entity }
  );

module.exports.read = (table, where = true) => db.any(sql.common.find, { table, where });
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
      console.log('POST result', result);
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
