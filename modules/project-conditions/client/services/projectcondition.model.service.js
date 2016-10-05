
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('projectconditions').factory ('ProjectConditionModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'projectcondition',
		lookup: function (id) {
			return this.get ('/api/projectcondition/'+id);
		},
		forProject: function (projectId) {
			return this.get ('/api/projectcondition/for/project/'+projectId);
		},
		publish: function (pcId) {
			return this.put('/api/projectcondition/publish/' + pcId);
		},
		unpublish: function (pcId) {
			return this.put('/api/projectcondition/unpublish/' + pcId);
		}
	});
	return new Class ();
});


