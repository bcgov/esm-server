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
		// perform call here
		return [
			[{
				_id : 1,
				addedBy: 1,
				comment: 'blah di blah';
				dateAdded: '2012-03-04'
			}]
		];
	},
	// -------------------------------------------------------------------------
	//
	// resolve entire chain and return it
	//
	// -------------------------------------------------------------------------
	resolveCommentChain: function (ancestorId) {
		// call route to resolve with comment.ancestor
		// route should return getCommentChain (comment.ancestor)
	},
	// -------------------------------------------------------------------------
	//
	// publish/unpublish entire chain and return it
	//
	// -------------------------------------------------------------------------
	publishCommentChain: function (ancestorId, value) {
		// call route to publish with comment.ancestor
		// route should return getCommentChain (comment.ancestor)
	},
	// -------------------------------------------------------------------------
	//
	// return entire chain
	//
	// -------------------------------------------------------------------------
	getCommentChain: function (ancestorId) {
	}
});

