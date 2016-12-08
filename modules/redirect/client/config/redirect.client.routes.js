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
				epicProjectID = 0;
			} else {
				try {
					epicProjectID = parseInt(epicProjectID);
				} catch (e) {
					console.log("Error bad URL:", e);
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