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
	populate : [{ path:'user', select:'_id displayName username orgCode'},{ path:'updatedBy', select:'_id displayName username orgCode'}],
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
			commentPeriod.findById(comment.period)
				.then(function (period) {
					//
					// ROLES
					//
					return self.setModelPermissions(comment, {
						read: period.vettingRoles,
						delete: ['eao-admin'],
						write: period.commenterRoles.concat(
							period.classificationRoles,
							period.vettingRoles,
							'eao-admin',
							'pro-admin'
						),
					});
				})
				.then(function (commentPermissions) {
					// get all the associated documents and update their permissions as required.
					return new Promise(function (resolve, reject) {
						documentClass.getList(comment.documents)
							.then(function (data) {
								resolve({commentPermissions: commentPermissions, docs: data});
							});
					});
				})
				.then(function (data) {
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
				.then(function () {
					return comment;
				})
				.then(resolve, reject);
		});
	},
	preprocessUpdate: function (comment) {
		var self = this;
		var commentPeriod = new Period (this.opts);
		var documentClass = new DocumentClass(this.opts);

		var thePeriod;

		if (comment.valuedComponents.length === 0) {
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
						read  : ['public']
					});
					// console.log ('published comment: ', JSON.stringify (comment, null, 4));
					// return Access.setObjectPermissionRoles ({
					// 	resource: comment,
					// 	permissions: {
					// 		read             : ['public']
					// 	}
					// });
				} else {
					//
					// ROLES, only vetting can read
					//
					comment.unpublish ();
					return self.setModelPermissions (comment, {
						read  : period.vettingRoles
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
					return documentClass.publishForComment(doc, ('Published' === comment.eaoStatus &&  'Published' === doc.eaoStatus), commentPermissions);
				}, Promise.resolve())	;
			})
			.then (function () {
				return comment;
			})
			.then (resolve, reject);
		});
	},
	getCommentsForPeriod : function (periodId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				period : periodId,
				isPublished: true
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
			self.getCommentsForPeriod (periodId)
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

