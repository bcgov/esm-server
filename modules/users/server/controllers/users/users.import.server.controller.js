'use strict';

/**
 * Module dependencies.
 */
var _             = require ('lodash'),
		fs            = require ('fs'),
		path          = require ('path'),
		mongoose      = require ('mongoose'),
		User          = mongoose.model('User'),
		CSVParse      = require ('csv-parse'),
		crypto        = require ('crypto'),
		Project       = mongoose.model ('Project'),
		Group    	  = mongoose.model ('Group'),
		OrganizationController = require (path.resolve('./modules/organizations/server/controllers/organization.controller')),
		Organization  = mongoose.model ('Organization'),
		errorHandler  = require (path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Update user details
 */
exports.update = function (req, res) {
	// Init Variables
	var user = req.user;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function (err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

// Import a list of users
exports.loadUsers = function(file, req, res, opts) {
	return new Promise (function (resolve, reject) {
		// Now parse and go through this thing.
		fs.readFile(file.path, 'utf8', function(err, data) {
			if (err) {
				reject("{err: "+err);
			}
			// console.log("FILE DATA:",data);
			var colArray = ['PERSON_ID','EAO_STAFF_FLAG','PROPONENT_FLAG','SALUTATION','FIRST_NAME','MIDDLE_NAME','LAST_NAME','TITLE','ORGANIZATION_NAME','DEPARTMENT','EMAIL_ADDRESS','PHONE_NUMBER','HOME_PHONE_NUMBER','FAX_NUMBER','CELL_PHONE_NUMBER','ADDRESS_LINE_1','ADDRESS_LINE_2','CITY','PROVINCE_STATE','COUNTRY','POSTAL_CODE','NOTES'];
			var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
				// Skip this many rows
				var length = Object.keys(output).length;
				var promises = [];
				// console.log("length",length);
				Object.keys(output).forEach(function(key, index) {
					if (index > 0) {
						var row = output[key];
						row.EMAIL_ADDRESS = row.EMAIL_ADDRESS ? row.EMAIL_ADDRESS.trim() : "";
						var newObj = {
							personId      : parseInt(row.PERSON_ID),
							orgName       : row.ORGANIZATION_NAME,
							title         : row.TITLE,
							displayName   : row.FIRST_NAME + " " + row.LAST_NAME,
							firstName     : row.FIRST_NAME,
							middleName    : row.MIDDLE_NAME,
							lastName      : row.LAST_NAME,
							phoneNumber   : row.PHONE_NUMBER,
							homePhoneNumber : row.HOME_PHONE_NUMBER,
							email         : row.EMAIL_ADDRESS !== "" ? row.EMAIL_ADDRESS : "none@specified.com"+row.FIRST_NAME +"."+ row.LAST_NAME +"."+ row.ORGANIZATION_NAME,
							eaoStaffFlag  : Boolean(row.EAO_STAFF_FLAG),
							proponentFlag : Boolean(row.PROPONENT_FLAG),
							salutation    : row.SALUTATION,
							department    : row.DEPARTMENT,
							faxNumber     : row.FAX_NUMBER,
							cellPhoneNumber : row.CELL_PHONE_NUMBER,
							address1      : row.ADDRESS_LINE_1,
							address2      : row.ADDRESS_LINE_2,
							city          : row.CITY,
							province      : row.PROVINCE_STATE,
							country       : row.COUNTRY,
							postalCode    : row.POSTAL_CODE,
							notes         : row.NOTES,
							username      : row.EMAIL_ADDRESS !== "" ? row.EMAIL_ADDRESS : row.FIRST_NAME +"."+ row.LAST_NAME +"."+ row.ORGANIZATION_NAME,
							password      : crypto.randomBytes(8)
						};
						// console.log("pushing:" + newObj.email + ", username:" + newObj.username);
						promises.push(newObj);
					}
				});

				var doOrgWork = function(item) {
					return new Promise(function(rs, rj) {
						// console.log("item:", item);
						if (item.orgName === '') {
							// console.log("resolving nothing for org, it was null.");
							rs(null);
						} else {
							Organization.findOne ({name:item.orgName}, function (err, result) {
								if (result === null) {
									// console.log("Creating org:", item.orgName);
									// Create it
									var o = new OrganizationController(opts);
									o.newDocument({name: item.orgName})
									.then ( o.create )
									.then (rs, rj);
								} else {
									// console.log("found the org:", result.name);
									rs(result);
								}
							});
						}
					});
				};

				var doUserWork = function(user, org) {
					return new Promise(function(rs, rj) {
						if (org) {
							// console.log("org:", org);
							user.org = org;
						}
						User.findOne ({email:user.email.toLowerCase()}, function (err, result) {
							if (result === null) {
								// console.log("creating:", user.email);
								// Create it
								var o = new User(user);
								o.save()
								.then(function (obj) {
									// console.log("created:", obj);
									rs(obj);
								}, function (err) {
									// console.log("err:", err);
									rj(err);
								});
							} else {
								result.org = org;
								result.save()
								.then(rs,rj);
							}
						});
					});
				};

				var doOrgToUserWork = function(user) {
					return new Promise(function(rs, rj) {
						if (!user.org) {
							// console.log("no org to match.");
							rs(null);
						}
						Organization.findOne({name: user.orgName})
						.then(function (org) {
							// Push this user into the org.
							var index = -1;
							for (var i=0;i<org.users.length;i++) {
								if (org.users[i].equals(user._id)) {
									index = i;
									break;
								}
							}
							if (index === -1) {
								// console.log("pushign new user into org");
								org.users.push(user._id);
								return org.save();
							} else {
								// console.log("That user already existed there.");
								return org;
							}
							// console.log("existing users:", org.users);
						})
						.then(rs, rj);
					});
				};

				Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return doOrgWork(item)
							.then(function (org) {
								return doUserWork(item, org);
							})
							.then(function (user) {
								return doOrgToUserWork(user);
							});
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
			});
		});
	});
};

exports.loadGroupUsers = function(file, req, res, opts) {
	return new Promise (function (resolve, reject) {
		// Now parse and go through this thing.
		fs.readFile(file.path, 'utf8', function(err, data) {
			if (err) {
				reject("{err: "+err);
			}
			// console.log("FILE DATA:",data);
			var colArray = ['GROUP_ID','NAME','CONTACT_GROUP_TYPE','PERSON_ID','PROJECT_ID'];
			var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
				// Skip this many rows
				var length = Object.keys(output).length;
				var promises = [];
				// console.log("length",length);
				Object.keys(output).forEach(function(key, index) {
					if (index > 0) {
						var row = output[key];
						var newObj = {
							groupId     : parseInt(row.GROUP_ID),
							groupName   : row.NAME,
							groupType   : row.CONTACT_GROUP_TYPE,
							personId    : parseInt(row.PERSON_ID),
							epicProjectID  : parseInt(row.PROJECT_ID) // Save epic data just in case
						};
						promises.push(newObj);
					}
				});

				var doGroupUserWork = function(item) {
					return new Promise(function(rs, rj) {
						// console.log("item:", item);
						Group.findOne({groupId: parseInt(item.groupId), personId: parseInt(item.personId)}, function (err, result) {
							if (result === null) {
								// console.log("Creating group:", item.groupId);
								// Create it
								var o = new Group(item);
								o.save()
								.then (rs, rj);
							} else {
								// console.log("found the group:", result.groupName);
								rs(result);
							}
						});
					});
				};

				var doGroupProjectWork = function(item) {
					return new Promise(function(rs, rj) {
						// console.log("itemg finding:", item.epicProjectID);
						Project.findOne({epicProjectID: item.epicProjectID}, function (err, result) {
							if (result !== null) {
								// console.log("project:", result);
								item.project = result;
								item.save()
								.then(rs,rj);
							} else {
								// console.log("didn't find anything");
								rs(null);
							}
						});
					});
				};

				Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return doGroupUserWork(item)
							.then( function (group) {
								return doGroupProjectWork(group);
							});
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
			});
		});
	});
};
