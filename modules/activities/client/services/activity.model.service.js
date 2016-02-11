'use strict';
// =========================================================================
//
// activity model and activity base model
//
// =========================================================================
angular.module('project').factory ('ActivityModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var ActivityClass = ModelBase.extend ({
		urlName : 'activity'
	});
	return new ActivityClass ();
});
angular.module('project').factory ('ActivityBaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var ActivityBaseClass = ModelBase.extend ({
		urlName : 'activitybase'
	});
	return new ActivityBaseClass ();
});





