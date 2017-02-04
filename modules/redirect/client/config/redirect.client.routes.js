'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	.state('redirect', {
		abstract:false,
		// Catch everything, we will deal with this on a per-item basis.
		url: '/redirect/*path',
		controller: function ($scope, $window, ProjectModel, Document) {
			var incomingURL = $window.location.href;
			var newURL = $window.location.protocol + "//" + $window.location.host + "/";

			var getProjectIDString = function (idx, theString, terminus) {
				var epicID = incomingURL.substr(idx+theString.length);
				epicID = epicID.substr(0, epicID.indexOf(terminus));

				// Adjust for merged projects
				// 38, 404 => 286
				// 278 => 348
				// 345 => 6
				if (epicID === '38' || epicID === '404') {
					epicID = 286;
				} else if (epicID === '278') {
					epicID = 348;
				} else if (epicID === '345') {
					epicID = 6;
				}
				return epicID;
			};

			var epicProjectID;
			var homestring = "epic_project_home_";
			var docliststring = "epic_project_doc_list_";
			var docpagestring = "epic_document_";
			var pjhomeIdx = incomingURL.indexOf(homestring);
			var doclistIdx = incomingURL.indexOf(docliststring);
			var docpageIdx = incomingURL.indexOf(docpagestring);

			if (doclistIdx !== -1) {
				// Test if it's a epic_project_doc_list_ link
				epicProjectID = getProjectIDString(doclistIdx, docliststring, "_");
			} else if (docpageIdx !== -1) {
				// Test if it's a epic_document_ link
				epicProjectID = getProjectIDString(docpageIdx, docpagestring, "_");
			} else if (pjhomeIdx !== -1) {
				// Test if it's a epic_project_home_ link
				epicProjectID = getProjectIDString(pjhomeIdx, homestring, ".");
			} else {
				// Find out which project this is.
				var projectFolderURL = incomingURL.replace(newURL+"redirect/documents/","");
				return Document.getDocumentByProjectFolderURL(projectFolderURL)
				.then(function (doc) {
					if (doc !== null) {
						$window.location.href = newURL + "api/document/" + doc._id + "/fetch";
						return;
					} else {
						epicProjectID = incomingURL.replace(newURL+"redirect/documents/p","");
						epicProjectID = epicProjectID.replace(/\/.*/,"");
						try {
							epicProjectID = parseInt(epicProjectID);
							return ProjectModel.lookupByEpicID(epicProjectID)
							.then(function (p) {
								if (p) {
									console.log("Redirecting to project:", p.code);
									newURL += "p/" + p.code + "/detail";
								} else {
									console.log("Couldn't find project.");
								}
								$window.location.href = newURL;
								return;
							});
						} catch (e) {
							// If something goes wrong with the parsing, redirect to home page.
							console.log("Parsing fail:", epicProjectID);
							$window.location.href = newURL;
							return;
						}
					}
				});
			}
			// Lookup the project by old epicID.  If not found or a bad incoming URL was found,
			// lets just redirect to the homepage instead.
			ProjectModel.lookupByEpicID(epicProjectID)
			.then(function (p) {
				if (p) {
					console.log("Redirecting to project:", p.code);
					newURL += "p/" + p.code + "/detail";
				} else {
					console.log("Couldn't find project.");
				}
				$window.location.href = newURL;
			});
		}
	})
	;
}]);