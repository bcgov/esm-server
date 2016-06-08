'use strict';
var _ = require('lodash');
var mongoose = require('mongoose');
var Role = mongoose.model('Role');
var list = require('./roledata');
var promise = require('promise');
var util = require('util');

var Users = mongoose.model('User');
var Projects = mongoose.model('Project');
var Activities = mongoose.model('Activity');
var Features = mongoose.model('Feature');
var Artifacts = mongoose.model('Artifact');
var Documents = mongoose.model('Document');
var Comments = mongoose.model('Comment');
// var PublicComments = mongoose.model('PublicComment');
var CommentPeriods = mongoose.model('CommentPeriod');
var list2 = require('./roledata2');
var ProjectCtrl = require(require('path').resolve('./modules/projects/server/controllers/project.controller'));
var RoleCtrl = require(require('path').resolve('./modules/roles/server/controllers/role.controller'));

module.exports.sysroles = function () {
	promise.resolve()
		.then(function () {
			return promise.all(list.map(function (role) {
				console.log('removing role ', role.code);
				return Role.remove({code: role.code});
			}));
		})
		.then(function () {
			return promise.all(list.map(function (role) {
				console.log('adding role ', role.code);
				var r = new Role(role);
				r.roleCode = r.code;
				return r.save();
			}));
		})
		.then(function () {
			console.log('all done adding some artifcat types and other things');
		})
		.catch(function (err) {
			console.log('oops, something went wrong', err);
		});

};

var goodRoleCode2 = function (code) {
	// leave these codes...
	// and any project roles with these codes.
	var goodRoles = ['mem', 'admin', 'public', 'user', 'eao', 'proponent', 'invitee'];
	var goodProjectRoles = [':eao:admin', ':eao:member', ':pro:admin', ':pro:member', ':eao:invitee', ':pro:invitee'];

	if (code.indexOf(':') > -1) {
		var s = code.substring(code.indexOf(':'));
		//console.log(code + ' -> ' + s);
		return _.includes(goodProjectRoles, s);
	} else {
		return _.includes(goodRoles, code);
	}
};

