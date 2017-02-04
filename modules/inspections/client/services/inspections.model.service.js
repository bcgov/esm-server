
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('inspections').factory ('InspectionsModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var InspectionsModel = ModelBase.extend ({
		urlName : 'inspections/for/project/brucejack',
		forProject: function (projectid) {
			console.log("BG inspection model for project");
			return this.get ('/api/inspections/for/project/' + projectid);
		}
	});
	return new InspectionsModel ();
});


