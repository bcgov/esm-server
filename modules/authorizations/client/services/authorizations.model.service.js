'use strict';

angular.module('authorizations')
	.factory('AuthorizationsModel', AuthorizationsModelF);

AuthorizationsModelF.$inject = ['ModelBase', '_'];
/* @ngInject */
function AuthorizationsModelF(ModelBase, _) {
	var AuthorizationsModel = ModelBase.extend({
		forProject: function (projectCode, agencyCode) {
			return this.get('/api/authorizations/for/projectCode/' + projectCode +'/agencyCode/'+ agencyCode);
		}
	});
	return new AuthorizationsModel();
}
