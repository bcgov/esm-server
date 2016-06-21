'use strict';

/**
 * Module dependencies.
 */
var policy = require('../policies/admin.server.policy');
var UserCtrl = require('../controllers/admin.server.controller');
var helpers = require('../../../core/server/controllers/core.helpers.controller');
// var RoleCtrl = require(require('path').resolve('./modules/roles/server/controllers/role.controller'));
var _ = require('lodash');
var User = require('mongoose').model('User');
// var Role = require('mongoose').model('Role');

module.exports = function (app) {
	helpers.setCRUDRoutes(app, 'user', UserCtrl, policy);

	// just create a new user if required... add them to the roles...
	app.route('/api/onboardUser').all(policy.isAllowed)
		.post(function (req, res) {
			//
			// TBD ROLES
			// this all has to be rewritten
			//
			Promise.then.resolve ({}).then(helpers.success(res), helpers.failure(res));
			// var _user;

			// (new UserCtrl(req.user)).findOne({email: req.body.email.toLowerCase()})
			// 	.then(function (user) {
			// 		if (!user) {
			// 			var u = new User();
			// 			u.set(req.body);
			// 			return u.save();
			// 		} else {
			// 			user.set(req.body);
			// 			return user.save();
			// 		}
			// 	})
			// 	//.catch(function(err) {
			// 	//	console.error(err);
			// 	//})
			// 	.then(function (user) {
			// 		_user = user;
			// 		if (_.isEmpty(user.roles)) {
			// 			return [];
			// 		} else {
			// 			return new Promise(function(fulfill, reject) {
			// 				Role.find({code: {$in: user.roles}, users : {$nin: [_user]}})
			// 					.populate('users')
			// 					.exec()
			// 					.then(function(roles) {
			// 						fulfill(roles);
			// 					});
			// 			});
			// 		}
			// 	})
			// 	.then(function(roles) {
			// 			var a = roles.map(function (role) {
			// 				return new Promise(function(fulfill, reject) {
			// 					role.users.push(_user);
			// 					fulfill(role.save());
			// 				});
			// 			});
			// 			return Promise.all(a);
			// 	})
			// 	.then(function (data) {
			// 		//console.log(data);
			// 		return data;
			// 	})
			// 	.then(helpers.success(res), helpers.failure(res));
		});
};
