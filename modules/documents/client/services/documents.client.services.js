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

    var getArtifactLocations = function () {
        return [{
                    "code": "",
                    "name": "",
                },
								{
										"code":"main",
										"name":"Main Content Document",
								},
                {
                    "code":"supporting",
                    "name":"Supporting Documents",
                },
                {
                    "code":"internal",
                    "name":"Internal Documents",
                },
                {
                    "code":"additional",
                    "name":"Additional Documents",
                }];
    };
    var getDocumentTypes = function() {
        return [
            {
                "code":"r",
                "name":"Under Review",
            },
            {
                "code":"p",
                "name":"Pre-Application",
            },
            {
                "code":"w",
                "name":"Withdrawn",
            },
            {
                "code":"t",
                "name":"Terminated",
            },
            {
                "code":"a",
                "name":"Certificate Issued",
            },
            {
                "code":"k",
                "name":"Amendments",
            }
        ];
    };
    var getDocumentSubTypes = function() {
        return [
            {
                "code":"abo",
                "name":"Aboriginal Comments/Submissions",
            },
            {
                "code":"amd",
                "name":"Amendment Certificate",
            },
            {
                "code":"yaa",
                "name":"Amendment to Certificate Documentation",
            },
            {
                "code":"ama",
                "name":"Amendment - Application",
            },
            {
                "code":"app",
                "name":"Application and Supporting Studies",
            },
            {
                "code":"tor",
                "name":"Application Terms of Reference/Information Requirements",
            },
            {
                "code":"cag",
                "name":"Community Advisory Group",
            },
            {
                "code":"cpp",
                "name":"Compendium: Public Comments / Proponent Responses",
            },
            {
                "code":"crr",
                "name":"Compliance Reports/Reviews",
            },
            {
                "code":"cpm",
                "name":"Concurrent Permitting",
            },
            {
                "code":"waa",
                "name":"EA Certificate Documentation",
            },
            {
                "code":"com",
                "name":"EAO Generated Documents",
            },
            {
                "code":"fed",
                "name":"Federal Comments/Submissions",
            },
            {
                "code":"gcd",
                "name":"General Consultiation Documents",
            },
            {
                "code":"loc",
                "name":"Local Government Comments/Submissions",
            },
            {
                "code":"mno",
                "name":"Ministerial Order",
            },
            {
                "code":"new",
                "name":"Notices - News Releases",
            },
            {
                "code":"ojc",
                "name":"Other Jurisdictions Comments/Submissions",
            },
            {
                "code":"xaa",
                "name":"Post Certificate Documentation",
            },
            {
                "code":"abc",
                "name":"Pre Application Documents",
            },
            {
                "code":"pro",
                "name":"Proponent Comments/Correspondence",
            },
            {
                "code":"pga",
                "name":"Provincial Govt Comments/Submissions",
            },
            {
                "code":"pub",
                "name":"Public Comments/Submissions",
            }
        ];
    };

    var getAllDocuments = function() {
        return $http({method:'GET',url: '/api/documents'});
    };

    var getProjectDocuments = function(projectId, reviewDocsOnly) {
        return $http({method:'GET',
                      url: '/api/documents/' + projectId,
                      headers: {'reviewDocsOnly': reviewDocsOnly} });
    };

    var getProjectDocumentTypes = function(projectId, reviewDocsOnly) {
        return $http({method:'GET',
                      url: '/api/documents/types/' + projectId,
                      headers: {'reviewDocsOnly': reviewDocsOnly} });
    };
    var getProjectDocumentMEMTypes = function(projectId, reviewDocsOnly) {
        return new Promise (function (resolve, reject) {
            var obj = {data: ["Permits & Applications",
                              "Inspection Reports",
                              "Geotechnical Reports",
                              "Site Monitoring & Activities (including Reclamation)"]};
            resolve(obj);
        });
    };
    var getProjectDocumentSubTypes = function(projectId, reviewDocsOnly) {
        return $http({method:'GET',
                      url: '/api/documents/subtypes/' + projectId,
                      headers: {'reviewDocsOnly': reviewDocsOnly} });
    };

    var getProjectDocumentFolderNames = function(projectId) {
        return $http({method:'GET',
                      url: '/api/documents/folderNames/' + projectId });
    };

    var getProjectDocumentVersions = function(projectId, type, subtype, folderName, fileName) {
        return $http({  method:'GET',
                        url: '/api/documents/versions/' + projectId,
                        headers: {
                            'projectFolderType': type,
                            'projectFolderSubType': subtype,
                            'projectFolderName': folderName,
                            'documentFileName': fileName,
                            'projectID': projectId,
                        },
                    });
    };

    var downloadAndApprove = function(documentObj) {
        return $http({
            method:'PUT',
                        url: '/api/documents/approveAndDownload/' + documentObj
        });
    };

    var deleteDocument = function(document) {
        return $http({ method: 'DELETE', url: '/api/document/' + document});
    };

    var getDocumentsInList = function (documentList) {
        return $http({ method: 'PUT', url: '/api/documentlist', data:documentList});
    };



	return {
        getDocumentTypes: getDocumentTypes,
        getDocumentSubTypes: getDocumentSubTypes,
				getArtifactLocations: getArtifactLocations,
        getAllDocuments: getAllDocuments,
        getProjectDocuments: getProjectDocuments,
        getProjectDocumentTypes: getProjectDocumentTypes,
        getProjectDocumentMEMTypes: getProjectDocumentMEMTypes,
        getProjectDocumentSubTypes: getProjectDocumentSubTypes,
        getProjectDocumentFolderNames: getProjectDocumentFolderNames,
        getProjectDocumentVersions: getProjectDocumentVersions,
        downloadAndApprove: downloadAndApprove,
        deleteDocument: deleteDocument,
        getDocumentsInList: getDocumentsInList,
        getDocument: function (id) {
            return $http ({method:'GET', url:'/api/document/'+id});
        }
	};
}
