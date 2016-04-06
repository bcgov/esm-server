'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  passport = require('passport'),
  UniqueTokenStrategy = require('passport-unique-token').Strategy,
  User = require('mongoose').model('User');

module.exports = function (config) {
  // Use token strategy
  passport.use(new UniqueTokenStrategy({
      tokenQuery: config.token.tokenQuery,
      tokenParams: config.token.tokenParams,
      tokenField: config.token.tokenField,
      tokenHeader: config.token.tokenHeader,
      failedOnMissing: config.token.failedOnMissing
    },
    function (token, done) {
      User.findOne({ userGuid: token.toLowerCase() }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      });
    }
  ));
};
