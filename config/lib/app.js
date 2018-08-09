'use strict';

var config = require('../config');
var mongoose = require('./mongoose');
var express = require('./express');
var chalk = require('chalk');

// Initialize Models
mongoose.loadModels();

// Seed the database if enabled.  See config/env/development.js - seedDB
if (config.seedDB) {
  require('./seed');
}

module.exports.loadModels = function loadModels() {
  mongoose.loadModels();
};

module.exports.init = function init(callback) {
  mongoose.connect(function (db) {
    var app = express.init(db);
    if (callback) {
      callback(app, db, config);
    }
  });
};

module.exports.start = function start(callback) {
  var self = this;
  self.init(function (app, db, config) {
    // Start the app by listening on <port>
    app.listen(config.port, function () {
      // Logging initialization
      /* eslint-disable no-console */
      console.log('-------------------------------------------');
      console.log(chalk.green(config.app.title));
      console.log(chalk.green('Environment:\t' + process.env.NODE_ENV));
      console.log(chalk.green('Port:\t\t' + config.port));
      console.log(chalk.green('Database:\t' + config.db.uri));
      if (process.env.NODE_ENV === 'secure') {
        console.log(chalk.green('HTTPs:\t\ton'));
      }
      console.log('-------------------------------------------');
      /* eslint-enable no-console */
      if (callback) {
        callback(app, db, config);
      }
    });
  });
};
