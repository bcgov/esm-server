
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('templates').factory ('TemplateModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'template',
		lookup: function (id) {
			return this.get ('/api/template/' + id);
		},
		forProject: function (projectid) {
			return this.get ('/api/template/for/project/'+projectid);
		},
		forDocumentType: function (documentType) {
			return this.get ('/api/template/for/document/'+documentType);
		},
		fromCode: function (code) {
			return this.get ('/api/template/for/code/'+code);
		},
		newSection: function () {
			return this.get ('/api/new/template/section');
		},
		newMeta: function () {
			return this.get ('/api/new/template/section');
		},
		currentTemplates: function () {
			return this.get ('/api/current/templates');
		}
	});
	return new Class ();
});


