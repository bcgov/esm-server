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
var _           = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Project',
	populate: 'phases',
	preprocessAdd : function (project) {
		project.roles.push (
			'pro:admin',
			'pro:consultant',
			'pro:member'
		);
		project.submit.push (
			project.code + ':eao:admin',
			project.code + ':pro:admin'
		);

		this.userModel.addRole (
			(this.userModel.isProponent ()) ? project.code + ':pro:admin' : project.code + ':eao:admin'
		);
		console.log ('yes');
		this.user.roles.push (project.code + ':pro:admin');
		console.log ('indeed');
		this.setRoles (this.user);
		return project;
	},
	// -------------------------------------------------------------------------
	//
	// setting a stream requires the following:
	// get all the phase base objects and create proper phases from them
	// add those to the project and link backwards as well
	//
	// -------------------------------------------------------------------------
	setStream : function (project, stream) {
		var self = this;
		var phase = new PhaseClass (self.user);
		var phasebase = new PhaseBaseClass (self.user);
		return new Promise (function (resolve, reject) {
			// get all the phase bases
			Promise.all (stream.phases.map (phasebase.findById))
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
			.then (function (m) {
				// add stream roles to the project
				project.mergeRoles (project.code, {
					roles  : stream.roles,
					read   : stream.read,
					write  : stream.write,
					submit : stream.submit,
					watch  : stream.watch
				});
				self.userModel.addRole (project.code + ':eao:admin');
				// save
				return self.saveAndReturn (m);
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
	}
});
