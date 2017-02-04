'use strict';

angular.module('inspections')
	.factory('InspectionsModel', InspectionsModelF);

InspectionsModelF.$inject = ['ModelBase', '_'];
/* @ngInject */
function InspectionsModelF(ModelBase, _) {
	console.log("BG construction of InspectionsModel");
	var InspectionsModel = ModelBase.extend({
		// TODO BG understand the urlName property and fix to use project id
		// urlName: 'inspections/for/project',
		forProject: function (projectid) {
			console.log("BG inspections.model.service InspectionsModel.forProject projectId", projectid);
			return this.get('/api/inspections/for/project/' + projectid);
		}
	});
	return new InspectionsModel();
}
