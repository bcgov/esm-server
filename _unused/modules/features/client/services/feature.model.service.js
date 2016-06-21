
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('features').factory ('FeatureModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'feature',
		forProject: function (projectid) {
			return this.get ('/api/feature/for/project/'+projectid);
		},
		base: function () {
			return this.get ('/api/base/feature');
		}
	});
	return new Class ();
});


