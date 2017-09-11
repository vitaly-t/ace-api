const { create, read, readOne, update, get, put, post, del } = require('./common.js');
const express = require('express'),
  db = require('db'),
  sql = require('../services/sql'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken');

module.exports.getUserByFacebookOrDevice = async id => {
  const result = await readOne('v_users', `device_id='${id}' or facebook_id='${id}'`);
  const token = jwt.sign({ user: result }, process.env.SECRET, { expiresIn: '30 days' });
  return { user: result, token };
};

module.exports.getUser = async facebookIdOrDeviceId => {
  const user = await readOne(
    'v_users',
    `facebook_id=${facebookIdOrDeviceId.toString()} or device_id=${facebookIdOrDeviceId.toString()} or id=${parseInt(facebookIdOrDeviceId)}`
  );
  const token = jwt.sign({ user }, process.env.SECRET, {
    expiresIn: '30 days',
  });
  return { user, token };
};
