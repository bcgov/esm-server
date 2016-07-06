'use strict';
// =========================================================================
//
// Controller for comments
//
// =========================================================================
var path       = require('path');
var Access     = require (path.resolve('./modules/core/server/controllers/cc.access.controller'));
var DBModel    = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));
var PhaseClass = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var ActivityClass = require (path.resolve('./modules/activities/server/controllers/activity.controller'));
var MilestoneClass = require (path.resolve('./modules/milestones/server/controllers/milestone.controller'));
var ArtifactClass = require (path.resolve('./modules/artifacts/server/controllers/artifact.controller'));
var _          = require ('lodash');

module.exports = DBModel.extend ({
	name : 'CommentPeriod',
	plural : 'commentperiods',
	populate: 'artifact',
	bind: ['setArtifactStage', 'addActivities', 'setRolesPermissions'],
	preprocessAdd: function (period) {
		var self=this;
		return Promise.resolve (period)
		.then (self.setArtifactStage)
		.then (self.addActivities)
		.then (self.setRolesPermissions);
		// var p;
		// var phaseModel = new PhaseClass (this.opts);
		// var artifactModel = new ArtifactClass (this.opts);
		// var activityModel = new ActivityClass (this.opts);
		// var milestoneModel = new MilestoneClass (this.opts);
		// var projectCode;
		// console.log ('CommentPeriod preprocessAdd 12');
		// return Promise.resolve ()
		// .then (function () {
		// console.log ('CommentPeriod preprocessAdd 13');
		// 	return phaseModel.findById (period.phase);
		// })
		// .then (function (phase) {
		// 	if (period.periodType === 'Public') {
		// 		//
		// 		// add the base milestone for public comments
		// 		//
		// console.log ('CommentPeriod preprocessAdd 14-1');
		// 		period.publish ();
		// console.log ('CommentPeriod preprocessAdd 14');
		// 		return phaseModel.addMilestone (phase, 'public-comment-period', {write:period.commenterRoles});
		// 	}
		// 	else if (period.periodType === 'Working Group') {
		// 		//
		// 		// add the base milestone for working group comments
		// 		//
		// 		return phaseModel.addMilestone (phase, 'comment-period', {write:period.commenterRoles});
		// 	}
		// console.log ('CommentPeriod preprocessAdd 2');
		// })
		// .then (function (phase) {
		// 	console.log ('phase: ',JSON.stringify (phase,null,4));
		// 	var milestone = _.last (phase.milestones);
		// 	projectCode = phase.projectCode;
		// 	return milestoneModel.findById (milestone);
		// })
		// .then (function (milestone) {
		// 	return activityModel.findById (milestone.activities[0]);
		// })
		// .then (function (activity) {
		// 	activity.data = {
		// 		projectid : projectCode,
		// 		artifactId : period.artifact
		// 	};
		// 	return activityModel.saveDocument (activity);
		// })
		// .then (function () {
		// 	return artifactModel.findById (period.artifact);
		// })
		// .then (function (artifact) {
		// 	artifact.heldStage = artifact.stage;
		// 	artifact.stage = (period.periodType === 'Public')? 'Public Comment Period' : 'Comment Period';
		// 	if (period.periodType === 'Public') artifact.publish ();
		// 	return artifactModel.saveDocument (artifact);
		// })
		// .then (function () {
		// 	console.log ('last step');
		// 	return period;
		// });
	},
	// -------------------------------------------------------------------------
	//
	// TBD
	// Let the artifact know tha it should now be moving in to comment period
	// stage
	//
	// -------------------------------------------------------------------------
	setArtifactStage: function (period) {
		return new Promise (function (resolve, reject) {
			resolve (period);
		});
	},
	// -------------------------------------------------------------------------
	//
	// add the appropriate activities with the correct roles
	//
	// -------------------------------------------------------------------------
	addActivities: function (period) {
		return new Promise (function (resolve, reject) {
			resolve (period);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set the read / write / etc roles based on the input
	//
	// -------------------------------------------------------------------------
	setRolesPermissions: function (period) {
		var allroles = period.commenterRoles.concat (
			period.classificationRoles,
			period.vettingRoles,
			'eao-admin',
			'pro-admin'
		);
		// console.log ("setRolesPermissions: ", JSON.stringify (period, null, 4));
		var dataObj = {
			vetComments      : period.vettingRoles,
			classifyComments : period.classificationRoles,
			listComments     : period.commenterRoles,
			addComment       : period.commenterRoles,
			setPermissions   : ['eao-admin', 'pro-admin'],
			read             : allroles,
			write            : ['eao-admin'],
			delete           : ['eao-admin'],
			// return Access.setObjectPermissionRoles ({
			// resource: period,
			// permissions: {
			// 	vetComments      : period.vettingRoles,
			// 	classifyComments : period.classificationRoles,
			// 	listComments     : period.commenterRoles,
			// 	addComment       : period.commenterRoles,
			// 	setPermissions   : ['eao-admin', 'pro-admin'],
			// 	read             : allroles,
			// 	write            : ['eao-admin'],
			// 	delete           : ['eao-admin'],
			// }
		};
		return this.setModelPermissions (period, dataObj)
		.then (function () {
			return period;
		});
	},
	// -------------------------------------------------------------------------
	//
	// get all comment periods for a project
	//
	// -------------------------------------------------------------------------
	getForProject: function (projectId) {
		return this.list ({project:projectId});
	},
	// -------------------------------------------------------------------------
	//
	// resolve an ENTIRE period, all comment chains at once. returns the period
	//
	// -------------------------------------------------------------------------
	resolveCommentPeriod: function (commentPeriod) {
		var self    = this;
		var Comment = this.mongoose.model('Comment');
		var update  = { resolved: true };
		var query   = { period: commentPeriod._id };
		return new Promise (function (resolve, reject) {
			Comment.update (query, update, {multi: true}).exec()
			.then (function () {
				commentPeriod.set ({resolved:true});
				return self.saveDocument (commentPeriod);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish an ENTIRE period, all comment chains at once. returns the period
	//
	// -------------------------------------------------------------------------
	publishCommentPeriod: function (commentPeriod, value) {
		var self    = this;
		var Comment = this.mongoose.model('Comment');
		var query   = { period: commentPeriod._id };
		var update;
		if (value) {
			update = {
				isPublished: true,
				$addToSet: {read: 'public'}
			};
		} else {
			update = {
				isPublished: false,
				$pull: {read: 'public'}
			};
		}
		return new Promise (function (resolve, reject) {
			Comment.update (query, update, {multi: true}).exec()
			.then (function () {
				commentPeriod.set ({ isPublished: value });
				return self.saveDocument (commentPeriod);
			})
			.then (resolve, reject);
		});
	}
});

