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
	plural : 'projects',
	populate: 'proponent, currentPhase',
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
		var rolePrefix;
		var adminSuffix = ':admin';
		var projectAdminRole;
		var projectProponentAdmin;
		var projectProponentMember;
		var sectorRole;
		//
		// return a promise, we have lots of work to do
		//
		return new Promise (function (resolve, reject) {
			//
			// first generate a project code that can be used internally
			//
			project.code = project.shortName.toLowerCase ();
			project.code = project.code.replace (/\W/g,'-');
			project.code = project.code.replace (/-+/,'-');
			//
			// this does the work of that and returns a promise
			//
			self.guaranteeUniqueCode (project.code)
			//
			// then go about setting up the default admin roles on both
			// sides of the fence
			//
			.then (function (projectCode) {
				rolePrefix             = projectCode + ':';
				adminSuffix            = ':admin';
				projectAdminRole       = rolePrefix + 'eao' + adminSuffix;
				projectProponentAdmin  = rolePrefix + project.orgCode + adminSuffix;
				projectProponentMember = rolePrefix + project.orgCode + ':member';
				//
				// set the project admin role
				//
				project.adminRole = projectAdminRole;
				project.proponentAdminRole = projectProponentAdmin;
				//
				// add the project to the roles and the roles to the project
				// we absolutely set them at this point.
				//
				//
				RoleController.setObjectRoles (project, {
					read   : [projectProponentMember],
					submit : [projectProponentAdmin, projectAdminRole, sectorRole]
				});
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
				console.log ('here we are');
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
			//
			// set the status to submitted
			//
			project.status = 'Submitted';
			//
			// select the right sector lead role
			//
			if (project.type === 'lng') {
				project.sectorRole = 'sector-lead-lng';
			} else {
				project.sectorRole = 'sector-lead-mining';
			}
			//
			// add the project to the roles and the roles to the project
			// this is where the project first becomes visible to EAO
			// through the project admin role and the sector lead role
			// (we dont wait on the promise here, just trust it)
			//
			RoleController.mergeObjectRoles (project, {
				submit : [project.adminRole, project.sectorRole]
			});
			//
			// save changes
			//
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
				console.log ('roles are now:', p.roles);
				p.roles.push (
					projectAdminRole,
					projectMemberRole
				);
				p.roles = _.union (p.roles, stream.roles);
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
