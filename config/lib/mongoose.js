'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose');
  // mongoose's promise library is deprecated, make use of the native promises instead
  mongoose.Promise = Promise;
// Load the mongoose models
module.exports.loadModels = function () {
  // Globbing model files
  config.files.server.models.forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });
};

// Initialize Mongoose
module.exports.connect = function (callback) {
  var _this = this;

  var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
    // Log Error
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    } else {

      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (callback) callback(db);
    }
  });
};

module.exports.disconnect = function (callback) {
  mongoose.disconnect(function (err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    callback(err);
  });
};

module.exports.dropDatabase = function(callback) {
  console.log(chalk.white('Mongoose drop database...'));//eslint-disable-line

  var MongoClient = require('mongodb').MongoClient;

  console.log(chalk.white("Connecting to database server ..."));//eslint-disable-line
  console.log(chalk.white("config.db.uri: ", config.db.uri));//eslint-disable-line

  MongoClient.connect(config.db.uri, function(err, client) {
    if(err) {
      console.error(err);//eslint-disable-line
      return;
    }

    console.log("Connected to database server ...");//eslint-disable-line

    var db = client.db(config.db.name);

    db.dropDatabase(function(err){
      if (err) {
        throw err;
      }
      client.close();
    });

    if(callback) {
      callback();
    }
  });
}
