'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('artifacts').factory ('ArtifactTypeModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'artifacttype',
		// forProject: function (projectid) {
		// 	return this.get ('/api/artifact/for/project/'+projectid);
		// },
		// newFromType: function (type, projectid) {
		// 	return this.get ('api/artifact/project/'+projectid+'/from/type/'+type);
		// },
		// nextStage: function (artifact) {
		// 	return this.put ('api/artifact/next/stage/'+artifact._id, artifact);
		// },
		// prevStage: function (artifact) {
		// 	return this.put ('api/artifact/prev/stage/'+artifact._id, artifact);
		// },
		templateTypes: function () {
			return this.get ('/api/artifacttype/template/types');
		},
		fromCode: function (code) {
			return this.get ('/api/artifacttype/code/'+code);
		}
	});
	return new Class ();
});


