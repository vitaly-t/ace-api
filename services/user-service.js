import { create, read, update, get, put, post, del } from './common.js';
const express = require('express'),
  db = require('db'),
  sql = require('../services/sql'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken');

export const getUserByFacebookOrDevice = async id => {
  const result = await read('users_view', `device_id='${id}' or facebook_id='${id}'`);
  const token = jwt.sign({ user: result[0] }, process.env.SECRET, { expiresIn: '30 days' });
  console.log({ user: result[0], token });
  return { user: result[0], token };
};

export const getUser = (facebookIdOrDeviceId, callback) =>
  db
    .one(sql.users.findOne, { id: facebookIdOrDeviceId })
    .then(user => {
      const token = jwt.sign({ user }, process.env.SECRET, {
        expiresIn: '30 days',
      });
      callback(null, _.extend({ user }, { token }));
    })
    .catch(err => {
      console.log(err);
      callback(new Error('User not found'));
    });
