'use strict';
// =========================================================================
//
// Routes for roles
//
// =========================================================================
var policy     = require ('../policies/role.policy');
var controller = require ('../controllers/role.controller');
var path       = require('path');
var helpers    = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var Invitation = require (path.resolve('./modules/invitations/server/controllers/invitation.controller'));
var Project = require (path.resolve('./modules/projects/server/controllers/project.controller'));
var _ = require('lodash');

module.exports = function (app) {
	app.route ('/api/role').all (policy.isAllowed)
		.post (function (req, res) {
			controller.newRole ()
			.then (function (role) {
				role.set (req.body);
				return role.save ();
			})
				.then(function(role) {
					if (_.isEmpty(role.projectCode)) {
						return role;
					} else {
						return new Promise(function(fulfill, reject) {
							(new Project(req.user)).findOne({code:role.projectCode})
								.then(function(p) {
									var data = {method: 'add', type: 'projects', objects: p, permissions:{read:[role.code]}};
									fulfill(controller.objectRoles(data));
								});
						});
					}
				})
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/new/role').all (policy.isAllowed)
		.get (function (req, res) {
			controller.newRole ()
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/role/:role').all (policy.isAllowed)
		.put (function (req, res) {
			controller.getRole (req.params.role)
        .then(function(role) {
          // this is where we do user/role manipulation
          // including adding and removing the invitee role (and invitations) as needed
          return (new Invitation(req.user)).handleInvitations(req, role, req.body.users);
        })
			.then (function (data) {
				data.role.set (req.body);
				return data.role.save ();
			})
			.then (helpers.success(res), helpers.failure(res));
		})
		.get (function (req, res) {
			// console.log(req.params.role);
			controller.getRole (req.params.role)
			.then (helpers.success(res), helpers.failure(res));
		});
  //
	// get all users in a role
	//
	app.route ('/api/users/in/role/:role').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getUsersForRole (req.params.role)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all roles in a project
	//
	app.route ('/api/roles/project/:project').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getRolesInProject (req.Project)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all users in all roles for a project
	//
	app.route ('/api/users/roles/project/:project').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getUsersInRolesInProject (req.Project)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all projects with a role
	//
	app.route ('/api/projects/with/role/:role').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getProjectsWithRole (req.params.role)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get system roles only
	//
	app.route ('/api/system/roles/:role').all (policy.isAllowed)
		.put (function (req, res) {
			controller.getRole(req.params.role)
				.then (function (role) {
					role.set (req.body);
					return role.save ();
				})
				.then (helpers.success(res), helpers.failure(res));
		})
		.get (function (req, res) {
			// console.log(req.params.role);
			controller.getRole (req.params.role)
				.then (helpers.success(res), helpers.failure(res));
		});

	app.route ('/api/system/roles').all (policy.isAllowed)
		.post (function (req, res) {
			controller.newRole()
				.then(function (role) {
					role.set(req.body);
					return role.save();
				})
				.then(helpers.success(res), helpers.failure(res));
		})
		.get (function (req, res) {
			controller.getSystemRoles (req)
			.then (helpers.success(res), helpers.failure(res));
		});

	app.route('/api/roles/full/project/:project').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getFullRolesForProject (req)
				.then (helpers.success(res), helpers.failure(res));
		});

	app.route ('/api/permissions').all (policy.isAllowed)
		.put (function (req, res) {
			controller.getObjects(req, req.body.type, req.body.objects)
				.then(function(objs) {
					req.body.objects = objs;
					return controller.objectRoles(req.body);						
				}).then (helpers.success(res), helpers.failure(res));
		});

};

