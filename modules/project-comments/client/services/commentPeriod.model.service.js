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
		// get all periods for a project
		//
		// -------------------------------------------------------------------------
		forProject: function (projectId) {
			return this.getQuery ({project:projectId}).then (function (result) {
				return result;
			}) ;
		},
		// -------------------------------------------------------------------------
		//
		// add a new comment period, params are broken out to ensure they are provided
		// editRoles indicates who can edit the comment period information, not
		// comments. likely this will only be the project administrator role
		//
		// -------------------------------------------------------------------------
		addNewCommentPeriod: function (newCommentPeriod, project, phaseId, targetType, targetId, roles) {
			//
			// set some details
			//
			newCommentPeriod.project    = project._id;
			newCommentPeriod.phase      = phaseId;
			newCommentPeriod.targetType = targetType;
			newCommentPeriod.target     = targetId;
			newCommentPeriod.roles      = roles;
			newCommentPeriod.resolved   = false;
			newCommentPeriod.published  = false;
			//
			// set access to the period itself
			//
			newCommentPeriod.read       = _.union (roles, [project.adminRole]);
			newCommentPeriod.submit     = [project.adminRole];
			// save new comment period
			return this.add (newCommentPeriod);
		},
		// -------------------------------------------------------------------------
		//
		// resolve an ENTIRE period, all comment chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		resolveCommentPeriod: function (commentPeriod) {
			return this.put ('/api/resolve/commentperiod/'+commentPeriod._id);
		},
		// -------------------------------------------------------------------------
		//
		// publish an ENTIRE period, all comment chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		publishCommentPeriod: function (commentPeriod) {
			return this.put ('/api/publish/commentperiod/'+commentPeriod._id);
		},
		// -------------------------------------------------------------------------
		//
		// unpublish an ENTIRE period, all comment chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		unpublishCommentPeriod: function (commentPeriod) {
			return this.put ('/api/unpublish/commentperiod/'+commentPeriod._id);
		}
	});
	return new Class ();
});


