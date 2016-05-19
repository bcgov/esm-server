'use strict';
var mongoose = require ('mongoose');
var User = mongoose.model ('User');
var Role = mongoose.model ('Role');
var chalk         = require('chalk');
var crypto        = require('crypto');


module.exports = function () {
	//Add Local Admin
	User.find({username: 'admin'}, function (err, users) {
		if (users.length === 0) {
			var password = crypto.randomBytes(64).toString('hex').slice(1, 8);
			if (process.env.ADMINPW) {
				// console.log("Overriding generated password: ",process.env.ADMINPW);
				password = process.env.ADMINPW;
			}
			var user = new User ({
				username    : 'admin',
				password    : password,
				provider    : 'local',
				email       : 'admin@localhost.com',
				firstName   : 'Admin',
				lastName    : 'Local',
				displayName : 'Admin Local',
				orgCode     : 'eao',
				roles       : ['user', 'admin']
			});
			// Then save the user
			user.save(function (err, model) {
				if (err) {
					console.log('Failed to add local admin', err);
				} else {
					console.log(chalk.bold.red('Local admin added.'));
					var role = new Role ({
						code     : 'admin',
						isSystem : true,
						users    : [model._id]
					});
					role.save ();
				}
			});
		} else {
			console.log('Admin user exists');
		}
	});
};
