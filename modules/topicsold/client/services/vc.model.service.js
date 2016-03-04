'use strict';
// =========================================================================
//
// topic model
//
// =========================================================================
angular.module('project').factory ('VCModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var ValuedComponentClass = ModelBase.extend ({
		urlName : 'valuedcomponent'
	});
	return new ValuedComponentClass ();
});