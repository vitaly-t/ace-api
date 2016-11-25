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
  req.web = req.get('platform') == 'web';
  res.header('Api-Version', process.env.API_VERSION || 0);
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Access-Token, Origin, X-Requested-With, Content-Type, Accept, Client-Id, Platform");
  next();
});

app.use('/', require('./routes/index'));
app.use('/subjects', require('./routes/subjects'));
app.use('/collections', require('./routes/collections'));
app.use('/exercises', require('./routes/exercises'));
app.use('/analytics', require('./routes/analytics'));

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