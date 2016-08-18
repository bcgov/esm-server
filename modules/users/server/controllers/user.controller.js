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

var mongoose = require ('mongoose');
var Role  = mongoose.model ('_Role');
var Invitation = mongoose.model('Invitation');

module.exports = DBModel.extend({
	name: 'User',
	plural: 'users',
	searchForUsersToInvite: function (projectId) {
		console.log('projectId = ', projectId);
		var self = this;
		if (!_.isEmpty(projectId)) {

			var getRoles = new Promise(function(resolve, reject) {
				Role.find({
					context: projectId,
					user: {$ne: null}
				}).exec(function (error, data) {
					if (error) {
						reject(new Error(error));
					} else if (!data) {
						reject(new Error('searchForUsersToInvite.getRoles: no roles found for project ', projectId));
					} else {
						resolve(data);
					}
				});
			});

			var getUsers = function(usernames) {
				var uniqueNames = _.uniq(usernames);
				return new Promise(function (resolve, reject) {
					var q = {
						username: {$in: uniqueNames}
					};

					self.listIgnoreAccess(q, 'displayName username email orgName')
						.then(function (res) {
							resolve(res);
						}, function (err) {
							reject(new Error(err));
						});
				});
			};

			var getInvitations = function(users) {
				var userIds = _.map(users, '_id');
				return new Promise(function(resolve, reject) {
					Invitation.find({
						user: {$in: userIds}
					}).exec(function (error, data) {
						if (error) {
							reject(new Error(error));
						} else {
							resolve(data);
						}
					});
				});
			};

			return new Promise(function(resolve, reject) {
				var roles, users, invitations;
				console.log('searchForUsersToInvite 1) getRoles...');
				return getRoles
					.then(function(data) {
						console.log('searchForUsersToInvite 1) results: ', data.length);
						roles = data;
						var usernames = _.map(roles, 'user');
						console.log('searchForUsersToInvite 2) getUsers...');
						return getUsers(usernames);
					})
					.then(function(data) {
						console.log('searchForUsersToInvite 2) results: ', data.length);
						users = data;
						console.log('searchForUsersToInvite 3) getInvitations...');
						return getInvitations(users);
					})
					.then(function(data) {
						console.log('searchForUsersToInvite 3) results: ', data.length);
						invitations = data;
						// ok, return all users that have a bad or unknown guid
						// also mark if they've been invited (but not accepted)...
						var results = [];
						_.forEach(users, function(u) {

							if (_.isEmpty(u.userGuid) || _.startsWith(u.userGuid, 'esm-')) {
								var invite = _.find(invitations, function(i) { return i.user.toString() === u._id.toString() && _.isEmpty(i.accepted); });

								var cu = u.toObject();
								cu.hasInvitation = !_.isEmpty(invite);
								results.push(cu);
							}
						});
						console.log('searchForUsersToInvite 4) results...');
						return results;
					})
					.then(function(data) {
							console.log('searchForUsersToInvite 4) results: ', data.length);
							resolve(data);
					},
						function (err) {
							console.log('searchForUsersToInvite !) error: ', JSON.stringify(err));
							reject(new Error(err));
					});
			});
		} else {
			// let's deal with this later when we are doing system level invites...
			return Promise.resolve([]);
		}
	},

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
