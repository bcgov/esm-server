'use strict';
var mongoose = require ('mongoose');
var User     = mongoose.model ('User');
// var Role     = mongoose.model ('Role');
var userlist = require ('./userlist');
var _        = require ('lodash');
var chalk         = require('chalk');

module.exports = function () {
	console.log ('Starting Add Non-production Users', userlist);
	_.each (userlist, function (orglist, orgCode) {
		console.log ('users for '+orgCode);
		_.each (orglist, function (user) {
			//
			// apply defaults
			//
			user = _.extend ({
				username  : '',
				firstName : '',
				lastName  : '',
				orgCode   : orgCode,
				password  : 'password',
				provider  : 'local'
			}, user);
			//
			// ensure at minimum user role
			//
			if (!user.roles) user.roles = [];
			user.roles.push ('user');
			if (orgCode === 'eao') user.roles.push ('eao');
			else user.roles.push ('proponent');
			//
			// set username if not set
			//
			if (user.username === '') user.username = user.firstName.toLowerCase() + '.' + user.lastName.toLowerCase();
			//
			// set display name and email
			//
			user.displayName = (user.firstName + ' ' + user.lastName).trim();
			user.email       = user.username + '@localhost.com';
			//
			// do it
			//
			User.find ({username: user.username}, function (err, result) {
				if (result.length === 0) {
					var u = new User (user);
					u.save(function (err, usermodel) {
						if (err) {
							console.log ('Failed to add user ', user.username, err);
						} else {
							console.log (chalk.bold.red ('added user ', user.username));
							_.each (usermodel.roles, function (role) {
								if (role !== 'user') {
									console.log ('adding user to role ', role);
									//
									// TBD ROLES : this bit needs replacing
									//
									// Role.findOne ({code:role}, function (err, rolemodel) {
									// 	if (err) {
									// 		return err;
									// 	}
									// 	else if (rolemodel) {
									// 		rolemodel.users = _.union (rolemodel.users, [usermodel._id.toString()]);
									// 	}
									// 	else {
									// 		var isSystem = (role === 'admin' || (role.match(/^sector/) !== null));
									// 		rolemodel = new Role ({
									// 			code     : role,
									// 			isSystem : isSystem,
									// 			users    : [usermodel._id]
									// 		});
									// 	}
									// 	rolemodel.save ();
									// });
								}
							});
						}
					});
				} else {
					console.log('user '+user.username+' exists');
				}
			});
		});
	});
};
