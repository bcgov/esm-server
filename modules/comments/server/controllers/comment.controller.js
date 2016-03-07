'use strict';
// =========================================================================
//
// Controller for comments
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Comment',
	plural: 'comments',
	populate : {path:'user', select:'_id displayName username orgCode'},
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

