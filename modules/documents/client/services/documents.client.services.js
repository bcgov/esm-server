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

	return {
		getDocumentTypes: getDocumentTypes
	};
}