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
	preprocessAdd : function (model) {
		var adminrole = model.code + ':admin';
		var hasadmin = (_.indexOf (model.submit, adminrole) >= 0);
		if (!hasadmin) model.submit.push (adminrole);
		return model;
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
				// are there any new roles to add to the project?
				var addroles = _.difference (project.roles, stream.roles);
				project.roles.push (addroles);
				// now copy over the stream permissions to the project
				project.read.push (stream.read);
				project.write.push (stream.write);
				project.submit.push (stream.submit);
				project.watch.push (stream.watch);
				// fix the names of them to reflect the project code
				project.fixRoles (project.code);
				// remove duplicates
				project.read.push ('public');
				project.read = _.uniq (project.read);
				project.write = _.uniq (project.write);
				project.submit = _.uniq (project.submit);
				project.watch = _.uniq (project.watch);
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
