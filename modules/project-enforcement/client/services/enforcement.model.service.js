
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('enforcements').factory ('EnforcementModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'enforcement',
		lookup: function (id) {
			return this.get ('/api/enforcement/'+id);
		},
		forProject: function (projectid) {
			return this.get ('/api/enforcement/for/project/'+projectid);
		},
	});
	return new Class ();
});


