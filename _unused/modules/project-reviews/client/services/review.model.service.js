'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('review').factory ('ReviewModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'review',
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
			return this.get ('/api/reviews/type/'+reviewType+'/target/'+targetType+'/'+targetId);
		},
		// -------------------------------------------------------------------------
		//
		// add a new top-level review to the given target for the given project
		// for the given period (the period MUST be the current period object)
		// the reason for breaking out the params is to ensure they are provided
		//
		// -------------------------------------------------------------------------
		addNewReview: function (newReview, projectId, period, targetType, targetId) {
			newReview.ancestor   = newReview._id;
			newReview.parent     = null;
			newReview.project    = projectId;
			newReview.targetType = targetType;
			newReview.target     = targetId;
			newReview.period     = period._id;
			newReview.read       = period.write;
			newReview.type       = period.reviewType;
			newReview.resolved   = false;
			newReview.published  = false;
			return this.add (newReview);
		},
		// -------------------------------------------------------------------------
		//
		// given an original and the new response, add the new response and link to
		// the original
		//
		// -------------------------------------------------------------------------
		addResponseToReview: function (originalReview, newReview) {
			newReview.ancestor   = originalReview.ancestor;
			newReview.parent     = originalReview._id;
			newReview.project    = originalReview.project;
			newReview.targetType = originalReview.targetType;
			newReview.target     = originalReview.target;
			newReview.period     = originalReview.period;
			newReview.read       = originalReview.read;
			newReview.type       = originalReview.type;
			newReview.resolved   = originalReview.resolved;
			newReview.published  = originalReview.published;
			return this.add (newReview);
		},
		// -------------------------------------------------------------------------
		//
		// given any review in the chain, indicate that this chain has been
		// resolved.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		resolveReviewChain: function (review) {
			return this.put ('/api/resolve/review/'+review.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// given any review in the chain, indicate that this chain has been
		// published.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		publishReviewChain: function (review) {
			return this.put ('/api/publish/review/'+review.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// given any review in the chain, indicate that this chain has been
		// unpublished.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		unpublishReviewChain: function (review) {
			return this.put ('/api/unpublish/review/'+review.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// gets just one conversation by passing in the top-level review Id
		//
		// -------------------------------------------------------------------------
		getReviewChain: function (ancestorId) {
			return this.get ('/api/reviews/ancestor/'+ancestorId);
		}
	});
	return new Class ();
});


