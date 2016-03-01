'use strict';
// =========================================================================
//
// Controller for reviews
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Review',
	populate : {path:'user', select:'_id displayName username orgCode'},
	// -------------------------------------------------------------------------
	//
	// pass in the target type (Project Description, Document, AIR, etc)
	// and its Id (all as taken from the period or wherever you came from)
	// and the type of reviews you are looking for (public, wg, ciaa, etc)
	// and this will return an array of conversations, sorted chronologically
	// with the internal messages in conversations also sorted the same
	//
	// -------------------------------------------------------------------------
	getReviewsForTarget : function (targetType, targetId, reviewType) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({
				targetType : targetType,
				target     : targetId,
				type       : reviewType
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// resolve entire chain and return it
	//
	// -------------------------------------------------------------------------
	resolveReviewChain: function (ancestorId) {
		var self = this;
		var query = { ancestor: ancestorId };
		var update = { resolved: true };
		var promise = self.model.update (query, update, {multi: true}).exec();
		return new Promise (function (resolve, reject) {
			promise.then (function () {
				return self.getReviewChain (ancestorId);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish/unpublish entire chain and return it
	//
	// -------------------------------------------------------------------------
	publishReviewChain: function (ancestorId, value) {
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
				return self.getReviewChain (ancestorId);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// return entire chain
	//
	// -------------------------------------------------------------------------
	getReviewChain: function (ancestorId) {
		return this.findMany ({ ancestor: ancestorId });
	}
});

