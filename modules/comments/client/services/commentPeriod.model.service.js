'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('comment').factory ('CommentPeriodModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'commentperiod',
		// -------------------------------------------------------------------------
		//
		// add a new comment period, params are broken out to ensure they are provided
		// editRoles indicates who can edit the comment period information, not
		// comments. likely this will only be the project administrator role
		//
		// -------------------------------------------------------------------------
		addNewCommentPeriod: function (newCommentPeriod, project, targetType, targetId, roles) {
			//
			// set some details
			//
			newCommentPeriod.project    = project._id;
			newCommentPeriod.targetType = targetType;
			newCommentPeriod.target     = targetId;
			newCommentPeriod.roles      = roles;
			newCommentPeriod.resolved   = false;
			newCommentPeriod.published  = false;
			//
			// set access to the period itself
			//
			newCommentPeriod.read       = _.concat (roles, project.adminRole);
			newCommentPeriod.submit     = [project.adminRole];
			// save new comment
		},
		// -------------------------------------------------------------------------
		//
		// resolve an ENTIRE period, all comment chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		resolveCommentPeriod: function (commentPeriod) {
			// call route to resolve
			// route should return getCommentChain (comment.ancestor)
		},
		// -------------------------------------------------------------------------
		//
		// publish an ENTIRE period, all comment chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		publishCommentPeriod: function (commentPeriod) {
			// call route to publish
			// route should return getCommentChain (comment.ancestor)
		},
		// -------------------------------------------------------------------------
		//
		// unpublish an ENTIRE period, all comment chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		unpublishCommentPeriod: function (commentPeriod) {
			// call route to unpublish
			// route should return getCommentChain (comment.ancestor)
		}
	});
	return new Class ();
});


