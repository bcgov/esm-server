'use strict';
// =========================================================================
//
// Controller for Task
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	name : 'Task',
	plural : 'tasks',
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
	makeTaskFromBase : function (base, streamid, projectid, projectcode, phaseid, milestoneid, activityid) {
		var self = this;
		return new Promise (function (resolve, reject) {
			// make the new newobject from the base
			var baseid = base._id;
			self.copy (base)
			.then (function (model) {
				// assign whatever ancenstry is needed
				model.taskBase  = baseid;
				model.project   = projectid;
				model.projectCode = projectcode;
				model.stream    = streamid;
				model.phase     = phaseid;
				model.milestone = milestoneid;
				model.activity  = activityid;
				return model;
			})
			.then (function (m) {
				return self.saveDocument (m);
			})
			.then (resolve, reject);
		});
	}
});
