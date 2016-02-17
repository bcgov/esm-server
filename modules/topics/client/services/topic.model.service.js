'use strict';
// =========================================================================
//
// topic model
//
// =========================================================================
angular.module('project').factory ('TopicModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var TopicClass = ModelBase.extend ({
		urlName : 'topic'
	});
	return new TopicClass ();
});