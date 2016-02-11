'use strict';
// =========================================================================
//
// Controller for Milestone
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var ActivityClass = require (path.resolve('./modules/activities/server/controllers/activity.controller'));
var ActivityBaseClass = require (path.resolve('./modules/activities/server/controllers/activitybase.controller'));
var _ = require ('lodash');


module.exports = DBModel.extend ({
	name : 'Milestone',
	populate: 'activities',
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
	makeMilestoneFromBase : function (base, streamid, projectid, projectcode, phaseid) {
		var self = this;
		// console.log ('in miolestone', base);
		var Activity = new ActivityClass (this.user);
		var ActivityBase = new ActivityBaseClass (this.user);

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
				// fix the roles
				model.fixRoles (projectcode);
				// assign whatever ancenstry is needed
				model[basename] = baseid;
				model.project = projectid;
				model.projectCode = projectcode;
				model.stream  = streamid;
				model.phase   = phaseid;
				// return the promise of new children
				return Promise.all (children.map (function (m) {
					return Activity.makeActivityFromBase (m, streamid, projectid, projectcode, phaseid, newobjectid);
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
	// -------------------------------------------------------------------------
	//
	// add an activity to this milestone (from a base)
	//
	// -------------------------------------------------------------------------
	addActivityFromBase : function (milestone, activitybase) {
		var self = this;
		var Activity = new ActivityClass (self.user);
		return new Promise (function (resolve, reject) {
			Activity.makeActivityFromBase (
				activitybase,
				milestone.stream,
				milestone.project,
				milestone.projectCode,
				milestone.phase,
				milestone._id
			)
			.then (function (newactivity) {
				milestone.activities.push (newactivity._id);
				return milestone;
			})
			.then (self.saveDocument)
			.then (resolve, reject);
		});
	}
});
