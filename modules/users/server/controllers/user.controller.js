'use strict';
// =========================================================================
//
// Controller for vcs
//
// =========================================================================
var path = require('path');
var _ = require('lodash');
var DBModel = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

var GroupController = require(path.resolve('./modules/groups/server/controllers/group.controller'));

module.exports = DBModel.extend({
	name: 'User',
	plural: 'users',

	search: function (name, email, org, groupId) {
		var self = this;
		var getUsers = new Promise(function (resolve, reject) {
			var q = {};
			if (!_.isEmpty(name)) {
				q.displayName = new RegExp(name, 'i');
			}
			if (!_.isEmpty(email)) {
				q.email = new RegExp(email, 'i');
			}
			if (!_.isEmpty(org)) {
				q.orgName = new RegExp(org, 'i');
			}
			//console.log('self.listIgnoreAccess(q)...');
			self.listIgnoreAccess(q)
				.then(function (res) {
					//console.log('self.listIgnoreAccess(q)... resolve ', res.length);
					resolve(res);
				}, function (err) {
					//console.log('err = ', JSON.stringify(err));
					reject(new Error(err));
				});
		});

		var getUsersInGroup = new Promise(function (resolve, reject) {
			if (_.isEmpty(groupId)) {
				resolve([]);
			} else {
				var groupCtrl = new GroupController(self.opts);
				//console.log('self.listIgnoreAccess({groupId: groupId})...');
				return groupCtrl.listIgnoreAccess({groupId: groupId})
					.then(function (res) {
						//console.log('self.listIgnoreAccess({groupId: groupId})...', res.length);
						var personIds = _.map(res, 'personId');
						//console.log('self.listIgnoreAccess({groupId: groupId})... personIds', personIds.length);
						//console.log('self.listIgnoreAccess({personId: {$in: personIds}})...');
						return self.listIgnoreAccess({personId: {$in: personIds}});
					})
					.then(function (res) {
						//console.log('self.listIgnoreAccess({personId: {$in: personIds}})... resolve ', res.length);
						resolve(res);
					}, function (err) {
						//console.log('err = ', JSON.stringify(err));
						reject(new Error(err));
					});
			}
		});


		return new Promise(function (resolve, reject) {
			var users, usersInGroup;
			//console.log('1) getUsers... ');
			return getUsers
				.then(function (res) {
					users = res;
					//console.log('1) getUsers... ', users.length);
					//console.log('2) getUsersInGroup... ');
					return getUsersInGroup;
				}).then(function (res) {
					usersInGroup = res;
					//console.log('2) getUsersInGroup... ', usersInGroup.length);
					if (!_.isEmpty(groupId)) {
						if (_.isEmpty(name) && _.isEmpty(email) && _.isEmpty(org)) {
							//console.log('only searched for groups, so return those users...');
							return usersInGroup;
						} else {
							//console.log('searched for groups and users, so return the intersection...');
							var intersection = [];
							_.forEach(users, function(o) {
								var ug = _.find(usersInGroup, function(u) {return u._id.toString() === o._id.toString(); });
								if (ug) {
									intersection.push(o);
								} else {
									//console.log('no match: users._id = ' + o._id.toString());
								}
							});
							return intersection;
						}
					} else {
						//console.log('return all users and users in Group...');
						return _.concat(users, usersInGroup);
					}
				})
				.then(function (res) {
					//console.log('3) list... ', res.length);
					return _.uniqBy(res, '_id');
				})
				.then(function (res) {
						//console.log('4) unique list, resolve... ', res.length);
						resolve(res);
					},
					function (err) {
						//console.log('!) reject... ', JSON.stringify(err));
						reject(new Error(err));
					}
				);
		});
	}
});
