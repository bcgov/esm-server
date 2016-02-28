'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('comment').factory ('CommentModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'comment',
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
		// add a new top-level comment to the given target for the given project
		// for the given period (the period MUST be the current period object)
		// the reason for breaking out the params is to ensure they are provided
		//
		// -------------------------------------------------------------------------
		addNewComment: function (newComment, projectId, period, targetType, targetId) {
			newComment.ancestor   = newComment._id;
			newComment.parent     = null;
			newComment.project    = projectId;
			newComment.targetType = targetType;
			newComment.target     = targetId;
			newComment.period     = period._id;
			newComment.read       = period.write;
			newComment.type       = period.commentType;
			newComment.resolved   = false;
			newComment.published  = false;
			// save new comment
		},
		// -------------------------------------------------------------------------
		//
		// given an original and the new response, add the new response and link to
		// the original
		//
		// -------------------------------------------------------------------------
		addResponseToComment: function (originalComment, newComment) {
			newComment.ancestor   = originalComment.ancestor;
			newComment.parent     = originalComment._id;
			newComment.project    = originalComment.project;
			newComment.targetType = originalComment.targetType;
			newComment.target     = originalComment.target;
			newComment.period     = originalComment.period;
			newComment.read       = originalComment.read;
			newComment.type       = originalComment.type;
			newComment.resolved   = originalComment.resolved;
			newComment.published  = originalComment.published;
			// save new comment here and return it
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// resolved.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		resolveCommentChain: function (comment) {
			// call route to resolve with comment.ancestor
			// route should return getCommentChain (comment.ancestor)
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// published.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		publishCommentChain: function (comment) {
			// call route to publish with comment.ancestor
			// route should return getCommentChain (comment.ancestor)
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// unpublished.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		unpublishCommentChain: function (comment) {
			// call route to unpublish with comment.ancestor
			// route should return getCommentChain (comment.ancestor)
		},
		// -------------------------------------------------------------------------
		//
		// gets just one conversation by passing in the top-level comment Id
		//
		// -------------------------------------------------------------------------
		getCommentChain: function (ancestorId) {
			// call route to get by ancestorId
			return [{
				_id : 1,
				addedBy: 1,
				comment: 'blah di blah';
				dateAdded: '2012-03-04'
			}];
		}
	});
	return new Class ();
});


