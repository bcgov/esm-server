'use strict';
// =========================================================================
//
// milestone model and milestone base model
//
// =========================================================================
angular.module('organizations').factory ('OrganizationModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var OrganizationModel = ModelBase.extend ({
		urlName : 'organization'
	});
	return new OrganizationModel ();
});



// serviceOrganizations.$inject = ['$http'];
// /* @ngInject */
// function serviceOrganizations($http) {
// 	var getOrganizations = function(req) {
// 		return $http({method:'GET',url: '/api/organization'});
// 	};
// 	var getOrganization = function(req) {
// 		return $http({method:'GET',url: '/api/organization/' + req.id});
// 	};
// 	var addOrganization = function(req) {
// 		return $http({method:'POST',url: '/api/organization', data: req});
// 	};
// 	var updateOrganization = function(req) {
// 		return $http({method:'PUT',url: '/api/organization/' + req._id, data: req});
// 	};
// 	var deleteOrganization = function(req) {
// 		return $http({method:'DELETE',url: '/api/organization/' + req.id});
// 	};
// 	var getUsersByOrganization = function(req) {
// 		// CHRIS! DO YOUR THING! Get me a list of users by organization, the org ID will be passed in as req.id.
// 		return [{"_id":"56a7b59d69a75d0b050fc7e9","username":"classify","provider":"local","displayName":"classify Local","__v":0,"created":"2016-01-26T18:06:21.360Z","roles":["user","classify"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"classify@localhost.com","lastName":"Local","firstName":"classify"},{"_id":"56a7b59d69a75d0b050fc7e8","username":"vetting","provider":"local","displayName":"vetting Local","__v":0,"created":"2016-01-26T18:06:21.359Z","roles":["user","vetting"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"vetting@localhost.com","lastName":"Local","firstName":"vetting"},{"_id":"56a7b59d69a75d0b050fc7e7","username":"admin","provider":"local","displayName":"Admin Local","__v":0,"resetPasswordExpires":"2016-01-27T20:40:41.907Z","resetPasswordToken":"017c80fe91a4c7f51c7ee5a9dc74233a93cc2798","created":"2016-01-26T18:06:21.357Z","roles":["user","admin"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"admin@localhost.com","lastName":"Local","firstName":"Admin"},{"_id":"56a7b59d69a75d0b050fc7e6","username":"user","provider":"local","displayName":"User Local","__v":0,"created":"2016-01-26T18:06:21.328Z","roles":["user"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"user@localhost.com","lastName":"Local","firstName":"User"}];
// 	};

// 	return {
// 		getOrganizations: getOrganizations,
// 		getOrganization: getOrganization,
// 		addOrganization: addOrganization,
// 		updateOrganization: updateOrganization,
// 		deleteOrganization: deleteOrganization,
// 		getUsersByOrganization: getUsersByOrganization
// 	};
// }




