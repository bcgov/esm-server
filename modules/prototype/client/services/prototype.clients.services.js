'use strict';
angular.module('prototype').factory ('PrototypeModel', function (ModelBase, _) {
	var projectJson = {
		// replace me!
	};


	var PrototypeModel = ModelBase.extend ({
		urlName : 'prototype',
		getProject: function () {
			//return this.get('/api/admin/prototype');
			return projectJson;
		}
		
	});
	return new PrototypeModel ();
});
