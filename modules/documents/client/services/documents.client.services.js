'use strict';


angular.module('documents').factory('Document', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend({
		urlName: 'document',
		lookup: function (documentid) {
			return this.get('/api/document/' + documentid);
		},
		getDocumentsInList: function (documentList) {
			return this.put('/api/documentlist', documentList);
		},
		getDocumentByProjectFolderURL: function (projectFolderURL){
			return this.put('/api/getDocumentByEpicURL', {url: projectFolderURL});
		},
		getDocument: function (id) {
            return this.get('/api/document/'+id);
        },
		getArtifactLocations: function () {
			return [
			{
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
		},
		getDocumentTypes: function() {
			return [
			{
				"code":"r",
				"name":"Under Review",
			},
			{
				"code":"p",
				"name":"Scope",
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
		},
		getDocumentSubTypes: function() {
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
		},

		getAllDocuments: function() {
			return this.get('/api/documents');
		},

		getProjectDocuments: function(projectId, reviewDocsOnly) {
			return this.get('/api/documents/' + projectId, {'reviewDocsOnly': reviewDocsOnly});
		},

		getProjectDocumentTypes: function(projectId, reviewDocsOnly) {
			return this.get('/api/documents/types/' + projectId, {'reviewDocsOnly': reviewDocsOnly});
		},
		getProjectDocumentMEMType: function(projectId, reviewDocsOnly) {
	        return new Promise (function (resolve, reject) {
	            var obj = {data: ["Permits & Applications",
	                              "Inspection Reports",
	                              "Geotechnical Reports",
	                              "Site Monitoring & Activities (including Reclamation)"]};
	            resolve(obj);
	        });
	    },
	    getProjectDocumentSubTypes: function(projectId, reviewDocsOnly) {
	        return this.get('/api/documents/subtypes/' + projectId, {'reviewDocsOnly': reviewDocsOnly});
	    },
		getProjectDocumentFolderNames: function(projectId) {
			return this.get('/api/documents/folderNames/' + projectId);
		},
		getProjectDocumentVersions: function(document) {
			return this.get('/api/documents/versions/' + document);
		},
		downloadAndApprove: function(documentObj) {
			return this.put('/api/documents/approveAndDownload/', documentObj);
		},
		deleteDocument: function(document) {
			return this.delete('/api/document/' + document);
		},
		makeLatestVersion: function (document) {
			return this.put('/api/document/makeLatest/' + document);
		},
		publish: function (document) {
			return this.put('/api/publish/document/' + document._id);
		},
		unpublish: function (document) {
			return this.put('/api/unpublish/document/' + document._id);
		},
		sortDocuments: function (projectId, parentid, idList) {
			return this.put('/api/documents/for/project/' + projectId + '/in/' + parentid + '/sort', idList);
		},

	});
	return new Class();
});
