'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('artifacts').factory('ArtifactModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend({
		urlName: 'artifact',
		mine: function () {
			return this.get ('/api/artifacts/mine');
		},
		lookup: function (artifactid) {
			return this.get('/api/artifact/' + artifactid);
		},
		forProject: function (projectid) {
			return this.get('/api/artifact/for/project/' + projectid);
		},
		forProjectKML: function (projectid) {
			return this.get('/api/artifact/kml/for/project/' + projectid);
		},
		// Don't return artifacts of type 'filtertype'
		forProjectFilterType: function (projectid, q) {
			return this.get('/api/artifact/for/project/' + projectid + '/filter?' + q);
		},
		forProjectGetType: function (projectid, type) {
			return this.get('/api/artifact/for/project/' + projectid + '/' + type);
		},
		newFromType: function (type, projectid) {
			return this.get('api/artifact/project/' + projectid + '/from/type/' + type);
		},
		nextStage: function (artifact) {
			return this.put('api/artifact/next/stage/' + artifact._id, artifact);
		},
		prevStage: function (artifact) {
			return this.put('api/artifact/prev/stage/' + artifact._id, artifact);
		},
		availableTypes: function (projectid) {
			return this.get('api/artifact/project/' + projectid + '/available/types');
		},
		publish: function (artifactid) {
			return this.put('/api/publish/artifact/' + artifactid);
		},
		unpublish: function (artifactid) {
			return this.put('/api/unpublish/artifact/' + artifactid);
		},
		remove: function (artifact) {
			return this.delete('/api/artifact/' + artifact._id);
		},
		checkPermissions: function (artifactId) {
			return this.get('/api/artifact/checkPermissions/' + artifactId);
		}
	});
	return new Class();
});


