
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('irs').factory ('IrModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'ir',
		forProject: function (projectid) {
			return this.get ('/api/ir/for/project/'+projectid);
		},
		publish: function (id) {
			return this.put('/api/publish/ir/' + id);
		},
		unpublish: function (id) {
			return this.put('/api/unpublish/ir/' + id);
		},
	});
	return new Class ();
});


