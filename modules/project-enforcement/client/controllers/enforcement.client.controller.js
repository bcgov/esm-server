'use strict';

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}


angular.module ('enforcements')
	.controller('controllerEnforcementBrowser', controllerEnforcementBrowser);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerEnforcementBrowser.$inject = ['$scope', '_', 'ProjectModel', 'ProjectConditionModel'];
/* @ngInject */
function controllerEnforcementBrowser($scope, _, ProjectModel, ProjectConditionModel) {
	var enfBrowser = this;

	enfBrowser.enforcementMaster = [{name: "Warning", type:'warning'}, {name: "Cease", type:'cease'}, {type: "Remedy", label:'remedy'}];

	enfBrowser.inspReports = [{name: "August 2014"}, {name: "August 2015"}];
	var num;

	ProjectConditionModel.forProject( $scope.project._id ).then( function(res) {
		// randomly put data on the conditions for demo
		enfBrowser.conditions = _.map(res, function(item) {
			item.enforcement = getRandomSubarray(enfBrowser.enforcementMaster, _.random(0, 2) );
			return item;
		});
	});

	enfBrowser.conditionsMaster = [{name: "Enforcement Order 1"}, {name: "Enforcement Order 2"}, {name: "Enforcement Order 3"}, {name: "Enforcement Order 4"}, {name: "Enforcement Order 5"}];

}
