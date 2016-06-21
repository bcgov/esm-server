'use strict';
// =========================================================================
//
// this is the project data model (service). This is how all project data
// is accessed through the front end
//
// =========================================================================
angular.module('project').factory ('TaskModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var TaskClass = ModelBase.extend ({
		urlName : 'task'
	});
	return new TaskClass ();
});
angular.module('project').factory ('TaskBaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var TaskBaseClass = ModelBase.extend ({
		urlName : 'taskbase'
	});
	return new TaskBaseClass ();
});





