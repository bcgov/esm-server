
'use strict';

angular.module('codelists').factory ('CodeListModel', function (ModelBase, _) {
	var Class = ModelBase.extend ({
		urlName : 'codelists'
	});
	return new Class ();
});


