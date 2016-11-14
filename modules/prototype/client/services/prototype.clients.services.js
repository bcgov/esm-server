'use strict';
angular.module('prototype').factory ('PrototypeModel', function (ModelBase, _) {
	var prototypeJson = {};


	var PrototypeModel = ModelBase.extend ({
		urlName : 'prototype',
		getData: function() {
			//return this.get('/api/admin/prototype');
			return prototypeJson;
		}
		
	});
	return new PrototypeModel ();
});
