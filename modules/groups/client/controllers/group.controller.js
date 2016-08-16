'use strict';

angular
	.module('groups', [])
	.controller('GroupEditController', ['$scope', '$state', '$modal', 'Authentication', 'NgTableParams',  '_', 'GroupModel', 'project', 'group', 'mode', function GroupEditController($scope, $state, $modal, Authentication, NgTableParams,  _, GroupModel, project, group, mode) {
		$scope.project = project;
		$scope.authentication = Authentication;
		$scope.mode = mode;

	}]);

