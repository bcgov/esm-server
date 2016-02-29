'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path               = require('path');
var DBModel            = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var PhaseClass         = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var PhaseBaseClass     = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var ProjectIntakeClass = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var RoleController     = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var _                  = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Project',
	populate: 'proponent',
	// -------------------------------------------------------------------------
	//
	// Before adding a project this is what must happen:
	//
	// set up the eao and proponent admin and member roles
	// add them to the project
	// reverse add the project to the roles
	// add the project admin role to the current user, eao if internal, proponent
	//    otherwise
	// reset the user roles in this object so the user can save it
	//
	// -------------------------------------------------------------------------
	preprocessAdd : function (project) {
		var self = this;
		var rolePrefix             = project.code + ':';
		var adminSuffix            = ':admin';
		var projectAdminRole       = rolePrefix + 'eao' + adminSuffix;
		var projectProponentAdmin  = rolePrefix + project.orgCode + adminSuffix;
		var projectProponentMember = rolePrefix + project.orgCode + ':member';
		return new Promise (function (resolve, reject) {
			// console.log ('project = ', project);
			//
			// set the project admin role
			//
			project.adminRole = projectAdminRole;
			project.proponentAdminRole = projectProponentAdmin;
			//
			// add the project to the roles
			//
			RoleController.addRolesToConfigObject (project, 'projects', {
				read   : [projectProponentMember],
				submit : [projectProponentAdmin, projectAdminRole]
			})
			//
			// add the appropriate role to the user
			//
			.then (function () {
				// console.log ('project is now ', project);
				var userRole = (self.user.orgCode === project.orgCode) ? projectProponentAdmin : projectAdminRole;
				return RoleController.addUserRole (self.user, userRole);
			})
			//
			// update this model's user roles
			// do this because the user now has new access, without this they
			// cannot save the project
			//
			.then (function () {
				self.setRoles (self.user);
				project.roles = project.allRoles ();
				resolve (project);
			})
			.catch (reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set a project to submitted
	//
	// -------------------------------------------------------------------------
	submit: function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			project.status = 'Submitted';
			// project.roles.push (
			// 	'eoa'
			// );
			// RoleController.addRolesToConfigObject (project, 'projects', {
			// 	read  : ['eao'],
			// });
			self.saveAndReturn (project)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// setting a stream requires the following:
	// get all the phase base objects and create proper phases from them
	// add those to the project and link backwards as well
	// here's the big list of stuff to do:
	//
	// add the project admin role to the current user so they can perform this action
	// give the user permission to save by resetting the access in this object
	// get all the base phases in the stream
	// make real phases from all the bases, passing in the current project roles
	// attach all new phases to the project
	// update the roles list in the project from the stream
	// reverse add the project to all the roles
	// save the project
	//
	// -------------------------------------------------------------------------
	setStream : function (project, stream) {
		var self      = this;
		var phase     = new PhaseClass (self.user);
		var phasebase = new PhaseBaseClass (self.user);
		return new Promise (function (resolve, reject) {
			console.log ("adding user roles");
			//
			// we MUST add the admin role to the current user or they cannot
			// perform the upcoming save
			//
			var projectAdminRole = project.code + ':eao:admin';
			var projectMemberRole = project.code + ':eao:member';
			console.log ('about to add user role '+projectAdminRole + ' to user ',self.user);
			return RoleController.addUserRole (self.user, projectAdminRole)
			.then (function () {
				//
				// reset the user in this object with its new permissions
				//
				self.setRoles (self.user);
				// get all the phase bases
				return Promise.all (stream.phases.map (phasebase.findById));
			})
			// then make real phases from them all
			.then (function (models) {
				console.log ('found phase bases, length = ',models.length);
				return Promise.all (models.map (function (m) {
					return phase.makePhaseFromBase (m, stream._id, project._id, project.code, project.roleSet());
				}));
			})
			// then attach the new phases to the project
			.then (function (models) {
				console.log ('new phases, length = ',models.length);
				_.each (models, function (m) {
					project.phases.push (m._id);
				});
				return project;
			})
			// then do some work on the project itself and save it
			.then (function (p) {
				console.log ("setting up status and roles");
				//
				// set the status to in progress
				//
				p.status = 'In Progress';
				//
				// add some new roles to the roles list including the stream roles
				//
				p.roles.push (
					projectAdminRole,
					projectMemberRole
				);
				p.roles = _.uniq (p.roles.concat (stream.roles));
				//
				// now add the stream roles both ways and also make the
				// project public
				//
				RoleController.addRolesToConfigObject (p, 'projects', project.roleSet());
				return project;
			})
			// .then (function () {
			// 	console.log ("adding user roles");
			// 	//
			// 	// we MUST add the admin role to the current user or they cannot
			// 	// perform the upcoming save
			// 	//
			// 	console.log ('about to add user role '+project.code + ':eao:admin to user ',self.user);
			// 	return RoleController.addUserRole (self.user, project.code + ':eao:admin');
			// })
			.then (function (p) {
				console.log ("save me!");
				return self.saveAndReturn (p);
			})
			// then leave
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// add a phase to the project from a phase base
	// add the phase with whatever new permissions
	//
	// -------------------------------------------------------------------------
	addPhase : function (project, phasebase, roles) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var phase = new PhaseClass (self.user);
			phase.makePhaseFromBase (phasebase, project.stream, project._id, project.code, roles)
			.then (function (model) {
				project.phases.push (model._id);
				return  project;
			})
			.then (function (m) {
				return self.saveAndReturn (m);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set current phase
	//
	// -------------------------------------------------------------------------
	setPhase : function (project, phase) {
		var self = this;
		return new Promise (function (resolve, reject) {
			project.currentPhase = phase;
			console.log('setcurrentphase', project, phase);
			self.saveAndReturn(project)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish, unpublish
	//
	// -------------------------------------------------------------------------
	publish: function (project, value) {
		var self = this;
		if (value) project.addRoles ( { read: 'public' });
		else project.removeRoles ( { read: 'public' });
		return new Promise (function (resolve, reject) {
			self.saveAndReturn (project)
			.then (resolve, reject);
		});
	},

	getIntakeQuestions: function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var projectintake = new ProjectIntakeClass ();
		});
	}
});
