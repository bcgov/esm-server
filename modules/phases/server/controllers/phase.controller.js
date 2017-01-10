'use strict';
// =========================================================================
//
// Controller for phases
//
// =========================================================================
var _              = require ('lodash');
var path           = require('path');
var DBModel        = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var MilestoneClass = require (path.resolve('./modules/milestones/server/controllers/milestone.controller'));
var PhaseBaseClass = require ('./phasebase.controller');
// var Roles          = require (path.resolve('./modules/roles/server/controllers/role.controller'));

module.exports = DBModel.extend ({
	name : 'Phase',
	plural : 'phases',
	bind: ['complete'],
	populate : 'milestones activities',
	// -------------------------------------------------------------------------
	//
	// just get a base phase, returns a promise
	//
	// -------------------------------------------------------------------------
	getPhaseBase: function (code) {
		return (new PhaseBaseClass (this.opts)).findOne ({code:code});
	},
	// -------------------------------------------------------------------------
	//
	// copy a base phase into a new phase and return the promise of it
	//
	// -------------------------------------------------------------------------
	copyPhaseBase: function (base) {
		return this.copy (base);
	},
	// -------------------------------------------------------------------------
	//
	// set dateStartedEst from duration, return phase
	//
	// -------------------------------------------------------------------------
	setInitalDates: function (phase) {
		phase.dateStartedEst   = new Date ();
		phase.dateCompletedEst =  new Date ();
		phase.dateCompletedEst.setDate (phase.dateCompletedEst.getDate () + phase.duration);
		if (phase.startOnCreate) {
			phase.status      = 'In Progress';
			phase.dateStarted = new Date ();
		} else {
			phase.status = 'Not Started';
		}
		return phase;
	},
	// -------------------------------------------------------------------------
	//
	// copy phase ancestry into phase and return phase
	//
	// -------------------------------------------------------------------------
	setAncestry: function (phase, project) {
		phase.project     = project._id;
		phase.projectCode = project.code;
		phase.stream      = project.stream;
		phase.order       = project.phases.length + 1;
		return phase;
	},
	// -------------------------------------------------------------------------
	//
	// Using the functions above, make a new phase from a base code and
	// attach it to the passed in phase and the phase ancestry
	//
	// -------------------------------------------------------------------------
	fromBase: function (code, project) {
		var self = this;
		var base;
		var baseId;
		var phase;
		var milestoneCodes;
		return new Promise (function (resolve, reject) {
			//
			// get the base
			//
			self.getPhaseBase (code)
			//
			// copy its id and such before we lose it, then copy the entire thing
			//
			.then (function (m) {
				// console.log ('found the base');
				base          = m;
				baseId        = m._id;
				milestoneCodes = _.clone (m.milestones);
				m.milestones = [];
				return self.copyPhaseBase (base);
			})
			//
			// set the base id and then initial dates
			//
			.then (function (m) {
				// console.log ('after copy', JSON.stringify (m, null, 4));
				// console.log ('copied the base into new phase with id ', m._id, m.milestones);
				phase = m;
				phase.phaseBase = baseId;
				return self.setInitalDates (phase);
			})
			//
			// copy over stuff from the project
			//
			.then (function (m) {
				// console.log ('after setting dates', JSON.stringify (phase, null, 4));
				return self.setAncestry (m, project);
			})
			//
			// adds each milestone, inefficient, but there will not be a lot
			// so not too much of an issue
			//
			.then (function (m) {
				// console.log ('all set to add milestones');
				//
				// This little bit of magic forces the synchronous executiuon of
				// async functions as promises, so a sync version of all.
				//
				return milestoneCodes.reduce (function (current, code) {
					return current.then (function () {
						// console.log ('++ add activity ', code);
						return self.addMilestone (m, code);
					});
				}, Promise.resolve());
			})
			.then (function () {
				// console.log ('saving the phase', JSON.stringify (phase, null, 4));
				return self.saveDocument (phase);
			})
			.then (function (r) {
				// console.log ('saved the phase');
				return r;
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// add a milestone to this phase (from a base code)
	//
	// -------------------------------------------------------------------------
	addMilestone : function (phase, basecode) {
		var self = this;
		var Milestone = new MilestoneClass (self.opts);
		return new Promise (function (resolve, reject) {
			//
			// get the new milestone
			//
			Milestone.fromBase (basecode, phase)
			.then (function (milestone) {
				phase.milestones.push (milestone._id);
				return phase;
			})
			.then (self.saveDocument)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// start a phase
	//
	// -------------------------------------------------------------------------
	start: function (phase) {
		phase.status           = 'In Progress';
		phase.dateStarted      = new Date ();
	//	phase.dateCompletedEst = new Date (phase.dateStarted);
	//	phase.dateCompletedEst.setDate (phase.dateCompletedEst.getDate () + phase.duration);
		return this.findAndUpdate (phase);
	},
	// -------------------------------------------------------------------------
	//
	// complete a phase. this marks underlying milestones as complete, we
	// may rather want to mark them as overridden.
	//
	// -------------------------------------------------------------------------
	completePhase: function (phase) {
		var self = this;

		if (!phase.completed) {
			phase.status = 'Complete';
			phase.completed = true;
			phase.completedBy = self.user._id;
			phase.dateCompleted = new Date();
			phase.progress = 100;
		}

		if (phase.milestones) {
			return self.completeMilestones(phase)
				.then(function() {
					self.findAndUpdate(phase);
				});
		} else {
			return self.findAndUpdate(phase);
		}
	},
	uncompletePhase: function (phase) {
		var self = this;
		phase.status = 'In Progress';
		phase.completed = false;
		phase.completedBy = null;
		phase.dateCompleted = null;
		phase.progress = 0;
		return self.findOne ({project:phase.project, order: (phase.order+1)})
		.then( function (nextPhase) {
			if (nextPhase) {
				nextPhase.status = "Not Started";
				nextPhase.completed = false;
				nextPhase.completedBy = null;
				nextPhase.dateCompleted = null;
				nextPhase.dateStarted = null;
				nextPhase.progress = 0;
				return self.findAndUpdate(nextPhase);
			}
			return null;
		})
		.then(function () {
			return self.findAndUpdate(phase);
		});
	},
	// -------------------------------------------------------------------------
	//
	// override a phase, we assume that the reason was already entered
	//
	// -------------------------------------------------------------------------
	override: function (phase, reason) {
		var self = this;
		return new Promise (function (resolve, reject) {
			phase.status         = 'Not Required';
			phase.overrideReason = reason;
			phase.overridden     = true;
			phase.completed      = true;
			phase.completedBy    = self.user._id;
			phase.dateCompleted  = new Date ();
			self.overrideMilestones (phase)
				.then (self.findAndUpdate)
				.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// mark all outstanding underlying milestones as complete
	//
	// -------------------------------------------------------------------------
	completeMilestones: function (phase) {
		if (!phase.milestones) {
			return Promise.resolve(phase);
		} else {
			var self = this;
			var Milestone = new MilestoneClass (self.opts);
			return Promise.all (phase.milestones.map (function (milestoneId) {
				return Milestone.findById (milestoneId);
			}))
			.then (function (result) {
				return Promise.all (result.map (function (milestone) {
					if (milestone.completed) return milestone;
					else return Milestone.complete (milestone);
				}));
			});
		}
	},
	// -------------------------------------------------------------------------
	//
	// mark all outstanding underlying milestones as overridden
	//
	// -------------------------------------------------------------------------
	overrideMilestones: function (phase) {
		var self = this;
		return Promise.all (phase.milestones.map (function (milestone) {
			var Milestone = new MilestoneClass (self.opts);
			if (milestone.completed) return milestone;
			else return Milestone.override (milestone, phase.overrideReason);
		}));
	},
	// -------------------------------------------------------------------------
	//
	// get phases based on a project, or not, with access of read or write
	// the default get * already does any project, read, so we just need
	// to do any project, write, and project read/write
	//
	// -------------------------------------------------------------------------
	userPhases: function (projectCode, access) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var q = (projectCode) ? {projectCode:projectCode} : {} ;
			var p = (access === 'write') ? self.listwrite (q) : self.list (q);
			p.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// phase for project that this user can read
	//
	// -------------------------------------------------------------------------
	phasesForProject: function (id) {
		var p = this.list ({project:id});
		return new Promise (function (resolve, reject) {
			p.then (resolve, reject);
		});
	}

});
