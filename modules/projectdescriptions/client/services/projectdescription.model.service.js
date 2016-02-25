
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
			return this.getQuery ({project:projectId});
		},
		getCurrentProjectDescription : function (projectId) {
			return this.get ('/api/projectdescription/for/project/'+projectId+'/current');
		},
		saveAs: function (type) {
			return this.post('/api/projectdescription/save/as/'+type, this.model);
		},
		getVersionsForProject: function (projectId) {
			return this.get ('/api/projectdescription/for/project/'+projectId+'/versions');
		},
		getCurrentInfo: function (projectId) {
			return this.get ('/api/projectdescription/for/project/'+projectId+'/current/info');
		},
		getVersionStrings: function () {
			return this.get ('/api/projectdescription/list/versions');
		}
	});
	return new Class ();
});


