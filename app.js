var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Access-Token, Origin, X-Requested-With, Content-Type, Accept, Client-Id, Platform'
  );
  console.log(req.body);
  next();
});
app.use('/', require('./dist/routes/index'));
app.use('/subjects', require('./dist/routes/subjects'));
app.use('/collections', require('./dist/routes/collections'));
app.use('/exercises', require('./dist/routes/exercises'));
app.use('/users', require('./dist/routes/users'));
app.use('/answers', require('./dist/routes/answers'));
app.use('/comments', require('./dist/routes/comments'));
app.use('/schools', require('./dist/routes/schools'));

module.exports = app;
