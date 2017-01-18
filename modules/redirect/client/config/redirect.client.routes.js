'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	.state('redirect', {
		abstract:false,
		// Catch everything, we will deal with this on a per-item basis.
		url: '/redirect/*path',
		controller: function ($scope, $window, ProjectModel) {
			var incomingURL = $window.location.href;
			var newURL = $window.location.protocol + "//" + $window.location.host + "/";

			var epicProjectID;
			var homestring = "epic_project_home_";
			var pjhomeIdx = incomingURL.indexOf(homestring);
			// Test if it's a project home link
			if (pjhomeIdx !== -1) {
				epicProjectID = incomingURL.substr(pjhomeIdx+homestring.length);
				epicProjectID = epicProjectID.substr(0, epicProjectID.indexOf("."));

				// Adjust for merged projects
				// 38, 404 => 286
				// 278 => 348
				// 345 => 6
				if (epicProjectID === '38' || epicProjectID === '404') {
					epicProjectID = 286;
				} else if (epicProjectID === '278') {
					epicProjectID = 348;
				} else if (epicProjectID === '345') {
					epicProjectID = 6;
				}
			} else {
				// Find out which project this is.
				epicProjectID = incomingURL.replace(newURL+"redirect/documents/p","");
				epicProjectID = epicProjectID.replace(/\/.*/,"");
				try {
					epicProjectID = parseInt(epicProjectID);
				} catch (e) {
					// If something goes wrong with the parsing, redirect to home page.
					console.log("Parsing fail:", epicProjectID);
					$window.location.href = newURL;
					return;
				}
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