'use strict';

var mongoose = require('mongoose'),
  chalk        = require('chalk'),
  crypto       = require('crypto'),
  _            = require('lodash'),
  configs      = require('./configs.json'),
  User         = mongoose.model('User'),
  Activity     = mongoose.model('Activity'),
  Phase        = mongoose.model('Phase'),
  Bucket       = mongoose.model('Bucket'),
  Task         = mongoose.model('Task'),
  Milestone    = mongoose.model('Milestone'),
  Requirement  = mongoose.model('Requirement'),
  Integration  = mongoose.model('Integration');

console.log(chalk.bold.red('Warning:  Database seeding is turned on'));

//If production only seed admin if it does not exist
if (process.env.NODE_ENV === 'production') {
  //Add Local Admin
  User.find({username: 'admin'}, function (err, users) {
    if (users.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);
      var user = new User({
        username: 'admin',
        password: 'eaoadmin2016!',
        provider: 'local',
        email: 'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user', 'admin']
      });
      // Then save the user
      user.save(function (err) {
        if (err) {
          console.log('Failed to add local admin', err);
        } else {
          console.log(chalk.bold.red('Local admin added with password set to ' + password));
        }
      });
    } else {
      console.log('Admin user exists');
    }
  });
} else {
  //Add Local User
  User.find({username: 'user'}, function (err, users) {
    if (users.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);
      var user = new User({
        username: 'user',
        password: 'user',
        provider: 'local',
        email: 'user@localhost.com',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        roles: ['user']
      });
      // Then save the user
      user.save(function (err) {
        if (err) {
          console.log('Failed to add local user', err);
        } else {
          console.log(chalk.bold.red('Local user added with password set to ' + password));
        }
      });
    }
  });


  //Add Local Admin
  User.find({username: 'admin'}, function (err, users) {
    if (users.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);
      var user = new User({
        username: 'admin',
        password: 'admin',
        provider: 'local',
        email: 'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user', 'admin']
      });
      // Then save the user
      user.save(function (err) {
        if (err) {
          console.log('Failed to add local admin', err);
        } else {
          console.log(chalk.bold.red('Local admin added with password set to ' + password));
        }
      });
    }
  });
}

Integration.findOne ({module:'configs'}).exec()
.then (function (row) {
  if (!row) {
    var i = new Integration ({module:'configs'});
    i.save ();
    console.log ('++ Adding default configuration objects');
    //activity phase bucket task milestone requirement
    var a = [
      {m:Activity, s:'activity',p:'activities'},
      {m:Phase, s:'phase',p:'phases'},
      {m:Bucket, s:'bucket',p:'buckets'},
      {m:Task, s:'task',p:'tasks'},
      {m:Milestone, s:'milestone',p:'milestones'},
      {m:Requirement, s:'requirement',p:'requirements'}
    ];
    _.each (a, function (o) {
      o.m.find ({project:null, stream:null}).remove (function () {
        _.each (configs[o.p], function (obj) {
          var m = new o.m ();
          m[o.s] = m._id;
          m.save ();
        });
      });
    });
  }
});
