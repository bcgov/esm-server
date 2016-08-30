'use strict';

angular.module('utils')
    .service('Utils', serviceUtils);
// -----------------------------------------------------------------------------------
//
// Service: Util Services
//
// -----------------------------------------------------------------------------------
serviceUtils.$inject = ['$http', '$modal'];
/* @ngInject */
function serviceUtils($http, $modal) {
	var getQuickLinks = function(req) {
		return $http({method:'GET',url: 'api/project'});
	};
	// var getProjectMilestones = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/projectMilestones'});
	// };
	var getCommonLayers = function(req) {
		return [];
	};
	var getResearchFocus = function(req) {
		return [];
	};
//   	var getResearchResults = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/research/' + req.term });
	// };
	// var getProjectResearchDetail = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/researchDetail/' + req.seed + '/' + req.term });
	// }
	var getRoles = function(req) {
		return $http({method:'GET',url: 'api/roles' });
	};
	
	var openEntitySelectionModal = function (entities, valueString, selected, title) {
		// adapted from: http://stackoverflow.com/a/22129960/1066283
		var resolve = function(obj, path) {
			return path.split('.').reduce(function(prev, curr) {
				return prev ? prev[curr] : undefined;
			}, obj);
		};
		
		var modal = $modal.open({
			animation: true,
			templateUrl: 'modules/utils/client/views/partials/entity-select-modal.html',
			size: 'md',
			controller: function ($scope, $modalInstance, _, NgTableParams) {
				$scope.current = angular.copy(selected);
				$scope.tableParams = new NgTableParams({}, {dataset: entities});
				$scope.valueString = valueString;
				$scope.resolve = resolve;
				$scope.title = title;
				
				var index = $scope.index = function(item) {
					return _.findIndex($scope.current, function(o) { return o._id === item._id; });
				};
				
				$scope.toggleItem = function (item) {
					var i = index(item);
					if (i === -1) {
						$scope.current.push(item);
					} else {
						$scope.current.splice(i, 1);
					}
				};
				
				$scope.ok = function () {
					$modalInstance.close($scope.current);
				};
				
				$scope.cancel = function () {
					$modalInstance.dismiss('cancel');
				};
			}
		});
		
		return modal.result;
	};
	
	return {
		// getCurrentUser: getCurrentUser
		getQuickLinks: getQuickLinks,
		// getProjectMilestones: getProjectMilestones,
		getCommonLayers: getCommonLayers,
		getResearchFocus: getResearchFocus,
		// getResearchResults: getResearchResults,
		// getProjectResearchDetail: getProjectResearchDetail,
		getRoles: getRoles,
		
		openEntitySelectionModal: openEntitySelectionModal
	};
}
