'use strict';

angular.module('control')
    .service('sProcessInvitations', serviceProcessInvitations);
// -----------------------------------------------------------------------------------
//
// SERVICE: Notification templates
//
// -----------------------------------------------------------------------------------
serviceProcessInvitations.$inject = ['$http'];
/* @ngInject */
function serviceProcessInvitations($http) {
	var getTemplates = function(req) {
		return $http({method:'GET',url: '/api/query/emailtemplate?group=invitation'});
	};
  var getUsersForRole = function(role) {
    return $http({method: 'GET', url: '/api/users/in/role/'+role});
  };
  var getInvitationsForProject = function(project) {
    return $http({method: 'GET', url: '/api/query/invitation?project=' + project._id.toString()});
  };
  var sendInvitations = function(data) {
    return $http({method:'PUT',url: '/api/sendinvitations', data: data});
  };
	return {
		getTemplates: getTemplates,
    getUsersForRole: getUsersForRole,
    getInvitationsForProject: getInvitationsForProject,
    sendInvitations: sendInvitations
	};
}
