'use strict';
// =========================================================================
//
// Controller for invitations
//
// =========================================================================
var path = require('path');
var DBModel = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
// var Roles = require(path.resolve('./modules/roles/server/controllers/role.controller'));
var email = require(path.resolve('./modules/core/server/controllers/email.server.controller'));

var _ = require('lodash'),
	config = require(path.resolve('./config/config')),
	mongoose = require('mongoose'),
	Project = mongoose.model('Project'),
	User = mongoose.model('User'),
	Invitation = mongoose.model('Invitation');
	// Role = mongoose.model('Role');

var getInvitation = function (id) {
	return new Promise(function (fulfill, reject) {
		Invitation.findOne({_id: id.toString()}).populate('user').exec(function (err, invitations) {
			if (err) {
				reject(err);
			} else if (!invitations) {
				reject(new Error('Failed to find Invitation'));
			} else {
				fulfill(invitations);
			}
		});
	});
};

var acceptInvitation = function(invite) {
	return new Promise(function(fulfill, reject) {
		if (invite.accepted !== undefined) {
			// already accepted, just carry on...
			fulfill(invite);
		} else {
			invite.accepted = new Date();
			invite.save(function (error, inv) {
				if (error) {
					reject(new Error(error));
				} else if (!inv) {
					reject(new Error('Invitation not accepted.'));
				} else {
					fulfill(inv);
				}
			});
		}
	});
};

module.exports = DBModel.extend({
	name: 'Invitation',

	findOrCreate: function(users) {
		var self = this;
		var a = _.map(users, function(u) {
			return new Promise(function(resolve, reject) {
				return self.findOne({user: u})
					.then(function(inv) {
						if (inv) {
							return inv;
						} else {
							return self.createInvitation(u);
						}
					})
					.then(function(inv) {
						resolve(inv);
					}, function(err) {
						reject(err);
					});
			});
		});

		return Promise.all(a);
	},

	createInvitation: function(user) {
		var self = this;
		var invite = new self.model();
		invite.user = user;
		invite.accepted = undefined;
		return self.create(invite);
	},

	acceptInvitation: function(req) {
		return new Promise(function(resolve, reject) {
			return getInvitation(req.params.token)
				.then(function(inv) {
					return acceptInvitation(inv);
				})
				.then(function(data) {
					return resolve(data);
				});
		});
	}
});


