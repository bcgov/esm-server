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
			Promise.all (stream.phases.map (phasebase.findById))
			.then (function (models) {
				return Promise.all (models.map (function (m) {
					return phase.makePhaseFromBase (m, stream._id, project._id, project.code);
				}));
			})
			.then (function (models) {
				_.each (models, function (m) {
					project.phases.push (m._id);
				});
				return project;
			})
			.then (function (m) {
				return self.saveAndReturn (m);
			})
			.then (resolve, reject);
		});
	},
	addPhase : function (project, phasebase) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var phase = new PhaseClass (self.user);
			phase.makePhaseFromBase (phasebase, project.stream, project._id)
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
