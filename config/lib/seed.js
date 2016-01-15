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
  Project      = mongoose.model('Project'),
  Stream      = mongoose.model('Stream'),
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
        password: password,
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

  // Add Vetting User
  User.find({username: 'vetting'}, function (err, users) {
    if (users.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);
      var user = new User({
        username: 'vetting',
        password: 'vetting',
        provider: 'local',
        email: 'vetting@localhost.com',
        firstName: 'vetting',
        lastName: 'Local',
        displayName: 'vetting Local',
        roles: ['user', 'vetting']
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

  // Add Classification User
  User.find({username: 'classify'}, function (err, users) {
    if (users.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);
      var user = new User({
        username: 'classify',
        password: 'classify',
        provider: 'local',
        email: 'classify@localhost.com',
        firstName: 'classify',
        lastName: 'Local',
        displayName: 'classify Local',
        roles: ['user', 'classify']
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


var doConfigs = function () {
    Project.find ({}).remove ();
    Stream.find ({}).remove ();
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
      o.m.find ({}).remove (function () {
        _.each (configs[o.p], function (obj) {
          var m = new o.m (obj);
          m[o.s] = m._id;
          m.save ();
        });
      });
    });

};


// check to see if the seed import executes
// insert ajax mine project
Integration.findOne ({module:'happy'}).exec()
.then (function (row) {
  if (!row) {

    doConfigs ();

		// Project.find({name: 'Ajax Mine Project'}).remove (function () {
		Project.remove (function () {
        var i = new Integration ({module:'ajax3'});
        i.save ();
			  var project = new Project({
				lat: 50.608817,
				lon: -120.405757,
				name: 'Ajax Mine Project',
				description: 'KGHM Ajax Mining Inc. proposes to develop the Ajax Project, a new open-pit copper/ gold mine located south of and adjacent to the City of Kamloops. The mine would have a production capacity of up to 24 million tonnes of ore per year, over an anticipated 23-year mine life.',
				type: 'Mining',
				location: 'Kamloops, BC',
				region: 'thompsonokanagan',
				dateCommentsClosed : '2016-04-12T06:55:00.000Z',
    			dateCommentsOpen : '2016-01-26T08:00:00.000Z'
			  });
			  // Then save the user
			  project.save(function (err) {
				if (err) {
				  console.log('Failed to add ajax', err);
				} else {
				  console.log(chalk.bold.red('Ajax project added'));
				}
			  });

		  });




  }
});


Integration.findOne ({module:'configs'}).exec()
.then (function (row) {
  if (!row) {
    doConfigs ();
  }
});










