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
var Roles          = require (path.resolve('./modules/roles/server/controllers/role.controller'));

module.exports = DBModel.extend ({
	name : 'Phase',
	plural : 'phases',
	bind: ['complete'],
	// -------------------------------------------------------------------------
	//
	// just get a base phase, returns a promise
	//
	// -------------------------------------------------------------------------
	getPhaseBase: function (code) {
		return (new PhaseBaseClass (this.user)).findOne ({code:code});
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
				console.log ('found the base');
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
				console.log ('copied the base into new phase with id ', m._id, m.milestones);
				phase = m;
				phase.phaseBase = baseId;
				return self.setInitalDates (phase);
			})
			//
			// copy over stuff from the project
			//
			.then (function (m) {
				return self.setAncestry (m, project);
			})
			//
			// adds each milestone, inefficient, but there will not be a lot
			// so not too much of an issue
			//
			.then (function (m) {
				console.log ('all set to add milestones');
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
				return self.saveDocument (phase);
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
		var Milestone = new MilestoneClass (self.user);
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
		phase.dateCompletedEst = new Date (phase.dateStarted);
		phase.dateCompletedEst.setDate (phase.dateCompletedEst.getDate () + phase.duration);
		console.log ('starting pahse', phase._id, phase.name);
		return this.findAndUpdate (phase);
	},
	// -------------------------------------------------------------------------
	//
	// complete a phase. this marks underlying milestones as complete, we
	// may rather want to mark them as overridden.
	//
	// -------------------------------------------------------------------------
	complete: function (phase) {
		var self = this;
		return new Promise (function (resolve, reject) {
			if (!phase.completed) {
				phase.status        = 'Completed';
				phase.completed     = true;
				phase.completedBy   = self.user._id;
				phase.dateCompleted = new Date ();
				self.completeMilestones (phase)
				.then (self.findAndUpdate)
				.then (resolve, reject);
			} else {
				resolve (phase);
			}
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
			phase.completedBy    = this.user._id;
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
		console.log ('completing milestones');
		var self = this;
		return Promise.all (phase.milestones.map (function (milestone) {
			var Milestone = new MilestoneClass (self.user);
			if (milestone.completed) return milestone;
			else return Milestone.complete (milestone);
		}));
	},
	// -------------------------------------------------------------------------
	//
	// mark all outstanding underlying milestones as overridden
	//
	// -------------------------------------------------------------------------
	overrideMilestones: function (phase) {
		var self = this;
		return Promise.all (phase.milestones.map (function (milestone) {
			var Milestone = new MilestoneClass (self.user);
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

	// // -------------------------------------------------------------------------
	// //
	// // add a milestone to a phase from a base milestone (creates a proper
	// // milestone with all its children and pushes it onto the array)
	// //
	// // -------------------------------------------------------------------------
	// addMilestoneFromBase : function (phase, milestonebase, roles) {
	// 	var self = this;
	// 	var Milestone = new MilestoneClass (this.user);
	// 	return new Promise (function (resolve, reject) {
	// 		Milestone.makeMilestoneFromBase (
	// 			milestonebase,
	// 			phase.stream,
	// 			phase.project,
	// 			phase.projectCode,
	// 			phase._id,
	// 			roles
	// 		)
	// 		.then (function (newmilestone) {
	// 			phase.milestones.push (newmilestone._id);
	// 			return phase;
	// 		})
	// 		.then (self.saveDocument)
	// 		.then (resolve, reject);
	// 	});
	// },
	// // -------------------------------------------------------------------------
	// //
	// // given a base milestone code, add a copy of it to the phase
	// //
	// // -------------------------------------------------------------------------
	// addMilestoneFromCode : function (phase, milestoneCode, roles) {
	// 	var self = this;
	// 	return new Promise (function (resolve, reject) {
	// 		var PhaseBase = new PhaseBaseClass (self.user);
	// 		PhaseBase.findOne ({
	// 			code: milestoneCode
	// 		})
	// 		.then (function (base) {
	// 			return self.addMilestoneFromBase (phase, base, roles);
	// 		})
	// 		.then (resolve, reject);
	// 	});
	// },

	// // -------------------------------------------------------------------------
	// //
	// // when making a phase from a base it will aslways be in order to attach
	// // to a project, so the project and stream are passed in here along with the
	// // base
	// // make our new phase so we have an id
	// // first get all the milestones and make propoer objects from those,
	// // reverse link the new milestones to the new phase by passing in the
	// // ancestry
	// // save the phase
	// //
	// // -------------------------------------------------------------------------
	// makePhaseFromBase : function (base, streamid, projectid, projectcode, roles) {
	// 	var self = this;
	// 	var Milestone = new MilestoneClass (this.user);
	// 	var MilestoneBase = new MilestoneBaseClass (this.user);
	// 	return new Promise (function (resolve, reject) {
	// 		var baseid = base._id;
	// 		var newobjectid;
	// 		var newobject;
	// 		var children;
	// 		var basename = 'phaseBase';
	// 		var newchildfunction = Milestone.makeMilestoneFromBase;
	// 		var findchildbyid = MilestoneBase.findById;
	// 		var childname = 'milestones';
	// 		// get all the children
	// 		Promise.all (base[childname].map (findchildbyid))
	// 		.then (function (models) {
	// 			// assign it for later use
	// 			children = models;
	// 			// make the new newobject from the base
	// 			return self.copy (base);
	// 		})
	// 		.then (function (model) {
	// 			newobjectid = model._id;
	// 			newobject   = model;
	// 			//
	// 			// fix the roles
	// 			//
	// 			model.fixRoles (projectcode);
	// 			if (roles) model.addRoles (roles);
	// 			RoleController.addRolesToConfigObject (model, 'phases', model.roleSet());
	// 			//
	// 			// assign whatever ancenstry is needed
	// 			//
	// 			model[basename] = baseid;
	// 			model.project = projectid;
	// 			model.projectCode = projectcode;
	// 			model.stream  = streamid;
	// 			// return the promise of new children
	// 			return Promise.all (children.map (function (m) {
	// 				return Milestone.makeMilestoneFromBase (m, streamid, projectid, projectcode, newobjectid, roles);
	// 			}));
	// 		})
	// 		.then (function (models) {
	// 			// assign each new child to the newobject
	// 			_.each (models, function (m) {
	// 				newobject[childname].push (m._id);
	// 			});
	// 			return newobject;
	// 		})
	// 		.then (self.saveDocument)
	// 		.then (resolve, reject);
	// 	});
	// },


