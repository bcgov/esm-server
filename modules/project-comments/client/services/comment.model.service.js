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
		// get all the comments for a comment period
		//
		// -------------------------------------------------------------------------
		getCommentsForPeriod: function (periodId) {
			return this.get ('/api/comments/period/'+periodId);
		},
		getEAOCommentsForPeriod: function (periodId) {
			return this.get ('/api/comments/period/'+periodId);
		},
		getProponentCommentsForPeriod: function (periodId) {
			return this.get ('/api/comments/period/'+periodId);
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
			return this.get ('/api/comments/type/'+commentType+'/target/'+targetType+'/'+targetId);
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
			return this.add (newComment);
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
			return this.add (newComment);
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// resolved.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		resolveCommentChain: function (comment) {
			return this.put ('/api/resolve/comment/'+comment.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// published.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		publishCommentChain: function (comment) {
			return this.put ('/api/publish/comment/'+comment.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// unpublished.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		unpublishCommentChain: function (comment) {
			return this.put ('/api/unpublish/comment/'+comment.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// gets just one conversation by passing in the top-level comment Id
		//
		// -------------------------------------------------------------------------
		getCommentChain: function (ancestorId) {
			return this.get ('/api/comments/ancestor/'+ancestorId);
		}
	});
	return new Class ();
});


