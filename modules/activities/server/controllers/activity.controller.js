'use strict';
// =========================================================================
//
// Controller for Activity
//
// =========================================================================
var path      = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var ActivityBaseClass = require ('./activitybase.controller');
var _         = require ('lodash');
var RoleController = require (path.resolve('./modules/roles/server/controllers/role.controller'));


module.exports = DBModel.extend ({
	name : 'Activity',
	plural: 'activities',
	populate : 'tasks',
	bind: ['start','complete'],
	preprocessAdd: function (activity) {
		var self = this;
		return new Promise (function (resolve, reject) {
			RoleController.addRolesToConfigObject (activity, 'activities', {
				read   : ['project:eao:member', 'eao'],
				submit : ['project:eao:admin']
			})
			.then (function () {
				resolve (activity);
			})
			.catch (reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// start or complete activity
	//
	// -------------------------------------------------------------------------
	startActivity: function (oldDoc, newDoc) {
		newDoc.status = 'In Progress';
		return this.update (oldDoc, newDoc);
	},
	start: function (activity) {
		activity.status           = 'In Progress';
		activity.dateStarted      = Date.now ();
		activity.dateCompletedEst = Date.now ();
		activity.setDate (activity.dateCompletedEst.getDate () + activity.duration);
		return this.findAndUpdate (activity);
	},
	completeActivity: function (oldDoc, newDoc) {
		newDoc.status = 'Completed';
		return this.update (oldDoc, newDoc);
	},
	complete: function (activity) {
		activity.status        = 'Completed';
		activity.dateCompleted = Date.now ();
		return this.findAndUpdate (activity);
	},
	// -------------------------------------------------------------------------
	//
	// when making a activity from a base it will always be in order to attach
	// to a milestone, so the project and stream and milestone are passed in here along
	// with the base
	// make our new activity so we have an id
	// first get all the tasks and make proper objects from those,
	// reverse link the new tasks to the new activity by passing in the
	// ancestry
	// save the activity
	//
	// -------------------------------------------------------------------------
	makeActivityFromBase : function (base, streamid, projectid, projectcode, phaseid, milestoneid, roles) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var baseid = base._id;
			var newobjectid;
			var newobject;
			var children;
			var basename = 'activityBase';
			var model = self.copy (base);
			newobjectid = model._id;
			newobject   = model;
			//
			// fix the roles
			//
			model.fixRoles (projectcode);
			if (roles) model.addRoles (roles);
			RoleController.addRolesToConfigObject (model, 'activities', model.roleSet());
			//
			// assign whatever ancenstry is needed
			//
			model[basename] = baseid;
			model.project   = projectid;
			model.projectCode = projectcode;
			model.stream    = streamid;
			model.phase     = phaseid;
			model.milestone = milestoneid;
			self.saveDocument (model).then (resolve, reject);
		});
	},
	getActivityBase: function (code) {
		return (new ActivityBaseClass (this.user)).findOne ({code:code});
	},
	copyActivityBase: function (base) {
		return this.newDocument (base);
	},
	setInitalDates: function (activity) {
		activity.dateStartedEst = Date.now ();
		return activity;
	},
	setInitialRoles: function (activity, roles) {

	},
	// -------------------------------------------------------------------------
	//
	// get activities for a given context of access and project
	//
	// -------------------------------------------------------------------------
	userActivities: function (projectCode, access) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var q = (projectCode) ? {projectCode:projectCode} : {} ;
			var p = (access === 'write') ? self.listwrite (q) : self.list (q);
			p.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// activities for a milestone
	//
	// -------------------------------------------------------------------------
	activitiesForMilestone: function (id) {
		var p = this.list ({milestone:id});
		return new Promise (function (resolve, reject) {
			p.then (resolve, reject);
		});
	}
});
