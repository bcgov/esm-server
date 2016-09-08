'use strict';
// =========================================================================
//
// Controller for Milestone
//
// =========================================================================
var _                  = require ('lodash');
var path               = require('path');
var DBModel            = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var ActivityClass      = require (path.resolve('./modules/activities/server/controllers/activity.controller'));
var MilestoneBaseClass = require ('./milestonebase.controller');
// var Roles              = require (path.resolve('./modules/roles/server/controllers/role.controller'));



module.exports = DBModel.extend ({
	name : 'Milestone',
	plural : 'milestones',
	populate: 'activities',
	bind: ['completeActivities','overrideActivities'],
	// -------------------------------------------------------------------------
	//
	// just get a base milestone, returns a promise
	//
	// -------------------------------------------------------------------------
	getMilestoneBase: function (code) {
		return (new MilestoneBaseClass (this.opts)).findOne ({code:code});
	},
	// -------------------------------------------------------------------------
	//
	// copy a base milestone into a new milestone and return the promise of it
	//
	// -------------------------------------------------------------------------
	copyMilestoneBase: function (base) {
		return this.copy (base);
	},
	// -------------------------------------------------------------------------
	//
	// set dateStartedEst from duration, return milestone
	//
	// -------------------------------------------------------------------------
	setInitalDates: function (milestone, phase) {
		//
		// set the initial estimated start date to either now, or the
		// start date of the phase if it is in the future
		//
		milestone.dateStartedEst   = new Date ();
		var phaseDate = (phase.dateStarted) ? new Date (phase.dateStarted) : new Date (phase.dateStartedEst);
		milestone.dateStartedEst = (phaseDate > milestone.dateStartedEst) ? phaseDate : milestone.dateStartedEst;
		//
		// set the estimated completed using the duration
		//
		// milestone.dateCompletedEst = new Date (milestone.dateStartedEst);
		// milestone.dateCompletedEst.setDate (milestone.dateCompletedEst.getDate () + milestone.duration);
		if (milestone.startOnCreate) {
			milestone.status      = 'In Progress';
			milestone.dateStarted = new Date ();
		}
		return milestone;
	},
	// -------------------------------------------------------------------------
	//
	// copy milestone ancestry into milestone and return milestone
	//
	// -------------------------------------------------------------------------
	setAncestry: function (milestone, phase) {
		milestone.phase       = phase._id;
		milestone.phaseName   = phase.name;
		milestone.phaseCode   = phase.code;
		milestone.project     = phase.project;
		milestone.projectCode = phase.projectCode;
		milestone.stream      = phase.stream;
		milestone.order       = phase.milestones.length + 1;
		return milestone;
	},
	// -------------------------------------------------------------------------
	//
	// Using the functions above, make a new milestone from a base code and
	// attach it to the passed in milestone and the milestone ancestry
	//
	// -------------------------------------------------------------------------
	fromBase: function (code, phase) {
		var self = this;
		var base;
		var baseId;
		var milestone;
		var activityCodes;
		return new Promise (function (resolve, reject) {
			//
			// get the base
			//
			console.log ('get base from code : ', code);
			self.getMilestoneBase (code)
			//
			// copy its id and such before we lose it, then copy the entire thing
			//
			.then (function (m) {
				console.log (m.activities);
				base          = m;
				baseId        = m._id;
				activityCodes = _.clone (m.activities);
				return self.copyMilestoneBase (base);
			})
			//
			// set the base id and then initial dates
			//
			.then (function (m) {
				milestone = m;
				milestone.milestoneBase = baseId;
				milestone.activities = [];
				return self.setInitalDates (milestone, phase);
			})
			//
			// copy over stuff from the phase
			//
			.then (function (m) {
				return self.setAncestry (m, phase);
			})
			//
			// adds each activity, inefficient, but there will not be a lot
			// so not too much of an issue
			//
			.then (function (m) {
				console.log ("++ new milestone with id:", m._id);
				console.log ("now adding activities from base ", activityCodes);
				//
				// This little bit of magic forces the synchronous executiuon of
				// async functions as promises, so a sync version of all.
				//
				return activityCodes.reduce (function (current, code) {
					return current.then (function () {
						// console.log ('++ add activity ', code);
						return self.addActivity (m, code);
					});
				}, Promise.resolve());
			})
			//
			// the model was saved during the roles step so we just
			// have to resolve it here
			//
			.then (function (models) {
				console.log ("Yay! the add activity promise array resolved to ", models);
				phase.milestones.push (milestone._id);
				phase.save ();
				return self.saveDocument (milestone);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// add an activity to this milestone (from a base code)
	// optionally merge in a set of permissions once complete
	//
	// -------------------------------------------------------------------------
	addActivity : function (milestone, basecode, permissions) {
		var self = this;
		var Activity = new ActivityClass (self.opts);
		return new Promise (function (resolve, reject) {
			//
			// get the new activity
			//
			Activity.fromBase (basecode, milestone)
			//
			// merge in the permissions (resolves to list of activities)
			// or, if no permissions to set, return the activity
			//
			.then (function (activity) {
				if (permissions && !_.isEmpty (permissions)) {
					// console.log ('Adding permissions');
					//
					// TBD ROLES
					//
					// return Roles.objectRoles ({
					// 	method      : 'add',
					// 	objects     : activity,
					// 	type        : 'activities',
					// 	permissions : permissions
					// });
					return activity;
				}
				else {
					return activity;
				}
			})
			.then (function (activity) {
				milestone.activities.push (activity);
				return self.saveDocument (milestone);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// add an an already created activity to the milestone
	//
	// -------------------------------------------------------------------------
	pushActivity : function (milestone, activity) {
		milestone.activities.push (activity);
		return this.saveDocument (milestone);
	},
	// -------------------------------------------------------------------------
	//
	// start a milestone
	//
	// -------------------------------------------------------------------------
	start: function (milestone) {
		milestone.status           = 'In Progress';
		milestone.dateStarted      = new Date ();
		// milestone.dateCompletedEst = new Date ();
		// milestone.dateCompletedEst.setDate (milestone.dateCompletedEst.getDate () + milestone.duration);
		return this.findAndUpdate (milestone);
	},
	// -------------------------------------------------------------------------
	//
	// complete a milestone. this marks underlying activities as complete, we
	// may rather want to mark them as overridden.
	//
	// -------------------------------------------------------------------------
	complete: function (milestone) {
		var self = this;
		return new Promise (function (resolve, reject) {
			milestone.status        = 'Complete';
			milestone.completed     = true;
			milestone.completedBy   = self.user._id;
			milestone.dateCompleted = new Date ();
			self.completeActivities (milestone)
			.then (function () {
				return self.findAndUpdate (milestone);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// override a milestone, we assume that the reason was already entered
	//
	// -------------------------------------------------------------------------
	override: function (milestone, reason) {
		var self = this;
		return new Promise (function (resolve, reject) {
			milestone.status         = 'Not Required';
			milestone.overrideReason = reason;
			milestone.overridden     = true;
			milestone.completed      = true;
			milestone.completedBy    = this.user._id;
			milestone.dateCompleted  = new Date ();
			self.overrideActivities (milestone)
			.then (self.findAndUpdate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// mark all outstanding underlying activities as complete
	//
	// -------------------------------------------------------------------------
	completeActivities: function (milestone) {
		// console.log ('completing activities',milestone.activities);
		var self = this;
		if (!milestone) {
			// console.log("returning early from milestone");
			return Promise.resolve(milestone);
		} else {
			// console.log (JSON.stringify (milestone, null, 4));
			return Promise.all (milestone.activities.map (function (activity) {
				var Activity = new ActivityClass (self.opts);
				if (activity.completed) return activity;
				else return Activity.complete (activity);
			}));
		}
	},
	// -------------------------------------------------------------------------
	//
	// mark all outstanding underlying activities as overridden
	//
	// -------------------------------------------------------------------------
	overrideActivities: function (milestone) {
		var self = this;
		return Promise.all (milestone.activities.map (function (activity) {
			var Activity = new ActivityClass (self.opts);
			if (activity.completed) return activity;
			else return Activity.override (activity, milestone.overrideReason);
		}));
	},
	// -------------------------------------------------------------------------
	//
	// return a promise of filling all activities out into proper activity
	// models. this is what populate does, except that populate is not
	// recursive, so this sort of allows us to cheat up the hierarchy
	//
	// -------------------------------------------------------------------------
	getMilestoneWithActivities : function (milestone) {
		var self = this;
		var Activity = new ActivityClass (self.opts);
		return new Promise (function (resolve, reject) {
			milestone = milestone.toObject ();
			var a = milestone.activities.map (function (id) {
				return Activity.findById (id);
			});
			Promise.all (a).then (function (models) {
				milestone.activities = models;
				return milestone;
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// get milestones for a given context of access and project
	//
	// -------------------------------------------------------------------------
	userMilestones: function (projectId, access) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var q = (projectId) ? { project: projectId } : {} ;
			var p = (access === 'write') ? self.listwrite (q) : self.list (q);
			p.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// milestones for a phase that this user can read
	//
	// -------------------------------------------------------------------------
	milestonesForPhase: function (id) {
		var p = this.list ({ phase: id });
		return new Promise (function (resolve, reject) {
			p.then (resolve, reject);
		});
	}
});
/*
	// -------------------------------------------------------------------------
	//
	// when making a milestone from a base it will always be in order to attach
	// to a phase, so the project and stream and phase are passed in here along
	// with the base
	// make our new milestone so we have an id
	// first get all the activities and make propoer objects from those,
	// reverse link the new activities to the new milestone by passing in the
	// ancestry
	// save the milestone
	//
	// -------------------------------------------------------------------------
	makeMilestoneFromBase : function (base, streamid, projectid, projectcode, phaseid, roles) {
		var self = this;
		// console.log ('in miolestone', base);
		var Activity = new ActivityClass (this.opts);
		var ActivityBase = new ActivityBaseClass (this.opts);

		return new Promise (function (resolve, reject) {
			var baseid = base._id;
			var newobjectid;
			var newobject;
			var children;
			var basename = 'milestoneBase';
			var newchildfunction = Activity.makeActivityFromBase;
			var findchildbyid = ActivityBase.findById;
			var childname = 'activities';
			// get all the children
			Promise.all (base[childname].map (findchildbyid))
			.then (function (models) {
				// assign it for later use
				children = models;
				// make the new newobject from the base
				return self.copy (base);
			})
			.then (function (model) {
				newobjectid = model._id;
				newobject   = model;
				//
				// fix the roles
				//
				model.fixRoles (projectcode);
				if (roles) model.addRoles (roles);
				RoleController.addRolesToConfigObject (model, 'milestones', model.roleSet());
				//
				// assign whatever ancenstry is needed
				//
				model[basename] = baseid;
				model.project = projectid;
				model.projectCode = projectcode;
				model.stream  = streamid;
				model.phase   = phaseid;
				// return the promise of new children
				return Promise.all (children.map (function (m) {
					return Activity.makeActivityFromBase (m, streamid, projectid, projectcode, phaseid, newobjectid, roles);
				}));
			})
			.then (function (models) {
				// assign each new child to the newobject
				_.each (models, function (m) {
					newobject[childname].push (m._id);
				});
				return newobject;
			})
			.then (self.saveDocument)
			// .then (function (m) {
			// 	return self.saveDocument (m);
			// })
			.then (resolve, reject);
		});
	},
*/
