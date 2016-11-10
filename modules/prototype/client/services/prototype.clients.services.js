'use strict';
angular.module('prototype').factory ('PrototypeModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var PrototypeModel = ModelBase.extend ({
		urlName : 'prototype',
		getData: function () {
			return [{name: 'test', data: 'foo'}];
		}
	});
	return new PrototypeModel ();
});
