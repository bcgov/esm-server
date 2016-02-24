
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('projectdescription').factory ('ProjectDescriptionModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'projectdescription',
		getDescriptionsForProject : function (projectId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.getQuery ({project:projectId})
				.then (resolve, reject);
			});
		}
	});
	return new Class ();
});


