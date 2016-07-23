'use strict';
// =========================================================================
//
// Controller for comments
//
// =========================================================================
var path       = require('path');
var Access     = require (path.resolve('./modules/core/server/controllers/core.access.controller'));
var DBModel    = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var PhaseClass = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var ActivityClass = require (path.resolve('./modules/activities/server/controllers/activity.controller'));
var MilestoneClass = require (path.resolve('./modules/milestones/server/controllers/milestone.controller'));
var ArtifactClass = require (path.resolve('./modules/artifacts/server/controllers/artifact.controller'));
var DocumentClass  = require (path.resolve('./modules/documents/server/controllers/core.document.controller'));
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
	},
	preprocessUpdate: function (period) {
		//console.log('commentperiod.preprocessUpdate...');
		var self=this;
		return Promise.resolve(period)
			.then(self.setRolesPermissions);
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
		var allroles = _.uniq(period.commenterRoles.concat (
			period.classificationRoles,
			period.vettingRoles,
			'eao-admin',
			'pro-admin'
		));
		//console.log ("commentperiod.setRolesPermissions - period", JSON.stringify (period, null, 4));
		//console.log('commentperiod.setRolesPermissions - allroles = ' + JSON.stringify(allroles, null, 4));
		var dataObj = {
			vetComments      : period.vettingRoles,
			classifyComments : period.classificationRoles,
			listComments     : period.commenterRoles,
			addComment       : period.commenterRoles,
			setPermissions   : ['eao-admin', 'pro-admin'],
			read             : allroles,
			write            : _.uniq(_.concat(period.vettingRoles, period.classificationRoles, 'eao-admin')),
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
		//console.log('commentperiod.setRolesPermissions - setting model permissions period = ' + JSON.stringify(period, null, 4));
		//console.log('commentperiod.setRolesPermissions - setting model permissions data = ' + JSON.stringify(dataObj, null, 4));
		return this.setModelPermissions (period, dataObj)
		.then (function () {
			//console.log('commentperiod.setRolesPermissions - returning period = ' + JSON.stringify(period, null, 4));
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

