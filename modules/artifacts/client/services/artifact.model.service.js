'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('artifacts').factory ('ArtifactModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'artifact',
		forProject: function (projectid) {
			return this.get ('/api/artifact/for/project/'+projectid);
		},
		newFromType: function (type, projectid) {
			return this.get ('api/artifact/project/'+projectid+'/from/type/'+type);
		}
	});
	return new Class ();
});