module.exports.sysroles2 = function () {
	// we want to remove a set of roles from existing collections
	// that will no longer exist
	// then remove those from roles
	// then add/update the new data...
	var deadRolesArray = [];
	var goodRolesArray = [];
	var classArray = [Projects, Users, Activities, Features, Artifacts, Documents, Comments, /*PublicComments,*/ CommentPeriods];
	var adminUser;
	return promise.resolve(Role.find({}))
		.then(function (roles) {
			console.log('1 ------------------------------');
			var a = _.map(roles, function (r) {
				return new promise(function (fulfill, reject) {
					if (!goodRoleCode2(r.code)) {
						//console.log('not a good code: ' + r.code);
						fulfill(deadRolesArray.push(r.code));
					} else {
						fulfill(goodRolesArray.push(r.code));
					}
				});
			});
			return promise.all(a);
		})
		.then(function (data) {
			console.log('2 ------------------------------');

			var a = _.map(classArray, function (clazz) {
				return new promise(function (fulfill, reject) {
					var modified = 0;
					var clazzname = clazz.modelName;
					console.log('removing dead roles from ' + clazzname);
					clazz.where()
						.update({'roles': {$in: deadRolesArray}},
							{
								$pull: {
									read: {$in: deadRolesArray},
									write: {$in: deadRolesArray},
									submit: {$in: deadRolesArray},
									watch: {$in: deadRolesArray},
									roles: {$in: deadRolesArray}
								}
							},
							{multi: true},
							function (err, numModified) {
								if (err) {
									reject(err);
								}
								console.log(clazzname + ' found: ' + numModified.n + ', modified: ' + numModified.nModified);
								fulfill(numModified.nModified);
							}
						);
				});
			});
			return promise.all(a);
		})
		.then(function (data) {
			console.log('3 ------------------------------');
			return Role.remove({code: {$in: deadRolesArray}});
		})
		.then(function (removeResult) {
			console.log('4 ------------------------------');
			console.log('Removed: ' + removeResult.result.n);

			var f = function (role) {
				return new promise(function (fulfill, reject) {
					Role.find({code: role.code}, function (err, foundrole) {
						//
						// if it does not exist, then save the one we made
						//
						if (!foundrole || _.isEmpty(foundrole)) {
							var r = new Role(role);
							console.log('adding: ' + r.code);
							fulfill(r.save());
						} else {
							console.log('updating: ' + role.code);
							_.merge(foundrole[0], role);
							fulfill(foundrole[0].save());
						}
					});
				});
			};

			var a = _.map(list2, function (role) {
				if (role.code === 'mem') {
					if (process.env.SEED_MEM === 'true') {
						return new promise(function (fulfill, reject) {
							fulfill(f(role));
						});
					} else {
						return promise.resolve();
					}
				} else {
					return new promise(function (fulfill, reject) {
						fulfill(f(role));
					});
				}
			});
			return promise.all(a);
		})
		.catch(function (err) {
			console.log('err ------------------------------', err);
		})
		.then(function (data) {
			console.log('5 ------------------------------');
			var rolez = [
				{code: 'eao:member', name: 'EAO Member', roleCode: 'member', orgCode: 'eao'},
				{code: 'eao:admin', name: 'EAO Admin', roleCode: 'admin', orgCode: 'eao'},
				{code: 'pro:member', name: 'Proponent Member', roleCode: 'member', orgCode: 'pro'},
				{code: 'pro:admin', name: 'Proponent Admin', roleCode: 'admin', orgCode: 'pro'},
				{code: 'eao:invitee', name: 'EAO Invitee', roleCode: 'invitee', orgCode: 'eao'},
				{code: 'pro:invitee', name: 'Proponent Invitee', roleCode: 'invitee', orgCode: 'pro'}

			];

			var a = _.map(rolez, function (r) {
				return new promise(function (fulfill, reject) {
					var modified = 0;
					console.log('updating existing role names');
					Role.where()
						.update({'code': new RegExp(r.code, 'i')},
							{
								$set: {
									orgCode: r.orgCode,
									roleCode: r.roleCode,
									name: r.name,
									isPermission: false
								}
							},
							{multi: true},
							function (err, numModified) {
								if (err) {
									reject(err);
								}
								console.log('Found: ' + numModified.n + ', modified: ' + numModified.nModified);
								fulfill(numModified.nModified);
							}
						);
				});
			});
			return promise.all(a);
		})
		.then(function (data) {
			console.log('6 ------------------------------');
			return Role.find({projectCode: ''});
		})
		.then(function (rolls) {
			console.log('7 ------------------------------');
			var a = _.map(rolls, function (roll) {
				return new promise(function (fulfill, reject) {
					if (roll.code.indexOf(':') > -1) {
						var r = new Role(roll);
						r.projectCode = roll.code.substring(0, roll.code.indexOf(':'));
						fulfill(r.save());
					} else {
						fulfill();
					}
				});
			});

			return promise.all(a);
		})
		.then(function (data) {
			console.log('8 ------------------------------');
			return Users.findOne({username: 'admin'})
				.then(function (u) {
					adminUser = u;
					adminUser.orgCode = 'eao';
					return adminUser;
				});
		})
		.then(function (user) {
			console.log('9 --------------------------', user.username);
			return (new ProjectCtrl(user)).findMany({});
		})
		.then(function (projex) {
			console.log('10--------------------------', projex.length);

			var a = _.map(projex, function (proj) {
				return new promise(function (fulfill, reject) {
					(new ProjectCtrl(adminUser)).initDefaultRoles(proj)
						.then(function (a) {
							fulfill(a);
						});
				});
			});
			return promise.all(a);
		})
		.then(function (data) {
			console.log('11-----------------------------');
			// just clean out the old invitee role if it exists...
			return new promise(function (fulfill, reject) {
				Role.findOne({code: 'invitee'}, function (err, model) {
					if (err) {
						console.error('12.1:', err);
						reject();
					}
					if (!model) {
						fulfill(data);
					} else {
						model.remove(function (err) {
							if (err) {
								console.error('12.2:', err);
								reject(err);
							} else {
								fulfill(data);
							}
						});
					}
				});
			});
		})
		.then(function (data) {
			console.log('12---------------------');
			console.log('done with roles');
		});

};

module.exports.sysroles3 = function () {

	var findUserRole = new promise(function (fulfill, reject) {
		Role.find({code: 'user'}, function (err, foundrole) {
			//
			// if it does not exist, then save the one we made
			//
			if (!foundrole || _.isEmpty(foundrole)) {
				var r = new Role({
					code: 'user',
					projectCode: undefined,
					orgCode: 'eao',
					roleCode: 'user',
					name: 'User',
					isSystem: true,
					isFunctional: false,
					isProjectDefault: false
				});
				console.log('adding: ' + r.code);
				fulfill(r.save());
			} else {
				_.merge(foundrole[0],{
					code: 'user',
					projectCode: undefined,
					orgCode: 'eao',
					roleCode: 'user',
					name: 'User',
					isSystem: true,
					isFunctional: false,
					isProjectDefault: false
				});
				console.log('updating: ' + foundrole[0].code);
				fulfill(foundrole[0].save());
			}
		});
	});

	return promise.resolve(findUserRole)
		.then(function (role) {
			console.log('found user role = ' + role.code);
			return new promise(function (fulfill, reject) {
				Users.find({roles: {$nin: [role.code]}}, function (err, data) {
					if (err) {
						reject();
					}
					if (!data) {
						fulfill(data);
					} else {
						console.log('users without user role count = ' + _.size(data));
						fulfill(RoleCtrl.userRoles({method: 'add', roles: ['user'], users: data }));
					}
				});
			});
		})
		.then(function (users) {
			//
			console.log('updated users count = ' + _.size(users));
			console.log('done with roles');
		});

};
