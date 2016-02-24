'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path        = require('path');
var DBModel     = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var PhaseClass  = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var PhaseBaseClass  = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var ProjectIntakeClass  = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var RoleController = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var _           = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Project',
	populate: 'proponent',
	preprocessAdd : function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			// console.log ('project = ', project);
			project.roles.push (
				'pro:admin',
				'pro:member'
			);
			RoleController.addRolesToConfigObject (project, 'projects', {
				read   : ['project:pro:member', 'eao'],
				submit : ['project:pro:admin']
			})
			.then (function () {
				// console.log ('project is now ', project);
				return RoleController.addUserRole (self.user, project.code + ':pro:admin');
			})
			.then (function () {
				self.setRoles (self.user);
				resolve (project);
			})
			.catch (reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set a project to submitted
	// add the eao role so that it can be seen by eao staff now
	//
	// -------------------------------------------------------------------------
	submit: function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			project.status = 'Submitted';
			project.roles.push (
				'eoa'
			);
			RoleController.addRolesToConfigObject (project, 'projects', {
				read  : ['eao'],
			});
			self.saveAndReturn (project)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// setting a stream requires the following:
	// get all the phase base objects and create proper phases from them
	// add those to the project and link backwards as well
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
			console.log ('about to add user role '+project.code + ':eao:admin to user ',self.user);
			return RoleController.addUserRole (self.user, project.code + ':eao:admin')
			.then (function () {
				// get all the phase bases
				return Promise.all (stream.phases.map (phasebase.findById));
			})
			// then make real phases from them all
			.then (function (models) {
				console.log ('found phase bases, length = ',models.length);
				return Promise.all (models.map (function (m) {
					return phase.makePhaseFromBase (m, stream._id, project._id, project.code);
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
					'public',
					'eao:admin',
					'eao:member'
				);
				p.roles = _.uniq (p.roles.concat (stream.roles));
				//
				// now add the stream roles both ways and also make the
				// project public
				//
				return RoleController.addRolesToConfigObject (p, 'projects', {
					read   : stream.read.concat (['project:eao:member', 'eao']),
					write  : stream.write,
					submit : stream.submit.concat (['project:eao:admin']),
					watch  : stream.watch
				});
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
			.then (function () {
				console.log ("reset user so we can save");
				self.setRoles (self.user);
				return (project);
			})
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
	//
	// -------------------------------------------------------------------------
	addPhase : function (project, phasebase) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var phase = new PhaseClass (self.user);
			phase.makePhaseFromBase (phasebase, project.stream, project._id, project.code)
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
