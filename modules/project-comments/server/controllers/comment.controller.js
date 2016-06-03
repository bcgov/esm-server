'use strict';
// =========================================================================
//
// Controller for comments
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var Roles = require (path.resolve('./modules/roles/server/controllers/role.controller'));

module.exports = DBModel.extend ({
	name : 'Comment',
	plural: 'comments',
	populate : {path:'user', select:'_id displayName username orgCode'},
	// -------------------------------------------------------------------------
	//
	// since public users may be saving comments we should temprarily allow
	// them permision to do so
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (doc) {
		this.setForce (true);
		console.log (doc.project);
		return new Promise (function (resolve, reject) {
			Roles.objectRoles ({
				method      : 'set',
				objects     : doc,
				type        : 'comments',
				permissions : {
					read: [],
					write: [Roles.generateCode (doc.project.code, 'eao', 'member'), Roles.generateCode (doc.project.code, 'pro', 'member')],
					submit: []
				}
			})
			.then (resolve, reject);
		});
	},
	preprocessUpdate: function (doc) {
		return new Promise (function (resolve, reject) {
			if (doc.valuedComponents.length === 0) {
				doc.proponentStatus = 'Unclassified';
			}
			if (doc.eaoStatus === 'Published') {
				doc.publish ();
			} else {
				doc.unpublish ();
			}
			resolve (doc);

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
					data          : data
				};
				data.reduce (function (prev, next) {
					ret.totalPending  += (next.eaoStatus === 'Unvetted' ? 1 : 0);
					ret.totalDeferred += (next.eaoStatus === 'Deferred' ? 1 : 0);
					ret.totalPublic   += (next.eaoStatus === 'Published' ? 1 : 0);
					ret.totalRejected += (next.eaoStatus === 'Rejected' ? 1 : 0);
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
	}
});

