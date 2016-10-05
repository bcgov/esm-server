
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('vcs').factory ('VcModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'vc',
		forProject: function (projectid) {
			return this.get ('/api/vc/for/project/'+projectid);
		},
		lookup: function (id) {
			return this.get ('/api/vc/'+id);
		},
		getVCsInList: function (vcList) {
			return this.put('/api/vclist', vcList);
		},
		publish: function (vcId) {
			return this.put('/api/publish/vc/' + vcId);
		},
		unpublish: function (vcId) {
			return this.put('/api/unpublish/vc/' + vcId);
		},
		deleteCheck: function(vcId) {
			return this.get ('/api/deletecheck/vc/'+vcId);
		}
	});
	return new Class ();
});


