'use strict';

angular.module('authorizations')
	.factory('AuthorizationsModel', AuthorizationsModelF);

AuthorizationsModelF.$inject = ['ModelBase', '_'];
/* @ngInject */
function AuthorizationsModelF(ModelBase, _) {
	console.log("BG construction of AuthorizationsModel");
	var AuthorizationsModel = ModelBase.extend({
		forProject: function (projectCode, agencyCode) {
			console.log("BG authorizations.model.service AuthorizationsModel.forProject projectCode, agencyCode", projectCode, agencyCode);
			return this.get('/api/authorizations/for/projectCode/' + projectCode +'/agencyCode/'+ agencyCode);
		}
	});
	return new AuthorizationsModel();
}
