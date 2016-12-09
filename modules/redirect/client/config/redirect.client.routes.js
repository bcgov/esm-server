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

			// Find out which project this is.
			var epicProjectID = incomingURL.replace(newURL+"redirect/documents/p","");
			epicProjectID = epicProjectID.replace(/\/.*/,"");
			if (!angular.isNumber(epicProjectID)) {
				// If something goes wrong with the parsing, redirect to home page.
				$window.location.href = newURL;
				return;
			} else {
				try {
					epicProjectID = parseInt(epicProjectID);
				} catch (e) {
					// If something goes wrong with the parsing, redirect to home page.
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
				}
				$window.location.href = newURL;
			});
		}
	})
	;
}]);