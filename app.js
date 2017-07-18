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
app.use('/', require('./src/routes/index'));
app.use('/subjects', require('./src/routes/subjects'));
app.use('/collections', require('./src/routes/collections'));
app.use('/exercises', require('./src/routes/exercises'));
app.use('/users', require('./src/routes/users'));
app.use('/answers', require('./src/routes/answers'));
app.use('/comments', require('./src/routes/comments'));
app.use('/schools', require('./src/routes/schools'));

module.exports = app;
