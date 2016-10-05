'use strict';
// =========================================================================
//
// Controller for Activity
//
// =========================================================================
var _                 = require ('lodash');
var path              = require('path');
var DBModel           = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
// var Roles             = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var ActivityBaseClass = require ('./activitybase.controller');


module.exports = DBModel.extend ({
	name : 'Activity',
	plural: 'activities',
	bind: ['start','complete','copyActivityBase','setInitalDates'],
	// -------------------------------------------------------------------------
	//
	// just get a base activity, returns a promise
	//
	// -------------------------------------------------------------------------
	getActivityBase: function (code) {
		return (new ActivityBaseClass (this.opts)).findOne ({code:code});
	},
	// -------------------------------------------------------------------------
	//
	// copy a base activity into a new activity and return the promise of it
	//
	// -------------------------------------------------------------------------
	copyActivityBase: function (base) {
		return this.copy (base);
	},
	// -------------------------------------------------------------------------
	//
	// set dateStartedEst from duration, return activity
	//
	// -------------------------------------------------------------------------
	setInitalDates: function (activity) {
		activity.dateStartedEst   = new Date ();
		activity.dateCompletedEst = new Date ();
		activity.dateCompletedEst.setDate (activity.dateCompletedEst.getDate () + activity.duration);
		if (activity.startOnCreate) {
			activity.status           = 'In Progress';
			activity.dateStarted      = new Date ();
		}
		return activity;
	},
	// -------------------------------------------------------------------------
	//
	// copy milestone ancestry into activity and return activity
	//
	// -------------------------------------------------------------------------
	setAncestry: function (activity, milestone) {
		activity.milestone   = milestone._id;
		activity.phase       = milestone.phase;
		activity.phaseName   = milestone.phaseName;
		activity.phaseCode   = milestone.phaseCode;
		activity.project     = milestone.project;
		activity.projectCode = milestone.projectCode;
		activity.stream      = milestone.stream;
		activity.order       = milestone.activities.length + 1;
		return activity;
	},
	// -------------------------------------------------------------------------
	//
	// build a permission set from the default eao and proponent roles for the
	// project indicated by the projectCode copied earlier from the milestone
	// return the promise from the role machine (this also saves the activity
	// and resolves to the list of activities passed in, all saved)
	//
	// -------------------------------------------------------------------------
	setDefaultRoles: function (activity, base) {
		return activity;
		//
		// TBD ROLES
		//

		// var permissions = {
		// 	read:[],
		// 	write:[],
		// 	submit:[],
		// 	watch:[]
		// };
		// _.each (base.default_eao_read   , function (code) {
		// 	permissions.read.push (Roles.generateCode (activity.projectCode, 'eao', code));
		// });
		// _.each (base.default_eao_write  , function (code) {
		// 	permissions.write.push (Roles.generateCode (activity.projectCode, 'eao', code));
		// });
		// _.each (base.default_eao_submit , function (code) {
		// 	permissions.submit.push (Roles.generateCode (activity.projectCode, 'eao', code));
		// });
		// _.each (base.default_eao_watch  , function (code) {
		// 	permissions.watch.push (Roles.generateCode (activity.projectCode, 'eao', code));
		// });
		// _.each (base.default_pro_read   , function (code) {
		// 	permissions.read.push (Roles.generateCode (activity.projectCode, 'pro', code));
		// });
		// _.each (base.default_pro_write  , function (code) {
		// 	permissions.write.push (Roles.generateCode (activity.projectCode, 'pro', code));
		// });
		// _.each (base.default_pro_submit , function (code) {
		// 	permissions.submit.push (Roles.generateCode (activity.projectCode, 'pro', code));
		// });
		// _.each (base.default_pro_watch  , function (code) {
		// 	permissions.watch.push (Roles.generateCode (activity.projectCode, 'pro', code));
		// });
		// return Roles.objectRoles ({
		// 	method      : 'set',
		// 	objects     : activity,
		// 	type        : 'activities',
		// 	permissions : permissions
		// });
	},
	// -------------------------------------------------------------------------
	//
	// start an activity
	//
	// -------------------------------------------------------------------------
	start: function (activity) {
		activity.status           = 'In Progress';
		activity.dateStarted      = new Date ();
		activity.dateCompletedEst = new Date ();
		activity.dateCompletedEst.setDate (activity.dateCompletedEst.getDate () + activity.duration);
		return this.findAndUpdate (activity);
	},
	// -------------------------------------------------------------------------
	//
	// complete an activity
	//
	// -------------------------------------------------------------------------
	complete: function (activity) {
		activity.status        = 'Complete';
		activity.completed     = true;
		activity.completedBy   = this.user._id;
		activity.dateCompleted = new Date ();
		return this.findAndUpdate (activity);
	},
	// -------------------------------------------------------------------------
	//
	// override an activity
	//
	// -------------------------------------------------------------------------
	override: function (activity, reason) {
		activity.status         = 'Not Required';
		activity.overrideReason = reason;
		activity.overridden     = true;
		activity.completed      = true;
		activity.completedBy    = this.user._id;
		activity.dateCompleted  = new Date ();
		return this.findAndUpdate (activity);
	},
	// -------------------------------------------------------------------------
	//
	// Using the functions above, make a new activity from a base code and
	// attach it to the passed in milestone and the milestone ancestry
	// if data is present, then attach that as well
	//
	// -------------------------------------------------------------------------
	fromBase: function (code, milestone, data) {
		var self = this;
		var base;
		var baseId;
		var activity;
		//
		// allow anyone to make a new activity, this is needed as they
		// get created for all sorts of things automatically and it would
		// be a nightmare trying to limit both creation and usage
		//
		this.setForce (true);
		return new Promise (function (resolve, reject) {
			//
			// get the base
			//
			// console.log ('Activity From Base:'+code+' Step 1');
			self.getActivityBase (code)
			//
			// copy its id and such before we lose it, then copy the entire thing
			//
			.then (function (m) {
				// console.log ('Activity From Base:'+code+' Step 2');
				base = m;
				baseId = m._id;
				return self.copyActivityBase (base);
			})
			//
			// set the base id and then initial dates
			//
			.then (function (m) {
				// console.log ('Activity From Base:'+code+' Step 3');
				activity = m;
				activity.activityBase = baseId;
				return self.setInitalDates (activity);
			})
			//
			// copy over stuff from the milestone
			//
			.then (function (m) {
				// console.log ('Activity From Base:'+code+' Step 4');
				if (m) {
					return self.setAncestry (m, milestone);
				} else {
					return null;
				}
			})
			//
			// set up all the default roles, creates them if need be
			//
			.then (function (m) {
				activity.data = data ? data : {};
				activity.data.projectid = activity.projectCode;
				// console.log ('Activity From Base:'+code+' Step 5');
				// console.log ('setting roles');
				return self.setDefaultRoles (m, base);
			})
			//
			// the model was saved during the roles step so we just
			// have to resolve it here
			//
			.then (function (model) {
				// console.log ('new activity created: ', JSON.stringify(model,null,4));
				if (milestone) {
					milestone.activities.push (model._id);
					milestone.save ();
				}
				// console.log ('Activity From Base:'+code+' Step 6');
				// console.log ('all done setting roles, and the activity was saved during that');
				return (model);
			})
			.then (resolve, reject);
		});
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
			// q.dateCompletedEst = { "$lt": new Date () };
			// console.log ('q = ', JSON.stringify(q,null,4));
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

/*
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
*/
