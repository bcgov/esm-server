'use strict';

var path = require('path'),
    chalk = require('chalk'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');


var findUserBySiteminderHeaders = function (userGuid, userType, callback) {
  User.findOne({
      userGuid: userGuid.toLowerCase(), userType: userType.toLowerCase()
  }).populate('org').exec(function (error, user) {
      if (error) {
          return callback(new Error(error), null);
      } else if(!user) {
          return callback(new Error('User not found for Siteminder headers.'), null);
      } else {
          return callback(null, user);
      }
  });
};

exports.renderAsSiteminderIndex = function (req, res) {

  // production, we will only allow to get data from headers...
  // others can check query string too...
  var userGuid = req.headers.smgov_userguid;
  var userType = req.headers.smgov_usertype;

  if (process.env.NODE_ENV !== 'production') {
    userGuid = userGuid || req.params.userguid || req.query.smgov_userguid;
    userType = userType || req.params.usertype || req.query.smgov_usertype;
  }

  if (userGuid && userType) {
    req.logout();

    findUserBySiteminderHeaders(userGuid, userType, function(error, user) {
      if (error) {
        console.error(chalk.red('Error: findUserBySiteminderHeaders(): ' + error.message));
        res.redirect('/');
      } else {
        if (user) {
          req.login(user, function (err) {
            if (err) {
              // redirect to base, no user...
              console.error(chalk.red('Error: findUserBySiteminderHeaders.login(): ' + err.message));
              res.redirect('/');
            } else {
              // redirect to base, but we'll have a user logged in...
              res.redirect('/');
            }
          });
        } else {
          console.error(chalk.red('Error: findUserBySiteminderHeaders(): user not populated/loaded.'));
          res.redirect('/');
        }
      }
    });

  } else {
    // we don't do any user lookups/logins through this route in PROD.
    res.redirect('/', 302);
  }
};
