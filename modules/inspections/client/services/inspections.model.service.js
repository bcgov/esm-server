'use strict';

angular.module('inspections')
	.factory('InspectionsModel', InspectionsModelF);

InspectionsModelF.$inject = ['ModelBase', '_'];
/* @ngInject */
function InspectionsModelF(ModelBase, _) {
	var InspectionsModel = ModelBase.extend({
		forProject: function (projectid) {
			return this.get('/api/inspections/for/project/' + projectid);
		}
	});
	return new InspectionsModel();
}
