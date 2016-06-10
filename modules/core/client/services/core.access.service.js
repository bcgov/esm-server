'use strict';
// =========================================================================
//
// access model
//
// =========================================================================
angular.module('core').factory ('AccessModel', function (ModelBase, _) {
	var AccessClass = ModelBase.extend ({
		urlName : 'access',

	});
	return new AccessClass ();
});





