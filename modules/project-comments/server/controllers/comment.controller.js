'use strict';
// =========================================================================
//
// Controller for comments
//
// =========================================================================
var path     = require('path');
var Access    = require (path.resolve ('./modules/core/server/controllers/core.access.controller'));
var Period    = require ('./commentperiod.controller');
var DBModel   = require (path.resolve ('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
// var Roles = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var DocumentClass  = require (path.resolve('./modules/documents/server/controllers/core.document.controller'));

module.exports = DBModel.extend ({
	name : 'Comment',
	plural: 'comments',
	// populate : [{ path:'user', select:'_id displayName username orgCode'}, {path: 'valuedComponents', select: 'name'}],
	populate : [{ path:'user', select:'_id displayName username email orgName'},
				{ path:'updatedBy', select:'_id displayName username email orgName'},
				{ path:'documents', select:'_id eaoStatus'}],
	// -------------------------------------------------------------------------
	//
	// since public users may be saving comments we should temprarily allow
	// them permision to do so
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (comment) {
		// this.setForce (true);
		var self = this;
		var commentPeriod = new Period(this.opts);
		var documentClass = new DocumentClass(this.opts);
		return new Promise(function (resolve, reject) {
			//
			// get the period info
			//
			/*
			 'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
			 'write' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
			 'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
			 'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
			 'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']

			 */
			commentPeriod.findById(comment.period)
				.then(function (period) {
					console.log('period = ' + JSON.stringify(period, null, 4));
					//
					// ROLES
					//
					return self.setModelPermissions(comment, {
						read: period.vettingRoles,
						delete: ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
						write: _.uniq(_.concat(period.commenterRoles, period.vettingRoles, period.classificationRoles, ['assessment-lead', 'assessment-team', 'project-epd', 'project-working-group', 'project-technical-working-group', 'project-system-admin']))
					});
				})
				.then(function (commentPermissions) {
					//console.log('commentPermissions = ' + JSON.stringify(commentPermissions, null, 4));
					// get all the associated documents and update their permissions as required.
					return new Promise(function (resolve, reject) {
						var q = {_id : {$in : comment.documents }};
						documentClass.listforaccess ('i do not want to limit my access because public people add comments with docs too.', q)
							.then(function (data) {
								resolve({commentPermissions: commentPermissions, docs: data});
							});
					});
				})
				.then(function (data) {
					//console.log('data = ' + JSON.stringify(data, null, 4));
					var commentPermissions = data.commentPermissions;
					var docs = data.docs;
					return docs.reduce(function (current, doc, index) {
						// not publishing, but changing the permissions to match the comment
						return new Promise(function (resolve, reject) {
							documentClass.setModelPermissions(doc, commentPermissions)
								.then(function () {
									return doc.save();
								}).then(resolve, reject);
						});
					}, Promise.resolve());
				})
				.then(function() {
					// get the max commentId for the period...
					return new Promise(function(resolve, reject) {
						self.model
						.find({period : comment.period})
						.sort({commentId : -1})
						.limit(1).exec(function(err, maxResult) {
							if (maxResult && maxResult.length === 1) {
								var commentId = _.isFinite(maxResult[0].commentId) ?  maxResult[0].commentId + 1 : 1;
								resolve(commentId);
							} else if(!err) {
								resolve(1);
							} else {
								reject(new Error(err));
							}
						});
					});
				})
			.then(function(cId) {
					comment.commentId = _.isFinite(cId) ? cId : 1; // just check again... make sure this is a number.
					return comment;
				})
				.then(resolve, reject);
		});
	},
	preprocessUpdate: function (comment) {
		//console.log('comment.preprocessUpdate  comment = ' + JSON.stringify(comment, null, 4));
		var self = this;
		var commentPeriod = new Period (this.opts);
		var documentClass = new DocumentClass(this.opts);

		var thePeriod;

		if (comment.valuedComponents.length === 0) {
			comment.proponentStatus = 'Unclassified';
		}
		if (_.isEmpty(comment.proponentStatus)) {
			comment.proponentStatus = 'Unclassified';
		}
		return new Promise (function (resolve, reject) {
			//
			// get the period
			//
			commentPeriod.findById (comment.period)
			//
			// set published or unpublished with correct roles
			//
			.then (function (period) {
				thePeriod = period;
				if (comment.eaoStatus === 'Published') {
					//
					// ROLES, public read
					//
					comment.publish ();
					return self.setModelPermissions (comment, {
						read  : _.uniq(_.concat(thePeriod.read, 'public')),
						write: thePeriod.write,
						delete: thePeriod.delete
					});
				} else {
					//
					// ROLES, only vetting can read
					//
					comment.unpublish ();
					return self.setModelPermissions (comment, {
						read: thePeriod.vettingRoles,
						write: thePeriod.write,
						delete: thePeriod.delete
					});
					// console.log ('unpublished comment: ', JSON.stringify (comment, null, 4));
					// return Access.setObjectPermissionRoles ({
					// 	resource: comment,
					// 	permissions: {
					// 		read             : period.vettingRoles
					// 	}
					// });
				}
			})
			.then(function(commentPermissions) {
				// get all the associated documents and update their publish permissions as required.
				return new Promise(function(resolve, reject) {
					documentClass.getList(comment.documents)
						.then(function (data) {
							resolve({commentPermissions: commentPermissions, docs: data});
						});
				});
			})
			.then(function(data) {
				var commentPermissions = data.commentPermissions;
				var docs = data.docs;
				return docs.reduce(function (current, doc, index) {
					if ('Rejected' === comment.eaoStatus) {
						// just ensure that all documents are rejected if the comment is rejected...
						doc.eaoStatus = 'Rejected';
					}

					if ('Published' !== doc.eaoStatus) {
						// if the comment is published, but this document has been rejected, we don't want this document set to public read
						commentPermissions.read = thePeriod.vettingRoles;
					}
					// publish or unpublish the doc, and set the doc's permissions...
					return documentClass.publishForComment(doc, ('Published' === comment.eaoStatus && 'Published' === doc.eaoStatus), commentPermissions);
				}, Promise.resolve())	;
			})
			.then (function () {
				return comment;
			})
			.then (resolve, reject);
		});
	},
	getPublishedCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				period : periodId,
				isPublished: true
			})
			.then (resolve, reject);
		});
	},
	getAllCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				period : periodId
			})
				.then (resolve, reject);
		});
	},
	getEAOCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				period : periodId,
			})
			.then (function (data) {
				var ret = {
					totalPending  : 0,
					totalDeferred : 0,
					totalPublic   : 0,
					totalRejected : 0,
					totalAssigned : 0,
					totalUnassigned : 0,
					data          : data
				};
				data.reduce (function (prev, next) {
					ret.totalPending  += (next.eaoStatus === 'Unvetted' ? 1 : 0);
					ret.totalDeferred += (next.eaoStatus === 'Deferred' ? 1 : 0);
					ret.totalPublic   += (next.eaoStatus === 'Published' ? 1 : 0);
					ret.totalRejected += (next.eaoStatus === 'Rejected' ? 1 : 0);
					ret.totalAssigned += (next.proponentStatus === 'Classified' ? 1 : 0);
					ret.totalUnassigned += (next.proponentStatus !== 'Classified' ? 1 : 0);
				}, ret);
				resolve (ret);
			})
			.catch (reject);
		});
	},
	getProponentCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.getPublishedCommentsForPeriod (periodId)
			.then (function (data) {
				var classified = data.reduce (function (prev, next) {
					return prev + (next.proponentStatus === 'Classified' ? 1 : 0);
				}, 0);
				resolve ({
					data: data,
					totalAssigned : classified,
					totalUnassigned : data.length - classified
				});
			})
			.catch (reject);
		});
	},
	getCommentsForPeriod: function(periodId, eaoStatus, proponentStatus, isPublished,
								   commentId, authorComment, location, pillar, topic,
								   start, limit, sortby) {
		var self = this;

		var query = {period: periodId};
		var filterByFields = {};

		// base query...
		if (isPublished !== undefined) {
			query = _.extend({}, query, {isPublished: isPublished});
		}
		if (eaoStatus !== undefined) {
			query = _.extend({}, query, {eaoStatus: eaoStatus});
		}
		if (proponentStatus !== undefined) {
			if ('Classified' === proponentStatus) {
				query = _.extend({}, query, {proponentStatus: 'Classified'});
			} else {
				query = _.extend({}, query, {proponentStatus: {$ne: 'Classified'} });
			}
		}

		// filer by fields...
		if (commentId !== undefined) {
			filterByFields = _.extend({}, filterByFields, {commentId: commentId});
		}
		if (authorComment !== undefined) {
			var authorCommentRe = new RegExp(authorComment, "i");
			filterByFields = _.extend({}, filterByFields, { $or: [{author: authorCommentRe}, {comment: authorCommentRe}] } );
		}
		if (location !== undefined) {
			var locationRe = new RegExp(location, "i");
			filterByFields = _.extend({}, filterByFields, {location: locationRe});
		}
		if (pillar !== undefined) {
			filterByFields = _.extend({}, filterByFields, {pillars: {$in: [pillar] }});
		}
		if (topic !== undefined) {
			filterByFields = _.extend({}, filterByFields, {topics: {$in: [topic] }});
		}

		var fields = null;
		var populate = null;
		var userCan = false;

		return self.paginate(query, filterByFields, start, limit, fields, populate, sortby, userCan);
	},
	// -------------------------------------------------------------------------
	//
	// pass in the target type (Project Description, Document, AIR, etc)
	// and its Id (all as taken from the period or wherever you came from)
	// and the type of comments you are looking for (public, wg, ciaa, etc)
	// and this will return an array of conversations, sorted chronologically
	// with the internal messages in conversations also sorted the same
	//
	// -------------------------------------------------------------------------
	getCommentsForTarget : function (targetType, targetId, commentType) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				targetType : targetType,
				target     : targetId,
				type       : commentType
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// resolve entire chain and return it
	//
	// -------------------------------------------------------------------------
	resolveCommentChain: function (ancestorId) {
		var self = this;
		var query = { ancestor: ancestorId };
		var update = { resolved: true };
		var promise = self.model.update (query, update, {multi: true}).exec();
		return new Promise (function (resolve, reject) {
			promise.then (function () {
				return self.getCommentChain (ancestorId);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish/unpublish entire chain and return it
	//
	// -------------------------------------------------------------------------
	publishCommentChain: function (ancestorId, value) {
		var self = this;
		var query = { ancestor: ancestorId };
		var update;
		if (value) {
			update = {
				published: true,
				$addToSet: {read: 'public'}
			};
		} else {
			update = {
				published: false,
				$pull: {read: 'public'}
			};
		}
		var promise = self.model.update (query, update, {multi: true}).exec();
		return new Promise (function (resolve, reject) {
			promise.then (function () {
				return self.getCommentChain (ancestorId);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// return entire chain
	//
	// -------------------------------------------------------------------------
	getCommentChain: function (ancestorId) {
		return this.findMany ({ ancestor: ancestorId });
	},
	getCommentDocuments: function(id) {
		var self = this;
		var doc = new DocumentClass (this.opts);
		return new Promise (function (resolve, reject) {
			self.one({_id : id})
				.then(function(c) {
					return doc.getList(c.documents);
				})
				.then (resolve, reject);
		});
	}
});

