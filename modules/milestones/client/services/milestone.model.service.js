'use strict';
// =========================================================================
//
// milestone model and milestone base model
//
// =========================================================================
angular.module('project').factory ('MilestoneModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var MilestoneClass = ModelBase.extend ({
		urlName : 'milestone'
	});
	return new MilestoneClass ();
});
angular.module('project').factory ('MilestoneBaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var MilestoneBaseClass = ModelBase.extend ({
		urlName : 'milestonebase'
	});
	return new MilestoneBaseClass ();
});





