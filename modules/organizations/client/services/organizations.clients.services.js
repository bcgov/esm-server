'use strict';
// =========================================================================
//
// milestone model and milestone base model
//
// =========================================================================
angular.module('organizations').factory ('OrganizationModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var OrganizationModel = ModelBase.extend ({
		urlName : 'organization'
	});
	return new OrganizationModel ();
});
