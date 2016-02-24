
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
		},
		getCurrentProjectDescription : function (projectId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.getQuery ({project:projectId})
				.then (function (descriptions) {
					if (descriptions[0]) {
						self.setModel (descriptions[0]);
						return descriptions[0];
					}
					else return null;
				})
				.then (resolve, reject);
			});
		},
		saveAs: function (type) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.post('/api/projectdescription/save/as/'+type, self.model)
				.then (resolve, reject);
			});
		}
	});
	return new Class ();
});


