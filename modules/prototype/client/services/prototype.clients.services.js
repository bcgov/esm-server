'use strict';
angular.module('prototype').factory ('PrototypeModel', function (ModelBase, _) {

	var PrototypeModel = ModelBase.extend ({
		urlName : 'prototype',
		getData: function() {
			return this.get('/api/admin/prototype').then(function(data) { return data;}, function(err) { console.log('Error getting prototype data.'); return {}; });
		}
		
	});
	return new PrototypeModel ();
});
