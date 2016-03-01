'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('review').factory ('ReviewPeriodModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'reviewperiod',
		// -------------------------------------------------------------------------
		//
		// add a new review period, params are broken out to ensure they are provided
		// editRoles indicates who can edit the review period information, not
		// reviews. likely this will only be the project administrator role
		//
		// -------------------------------------------------------------------------
		addNewReviewPeriod: function (newReviewPeriod, project, phaseId, targetType, targetId, roles) {
			//
			// set some details
			//
			newReviewPeriod.project    = project._id;
			newReviewPeriod.phase      = phaseId;
			newReviewPeriod.targetType = targetType;
			newReviewPeriod.target     = targetId;
			newReviewPeriod.roles      = roles;
			newReviewPeriod.resolved   = false;
			newReviewPeriod.published  = false;
			//
			// set access to the period itself
			//
			newReviewPeriod.read       = _.concat (roles, project.adminRole);
			newReviewPeriod.submit     = [project.adminRole];
			// save new review period
			return this.add (newReviewPeriod);
		},
		// -------------------------------------------------------------------------
		//
		// resolve an ENTIRE period, all review chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		resolveReviewPeriod: function (reviewPeriod) {
			return this.put ('/api/resolve/reviewperiod/'+reviewPeriod._id);
		},
		// -------------------------------------------------------------------------
		//
		// publish an ENTIRE period, all review chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		publishReviewPeriod: function (reviewPeriod) {
			return this.put ('/api/publish/reviewperiod/'+reviewPeriod._id);
		},
		// -------------------------------------------------------------------------
		//
		// unpublish an ENTIRE period, all review chains at once. returns the period
		//
		// -------------------------------------------------------------------------
		unpublishReviewPeriod: function (reviewPeriod) {
			return this.put ('/api/unpublish/reviewperiod/'+reviewPeriod._id);
		}
	});
	return new Class ();
});


