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
		// jsherman - 20160729
		// do not like this, we've got defaults that add in permissions but are completely divorced from these roles
		// that we add.  Should all be in one place when we get a chance.

		/*
		 'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
		 'write' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
		 'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
		 'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
		 'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']

		 */
		var allroles = _.uniq(period.commenterRoles.concat (
			period.classificationRoles,
			period.vettingRoles,
			['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin']
		));
		//console.log ("commentperiod.setRolesPermissions - period", JSON.stringify (period, null, 4));
		//console.log('commentperiod.setRolesPermissions - allroles = ' + JSON.stringify(allroles, null, 4));
		var dataObj = {
			vetComments      : period.vettingRoles,
			classifyComments : period.classificationRoles,
			listComments     : period.commenterRoles,
			addComment       : _.uniq(_.concat(period.commenterRoles, ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'])),
			read             : allroles,
			write            : _.uniq(_.concat(period.vettingRoles, period.classificationRoles, ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'])),
			delete           : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
			// return Access.setObjectPermissionRoles ({
			// resource: period,
			// permissions: {
			// 	vetComments      : period.vettingRoles,
			// 	classifyComments : period.classificationRoles,
			// 	listComments     : period.commenterRoles,
			// 	addComment       : period.commenterRoles,
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
	getForPublic: function(id) {
		var self = this;
		var docs = new DocumentClass(self.opts);
		var period;
		return new Promise (function (resolve, reject) {
			self.findById (id)
				.then(function(p) {
					period = p;
					return docs.list({_id: {$in: p.relatedDocuments} });
				})
				.then(function(rd) {
					period.relatedDocuments = rd;
					resolve(period);
				});
		});
	},
	getForProject: function(projectId) {
		var self = this;
		var docs = new DocumentClass(self.opts);
		var periods;
		return new Promise (function (resolve, reject) {
			self.list ({project:projectId})
				.then(function(ps) {
					periods = ps;
					var promises = _.map(ps, function(p) {
						return new Promise(function(resolve, reject) {
							docs.list({_id: {$in: p.relatedDocuments} })
								.then(function(ds) {
									p.relatedDocuments = ds;
									resolve(p);
								});
						});
					});
					return Promise.all(promises);
				})
				.then(function(data) {
					resolve(data);
				});
		});
	},
	getForProjectWithStats: function (projectId) {
		var self    = this;
		var Comment = this.mongoose.model('Comment');
		return new Promise (function (resolve, reject) {
			self.getForProject(projectId)
			.then(function(res) {
				//console.log('periods = ' + JSON.stringify(res));
				return new Promise(function (resolve, reject) {
					Comment
					.find ({period: {$in: _.map(res, '_id') }})
					.exec()
					.then(function(docs) {
						resolve({periods: res, comments: docs});
					});
				});
			})
			.then (function (data) {
				//console.log('data = ' +  JSON.stringify(data, null, 4));
				// get stats for each period.
				var periodsWithStats = [];
				_.forEach(data.periods, function(period) {
					var mycomments = _.filter(data.comments, function(o) { return o.period.toString() === period._id.toString(); });
					//console.log('period = ' + period._id + ' comments = ' + mycomments.length);
					//console.log('period = ', JSON.stringify(period));
					var periodWithStat = JSON.parse(JSON.stringify(period));
					periodWithStat.stats = {
						totalPending  : 0,
						totalDeferred : 0,
						totalPublic   : 0,
						totalRejected : 0,
						totalAssigned : 0,
						totalUnassigned : 0,
						totalPublicAssigned: 0
					};
					//console.log('periodWithStat = ',JSON.stringify(periodWithStat, null, 4));
					mycomments.reduce (function (prev, next) {
						periodWithStat.stats.totalPending  += (next.eaoStatus === 'Unvetted' ? 1 : 0);
						periodWithStat.stats.totalDeferred += (next.eaoStatus === 'Deferred' ? 1 : 0);
						periodWithStat.stats.totalPublic   += (next.eaoStatus === 'Published' ? 1 : 0);
						periodWithStat.stats.totalRejected += (next.eaoStatus === 'Rejected' ? 1 : 0);
						periodWithStat.stats.totalAssigned += (next.proponentStatus === 'Classified' ? 1 : 0);
						periodWithStat.stats.totalUnassigned += (next.proponentStatus !== 'Classified' ? 1 : 0);
						periodWithStat.stats.totalPublicAssigned   += (next.proponentStatus === 'Classified' && next.eaoStatus === 'Published' ? 1 : 0);
					}, periodWithStat.stats);
					//console.log('periodWithStat.stats = ',JSON.stringify(periodWithStat.stats));
					//console.log('periodWithStat = ',JSON.stringify(periodWithStat, null, 4));
					periodsWithStats.push(periodWithStat);
				});
				return periodsWithStats;
			})
			.then(function(res) {
				//console.log('periodWithStats = ',JSON.stringify(res, null, 4));
				return res;
			})
			.then (resolve, reject);
		});
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

