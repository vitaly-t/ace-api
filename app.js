var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  req.clientId = req.get('Client-Id') || undefined;
  next();
});

app.use('/subjects', require('./routes/subjects'));
app.use('/exercises', require('./routes/exercises'));

// catch 404 and forward to error handler
app.use(function(req, res) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).send({
    message: err.message,
    error: err
  });
});

module.exports = app;