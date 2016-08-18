'use strict';

var _ = require('lodash'),
	path = require('path'),
	chalk = require('chalk'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Invitation = mongoose.model('Invitation');
	// Role = mongoose.model('Role'),
	// Roles = require(path.resolve('./modules/roles/server/controllers/role.controller'));

var Invitation = require(path.resolve('./modules/invitations/server/controllers/invitation.controller'));

// ensure that we have come through Siteminder...
var parseSm = function (req) {
	return new Promise(function (fulfill, reject) {
		var userGuid = req.headers.smgov_userguid;
		var userType = req.headers.smgov_usertype;

		if (!_.isEmpty(process.env.ALLOW_SITEMINDER_OVERRIDE) && process.env.ALLOW_SITEMINDER_OVERRIDE === 'true') {
			userGuid = userGuid || req.params.userguid || req.query.smgov_userguid;
			userType = userType || req.params.usertype || req.query.smgov_usertype;
		}

		if (userGuid) {
			fulfill({userGuid: userGuid, userType: userType});
		} else {
			reject(new Error('parseSm: Could not find user information from Siteminder'));
		}
	});
};

var findUserByGuid = function (userGuid) {
	return new Promise(function (fulfill, reject) {
		User.findOne({
			userGuid: userGuid.toLowerCase()
		}).populate('org').exec(function (error, user) {
			if (error) {
				reject(new Error(error));
			} else if (!user) {
				reject(new Error('findUserByGuid: User not found for Siteminder headers.'));
			} else {
				fulfill(user);
			}
		});
	});
};

var findInvitation = function (oid) {
	return new Promise(function (fulfill, reject) {
		Invitation.findOne({
			_id: oid
		}).populate('project').populate('user').exec(function (error, i) {
			if (error) {
				reject(new Error(error));
			} else if (!i) {
				reject(new Error('findInvitation: Invitation not found for "' + oid + '".'));
			} else {
				fulfill(i);
			}
		});
	});
};


var findInvitations = function (user) {
	return new Promise(function (fulfill, reject) {
		Invitation.find({
			user: user, accepted: {$exists: false}
		}).exec(function (error, i) {
			if (error) {
				reject(new Error(error));
			} else if (!i) {
				reject(new Error('findInvitations: Invitations not found for "' + user._id + '".'));
			} else {
				fulfill(i);
			}
		});
	});
};

var acceptInvitation = function (invite) {
	return new Promise(function (fulfill, reject) {
		if (invite.accepted !== undefined) {
			// already accepted, just carry on...
			fulfill(invite);
		} else {
			invite.accepted = new Date();
			invite.save(function (error, inv) {
				if (error) {
					reject(new Error(error));
				} else if (!inv) {
					reject(new Error('acceptInvitation: Invitation not accepted.'));
				} else {
					fulfill(inv);
				}
			});
		}
	});
};

var handleInvitation = function (user, invite) {
	if (invite.accepted === undefined) {
		//
		// TBD ROLES
		//
		return Promise.resolve ();
		// return Roles.userRoles({method: 'add', users: user, roles: invite.roles})
		// 	.then(function () {
		// 		return acceptInvitation(invite);
		// 	});
	} else {
		return Promise.resolve(invite);
	}
};

var checkUsers = function (sm, user, inviteUser) {
	return new Promise(function (fulfill, reject) {
		if (!user && !inviteUser) {
			reject(new Error('No users found to sign in'));
		}
		else if (!user && inviteUser) {
			if (!_.isEmpty(inviteUser.userGuid) && (sm.userGuid !== inviteUser.userGuid)) {
				//console.log(chalk.green("checkUsers()... inviteUser.userGuid: '" + inviteUser.userGuid + "' sm.userGuid: '" + sm.userGuid + "'"));
				// auto-assigned guid - we can carry on in this case...
				if (inviteUser.userGuid.lastIndexOf("esm-", 0) === 0) {
					//console.log(chalk.green("checkUsers()...detected auto-assigned userGuid...proceeding with SiteMinder account linking..."));
					fulfill(inviteUser);
				} else {
					reject(new Error('Invitation user does not match Signed in user.'));
				}
			} else {
				// carry on with the invitation's user, will need to set siteminder fields...
				fulfill(inviteUser);
			}
		} else if (user && inviteUser) {
			if (!_.isEmpty(user.userGuid) && user.userGuid === inviteUser.userGuid) {
				// all good, invited user matches and has been signed in before...
				fulfill(user);
			} else {
				// we've got a problem here...
				// siteminder headers loaded a user that doesn't match up with our invite user
				reject(new Error('Signed in user does not match Invitation user.'));
			}
		}
	});
};

var updateUserFromSiteminder = function (sm, user) {
	return new Promise(function (fulfill, reject) {
		if (_.isEmpty(user.userGuid) || _.startsWith(user.userGuid, 'esm-')) {
			// set the siteminder fields
			user.userGuid = sm.userGuid;
			user.userType = sm.userType;

			if (!_.includes(user.roles, 'user')) {
				user.roles.push('user');
			}

			user.save(function (err, u) {
				if (err) {
					reject(new Error(err));
				} else {
					fulfill(u);
				}
			});
		} else {
			fulfill(user);
		}
	});
};

var loginUser = function (req, user) {
	return new Promise(function (fulfill, reject) {
		req.logout();
		req.login(user, function (err) {
			if (err) {
				reject(new Error(err));
			} else {
				fulfill(user);
			}
		});
	});
};


exports.signIn = function (req, res) {
	var redirectPath = '/';
	var siteMinder;
	parseSm(req)
		.then(function (sm) {
			siteMinder = sm;
			//console.log(chalk.green('parseSm(): ' + sm.userGuid));
			return findUserByGuid(sm.userGuid);
		})
		.then(function (user) {
			//console.log(chalk.green('findUserByGuid(): ' + user.displayName));
			return loginUser(req, user);
		})
		.then(function () {
			//console.log(chalk.green('loginUser(): ' + req.isAuthenticated()));
			res.redirect(redirectPath);
		})
		.catch(function (err) {
			//console.error(chalk.red('Error: signIn(): ' + err.message));
			// should we do something differently here?
			redirectPath = '/smerr';
			if (siteMinder !== undefined && siteMinder.userType !== undefined ) {
				redirectPath += '?t=' + siteMinder.userType.toLowerCase();
			}
			res.redirect(redirectPath);
		});
};

exports.acceptInvitation = function (req, res) {
	//console.log('acceptInvitation > token = ', req.params.token);
	//console.log('acceptInvitation > user = ', JSON.stringify(req.user));
	var redirectPath = '/';
	var invite, siteMinder, user;

	(new Invitation({user: req.user, context: 'application'})).acceptInvitation(req)
		.then(function (data) {
			//console.log('acceptInvitation > invite = ', JSON.stringify(data));
			invite = data;
			return parseSm(req);
		})
		.then(function (sm) {
			//console.log('acceptInvitation > siteMinder = ', JSON.stringify(sm));
			siteMinder = sm;
			return findUserByGuid(siteMinder.userGuid).catch(function () {
				// user may not have guid populated yet...
				return null;
			});
		})
		.then(function (u) {
			if (u) {
				//console.log('acceptInvitation > found guid = ', JSON.stringify(u));
				user = u;
			}
			//console.log('acceptInvitation > call checkUsers = ', JSON.stringify(u));
			return checkUsers(siteMinder, user, invite.user);
		})
		.then(function (u) {
			//console.log('acceptInvitation > checkUsers = ', JSON.stringify(u));
			user = u; // may come from the invite user, or the sm user...
			//console.log('acceptInvitation > call updateUserFromSiteminder = ', JSON.stringify(u));
			return updateUserFromSiteminder(siteMinder, user);
		})
		.then(function () {
			//console.log('acceptInvitation > call loginUser = ', JSON.stringify(user));
			return loginUser(req, user);
		})
		.then(function () {
			//console.log(chalk.green('loginUser(): ' + req.isAuthenticated()));
			res.redirect(redirectPath);
		})
		.catch(function (err) {
			//console.error(chalk.red('Error: acceptInvitation(): ' + err.message));
			// should we do something differently here?
			// can we examine an error type and send off a different message?
			res.redirect(redirectPath);
		});

};

exports.logHeaders = function(req, res) {
	//console.log(JSON.stringify(req.headers));

	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(JSON.stringify(req.headers));
};
