'use strict';

angular.module('documents')
    .service('Document', serviceDocument);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceDocument.$inject = ['$http'];
/* @ngInject */
function serviceDocument($http) {

	var getDocumentTypes = function() {
		return [
            {
                "code":"intakeoverview",
                "name":"Project Overview",
                "bucket":"intake"
            },
            {
                "code":"intakeshape",
                "name":"Shape File",
                "bucket":"intake"
            },
            {
                "code":"intakemisc",
                "name":"Supporting File",
                "bucket":"intake"
            }
        ];
	};

    var getAllDocuments = function() {
        return $http({method:'GET',url: '/api/documents'});
    };

    var getProjectDocuments = function(Project) {
        return $http({method:'GET',url: '/api/documents/project/' + Project._id});
    };

    var getProjectDocumentTypes = function(projectId) {
        return $http({method:'GET',url: '/api/documents/types/' + projectId});
    };

	return {
		getDocumentTypes: getDocumentTypes,
        getAllDocuments: getAllDocuments,
        getProjectDocuments: getProjectDocuments,
        getProjectDocumentTypes: getProjectDocumentTypes
	};
}