'use strict';
// =========================================================================
//
// phase model and phase base model
//
// =========================================================================
angular.module('project').factory ('PhaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var PhaseClass = ModelBase.extend ({
		urlName : 'phase'
	});
	return new PhaseClass ();
});
angular.module('project').factory ('PhaseBaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var PhaseBaseClass = ModelBase.extend ({
		urlName : 'phasebase'
	});
	return new PhaseBaseClass ();
});





