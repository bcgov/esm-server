'use strict';

angular.module ('comment')
	.directive('tmplWgComments', directiveWGComments)
// -------------------------------------------------------------------------
//
// list of public comments from the point of view of the public
//
// -------------------------------------------------------------------------
.directive ('tmplPublicCommentList', function () {
	return {
		scope: {
			period : '=',
			project : '='
		},
		restrict: 'E',
		templateUrl : 'modules/project-comments/client/views/public-comments/list.html',
		controllerAs: 's',
		controller: function ($scope, NgTableParams, Authentication, CommentModel) {
			var s = this;
			$scope.isPublic    = !Authentication.user.roles;
			$scope.isEao       = (!$scope.isPublic && (!!~Authentication.user.roles.indexOf ($scope.project.code+':eao:member') || !!~Authentication.user.roles.indexOf ('admin')));
			$scope.isProponent = (!$scope.isPublic && (!!~Authentication.user.roles.indexOf ($scope.project.code+':pro:member')));
			$scope.canVet      = $scope.isEao;
			$scope.canClassify = $scope.isProponent;
			$scope.isPublic    = true;
			$scope.isEao       = false;
			$scope.isProponent = false;
			if ($scope.isPublic) {
				CommentModel.getCommentsForPeriod ($scope.period).then (function (collection) {
					s.tableParams = new NgTableParams ({count:10}, {dataset:collection});
					$scope.$apply ();
				});
			}
			else if ($scope.isEao) {
				CommentModel.getEAOCommentsForPeriod ($scope.period).then (function (result) {
					s.totalPending  = result.totalPending;
					s.totalDeferred = result.totalDeferred;
					s.totalPublic   = result.totalPublic;
					s.totalRejected = result.totalRejected;
					s.tableParams   = new NgTableParams ({count:10}, {dataset:result.data});
					$scope.$apply ();
				});
			}
			else if ($scope.isProponent) {
				CommentModel.getProponentCommentsForPeriod ($scope.period).then (function (result) {
					s.totalAssigned   = result.totalAssigned;
					s.totalUnassigned = result.totalUnassigned;
					s.tableParams     = new NgTableParams ({count:10}, {dataset:result.data});
					$scope.$apply ();
				});
			}
		}
	};
})
// -------------------------------------------------------------------------
//
// Comment Period List for a given project
//
// -------------------------------------------------------------------------
.directive ('tmplCommentPeriodList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/project-comments/client/views/period-list.html',
		controller: 'controllerCommentPeriodList',
		controllerAs: 'plist'
	};
})

.directive ('editPeriodModal', ['$modal', function ($modal) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			period: '='
		},
		link : function (scope, element, attrs) {
			// console.log('my modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation: true,
					templateUrl: 'modules/project-comments/client/views/period-edit.html',
					controller: 'controllerEditPeriodModal',
					controllerAs: 'p',
					scope: scope,
					size: 'lg',
					resolve: {
						rProject: function() { return scope.project; },
						rPeriod: function() { return scope.period; }
					}
				});
				modalView.result.then(function () {}, function () {});
			});
		}

	};
}]);


// ----- directiveFunction -----
directiveWGComments.$inject = [];

/* @ngInject */
function directiveWGComments() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/project-comments/client/views/wg-comments.html',
		controller: function($scope) {
			$scope.wgMembers = [
				{_id: 1, name: 'Ted Striker', hasUnvetted: true, status: 'Pending', comments: [{comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae varius erat, sit amet posuere nisi. Nulla facilisi. Vestibulum lobortis rutrum maximus. Vivamus pulvinar laoreet ipsum, eget tristique purus egestas ac. Vestibulum posuere massa at urna mattis, at semper elit condimentum. Duis eleifend, purus id ultricies posuere, sapien nulla porta diam, eget congue turpis mi vitae magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam id enim ac eros luctus pulvinar. Vestibulum varius, sem vel lobortis faucibus, risus lacus elementum tellus, vitae pulvinar erat orci sed tellus. Sed blandit lacus gravida interdum posuere. Sed laoreet leo elit, ac pulvinar felis elementum eget. Suspendisse semper sapien lectus, ut consectetur massa molestie eget. Vestibulum egestas nunc in justo elementum, in congue risus iaculis. Etiam nec sapien eleifend, hendrerit libero nec, iaculis eros. Aliquam quis libero eu nunc posuere bibendum. Nunc id sapien sit amet justo malesuada finibus eget hendrerit felis. Curabitur sollicitudin at nisl ac pellentesque. Duis porttitor felis ac euismod volutpat. Curabitur venenatis, leo consectetur pretium pretium, neque dolor vehicula tellus, nec facilisis lacus ipsum quis dolor.', isVetted: false}]},
				{_id: 2, name: 'Orlando Jones', hasUnvetted: false, status: 'Responded', comments: [{comment: 'Comment Comment', isVetted: true}]},
				{_id: 3, name: 'Steve Steverson', hasUnvetted: false, status: 'Responded', comments: [{comment: 'Comment Comment', isVetted: true}]}
			];

			$scope.selectUser = function(user) {
	// console.log(user);
				$scope.selectedUser = user;
			};

			$scope.isSelectedUser = function(user) {
				if (!$scope.selectedUser) {
					return false;
				}
				return angular.equals($scope.selectedUser, user);
			};
		}
	};



	return directive;
}
