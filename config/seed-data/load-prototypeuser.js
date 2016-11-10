'use strict';
var mongoose = require ('mongoose');
var User = mongoose.model ('User');
// var Role = mongoose.model ('Role');
var chalk         = require('chalk');
var crypto        = require('crypto');


module.exports = function () {

	User.find({username: 'prototype'}, function (err, users) {
		if (users.length === 0) {
			var password = crypto.randomBytes(64).toString('hex').slice(1, 8);
			var pwoutput = ".";
			if (process.env.PROTOTYPEPW) {
				password = process.env.PROTOTYPEPW;
			} else {
				 pwoutput = " with password set to " + password;
			}
			var user = new User ({
				username    : 'prototype',
				password    : password,
				provider    : 'local',
				email       : 'prototype@localhost.com',
				firstName   : 'MMTI',
				lastName    : 'Prototype',
				displayName : 'MMTI Prototype',
				orgCode     : 'mmti',
				roles       : ['user', 'prototype']
			});
			// Then save the user
			user.save(function (err, model) {
				if (err) {
					console.log('Failed to add MMTI Prototype user', err);
				} else {
					console.log(chalk.bold.red('MMTI Prototype user added' + pwoutput));
				}
			});
		} else {
			console.log('MMTI Prototype user exists');
		}
	});
};
