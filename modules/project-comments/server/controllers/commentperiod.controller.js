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
var mongoose				= require('mongoose');

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


		// ESM-761: we are limiting vet and classify roles, so ensure it happens at this level too..
		// Note, project-system-admin will not be added in the UI / Client, but we always want them to have the power...
		// Changes here need should be synced with the UI, don't want them selecting from a different set of roles than they can save.

		var defaultWriteDeleteRoles = ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']; // this is what is in the _defaults table... retain those...
		var allowedVettingRoles = ['assessment-lead', 'assessment-team', 'project-epd'];
		var allowedClassificationRoles = ['assessment-lead', 'assessment-team', 'project-epd', 'proponent-lead', 'proponent-team'];

		period.vettingRoles = _.intersection(period.vettingRoles, allowedVettingRoles);
		period.classificationRoles = _.intersection(period.classificationRoles, allowedClassificationRoles);
		period.vettingRoles = _.uniq(_.concat(period.vettingRoles, ['project-system-admin']));
		period.classificationRoles = _.uniq(_.concat(period.classificationRoles, ['project-system-admin']));

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
			addComment       : _.uniq(_.concat(period.commenterRoles, defaultWriteDeleteRoles)),
			read             : allroles,
			write            : _.uniq(_.concat(period.vettingRoles, period.classificationRoles, defaultWriteDeleteRoles)),
			delete           : defaultWriteDeleteRoles,
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
	getStats: function(period) {
		var self    = this;
		var Comment = this.mongoose.model('Comment');

		var result = JSON.parse(JSON.stringify(period));
		result.topics = [];
		result.pillars = [];
		result.stats = {
			totalPending  : 0,
			totalDeferred : 0,
			totalPublic   : 0,
			totalRejected : 0,
			totalAssigned : 0,
			totalUnassigned : 0,
			totalPublicAssigned: 0
		};

		var topics = new Promise(function(res, rej) {
			Comment.aggregate([
				{
					$match: { period: period._id }
				},
				{
					$project: { _id: 1, 'topics': 1 }
				},
				{
					$unwind: '$topics'
				},
				{
					$group: {
						_id: '$topics',
						count: { $sum: 1 }
					}
				},
				{
					$sort : { 'count': -1}
				}
			], function (err, data) {
				if (err) {
					rej(err);
				} else {
					if (data) {
						result.topics = data;
						res();
					}
				}
			});
		});
		var pillars = new Promise(function(res, rej) {
			Comment.aggregate([
				{
					$match: { period: period._id }
				},
				{
					$project: { _id: 1, 'pillars': 1 }
				},
				{
					$unwind: '$pillars'
				},
				{
					$group: {
						_id: '$pillars',
						count: { $sum: 1 }
					}
				},
				{
					$sort : { 'count': -1}
				}
			], function (err, data) {
				if (err) {
					rej(err);
				} else {
					if (data) {
						result.pillars = data;
						res();
					}
				}
			});
		});
		var stats = new Promise(function(res,rej) {
			Comment.aggregate([
				{
					$match: { period: period._id }
				},
				{
					$group: {
						_id: null,
						total: {$sum: 1},
						totalPublished: { $sum: { $cond: [ {$eq: ['$isPublished', true]}, 1, 0 ] } },
						totalPending: { $sum: { $cond: [ {$eq: ['$eaoStatus', 'Unvetted']}, 1, 0 ] } },
						totalDeferred: { $sum: { $cond: [ {$eq: ['$eaoStatus','Deferred']}, 1, 0 ] } },
						totalPublic: { $sum: { $cond: [ {$eq: ['$eaoStatus','Published']}, 1, 0 ] } },
						totalRejected: { $sum: { $cond: [ {$eq: ['$eaoStatus','Rejected']}, 1, 0 ] } },
						totalAssigned: { $sum: { $cond: [ {$and: [{$eq: ['$proponentStatus','Classified']}, {$eq: ['$isPublished',true]}] }, 1, 0 ] } },
						totalUnassigned: { $sum: { $cond: [ {$and: [{$ne: ['$proponentStatus','Classified']}, {$eq: ['$isPublished',true]}] }, 1, 0 ] } },
						totalPublicAssigned: { $sum: { $cond: [ {$and: [{$eq: ['$proponentStatus','Classified']}, {$eq: ['$eaoStatus','Published']}] }, 1, 0 ] } }
					}
				}
			], function (err, data) {
				if (err) {
					rej(err);
				} else {
					if (data && _.size(data) === 1) {
						result.stats.total = data[0].total;
						result.stats.totalPublished = data[0].totalPublished;
						result.stats.totalPending = data[0].totalPending;
						result.stats.totalDeferred = data[0].totalDeferred;
						result.stats.totalPublic = data[0].totalPublic;
						result.stats.totalRejected = data[0].totalRejected;
						result.stats.totalAssigned = data[0].totalAssigned;
						result.stats.totalUnassigned = data[0].totalUnassigned;
						result.stats.totalPublicAssigned = data[0].totalPublicAssigned;
						result.stats.totalPublished = data[0].totalPublished;
					}
					res(result);
				}
			});
		});

		return new Promise(function(res, rej) {
			topics
				.then(function() {
					return pillars;
				})
				.then(function() {
					return stats;
				})
				.then(res, rej);
		});
	},
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
					return self.getStats(period);
				})
				.then(function(data) {
					resolve(data);
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
		return new Promise (function (resolve, reject) {
			self.getForProject(projectId)
			.then (function (periods) {
				var a = _.map(periods, function(period) {
					return self.getStats(period);
				});
				return Promise.all(a);
			})
			.then(function(data) {
				return data;
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
		if (!commentPeriod)
			return Promise.resolve();

		return new Promise(function (resolve, reject) {
			if(value) {
				commentPeriod.publish();
			}
			else {
				commentPeriod.unpublish();
			}
			commentPeriod.save()
				.then(function() {
					return commentPeriod;
				})
				.then(resolve, reject);
		});
	},


	removePeriod: function (period) {
		var DocumentModel = mongoose.model('Document');
		var CommentModel = mongoose.model('Comment');
		var PeriodModel = mongoose.model('CommentPeriod');

		return CommentModel.find({period : period._id })
			.then(function (comments) {
				var deleteDocs = [];
				_.each(comments, function (comment) {
					_.each(comment.documents, function (doc) {
						deleteDocs.push(doc);
					});
				});
				//console.log("docs to delete:", deleteDocs);
				return _.uniq(deleteDocs);
			})
			.then( function (promises) {
				var deleteDocs = function(item, query) {
					return new Promise(function (rs, rj) {
						// Delete it!
						//console.log("deleting doc:", item);
						DocumentModel.findOne({_id: item})
							.then( function (doc) {
								//console.log("found doc to delete:", doc);
								var fs = require('fs');
								fs.unlinkSync(doc.internalURL);
								return doc._id;
							})
							.then( function (docID) {
								return DocumentModel.remove({_id: docID});
							})
							.then(rs, rj);
					});
				};

				Promise.resolve ()
					.then (function () {
						return promises.reduce (function (current, item) {
							return current.then (function () {
								return deleteDocs(item);
							});
						}, Promise.resolve());
					});
			})
			.then( function (res) {
				//console.log("deleted docs:", JSON.stringify(res));
				//console.log("deleting comments...");
				return CommentModel.remove({period: period._id});
			})
			.then( function (res) {
				//console.log("deleted comments:", JSON.stringify(res));
				//console.log("deleting period:", period._id);
				return PeriodModel.remove({_id: period._id});
			})
			.then( function (res) {
				//console.log("deleted period:", JSON.stringify(res));
				return;
			});
	}
});

