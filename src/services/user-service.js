import { create, read, readOne, update, get, put, post, del } from './common.js';
const express = require('express'),
  db = require('db'),
  sql = require('../services/sql'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken');

export const getUserByFacebookOrDevice = async id => {
  console.log('ID', id);
  const result = await readOne('users', `device_id='${id}' or facebook_id='${id}'`);
  console.log('RESULT', result);
  const token = jwt.sign({ user: result }, process.env.SECRET, { expiresIn: '30 days' });
  console.log({ user: result, token });
  return { user: result, token };
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