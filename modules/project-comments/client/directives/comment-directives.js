'use strict';

angular.module ('comment')
	.directive('tmplWgComments', directiveWGComments)
// -------------------------------------------------------------------------
//
// list of public comments from the point of view of the public
//
// -------------------------------------------------------------------------
.directive ('tmplPublicCommentList', function ($modal, _) {
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

			var isPublic    = !Authentication.user.roles;
			var isEao       = (!$scope.isPublic && (!!~Authentication.user.roles.indexOf ($scope.project.code+':eao:member') || !!~Authentication.user.roles.indexOf ('admin')));
			var isProponent = (!$scope.isPublic && (!!~Authentication.user.roles.indexOf ($scope.project.code+':pro:member')));

			var canVet      = $scope.isEao;
			var canClassify = $scope.isProponent;

			isPublic    = false;
			isEao       = true;
			isProponent = false;

			s.isPublic    = isPublic   ;
			s.isEao       = isEao      ;
			s.isProponent = isProponent;

			s.toggle = function (v) {
				angular.extend(s.tableParams.filter(), {eaoStatus:v});
			};
			s.toggleP = function (v) {
				angular.extend(s.tableParams.filter(), {proponentStatus:v});
			};
			s.refreshEao = function () {
				CommentModel.getEAOCommentsForPeriod ($scope.period._id).then (function (result) {
					s.totalPending  = result.totalPending;
					s.totalDeferred = result.totalDeferred;
					s.totalPublic   = result.totalPublic;
					s.totalRejected = result.totalRejected;
					s.tableParams   = new NgTableParams ({count:10, filter:{eaoStatus:'Unvetted'}}, {dataset:result.data});
					$scope.$apply ();
				});
			};
			s.refreshPublic = function () {
				CommentModel.getCommentsForPeriod ($scope.period._id).then (function (collection) {
					s.tableParams = new NgTableParams ({count:10}, {dataset:collection});
					$scope.$apply ();
				});
			};
			s.refreshProponent = function () {
				CommentModel.getProponentCommentsForPeriod ($scope.period._id).then (function (result) {
					s.totalAssigned   = result.totalAssigned;
					s.totalUnassigned = result.totalUnassigned;
					s.tableParams     = new NgTableParams ({count:10}, {dataset:result.data});
					$scope.$apply ();
				});
			};
			//
			// if the user clicks a row, open the detail modal
			//
			s.detail = function (comment) {
				var old = {
					status  : comment.eaoStatus,
					pStatus : comment.proponentStatus,
					topics  : comment.topics.map (function (e) { return e; }),
					vcs     : comment.valuedComponents.map (function (e) { return e; }),
					pillars : comment.pillars.map (function (e) { return e; }),
					notes   : comment.eaoNotes,
					rnotes  : comment.rejectedNotes,
					rreas   : comment.rejectedReason
				};
				$modal.open ({
					animation: true,
					templateUrl: 'modules/project-comments/client/views/public-comments/detail.html',
					controllerAs: 's',
					size: 'lg',
					windowClass: 'public-comment-modal',
					controller: function ($scope, $modalInstance) {
						$scope.isPublic    = isPublic   ;
						$scope.isEao       = isEao      ;
						$scope.isProponent = isProponent;

						$scope.isPublic    = false   ;
						$scope.isEao       = true      ;
						$scope.isProponent = false;

						$scope.comment     = comment;
						$scope.cancel      = function () { $modalInstance.dismiss ('cancel'); };
						$scope.ok          = function () { $modalInstance.close (comment); };
					}
				})
				.result.then (function (data) {
					console.log ('result:', data);
					CommentModel.save (data)
					.then (function (result) {
						if (isEao) {
							s.refreshEao ();
						}
						else if (isProponent) {
							s.refreshProponent ();
						}
					});
				})
				.catch (function (err) {});
			};
			if (s.isPublic) {
				s.refreshPublic ();
			}
			else if (s.isEao) {
				s.refreshEao ();
			}
			else if (s.isProponent) {
				s.refreshProponent ();
			}
		}
	};
})
// -------------------------------------------------------------------------
//
// add a public comment
//
// -------------------------------------------------------------------------
.directive ('addPublicComment', function ($modal, CommentModel) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			period : '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/project-comments/client/views/public-comments/add.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						comment: function (CommentModel) {
							return CommentModel.getNew ();
						}
					},
					controller: function ($scope, $modalInstance, comment) {
						var s     = this;
						s.step    = 1;
						s.comment = comment;
						comment.period = scope.period;
						comment.project = scope.project;
						comment.makeVisible = false;
						s.cancel  = function () { $modalInstance.dismiss ('cancel'); };
						s.next    = function () { s.step++; };
						s.ok      = function () { $modalInstance.close (s.comment); };
						s.submit  = function () {
							comment.isAnonymous = !comment.makeVisible;
							CommentModel.add (s.comment)
							.then (function (comment) {
								s.step = 3;
								$scope.$apply ();
							})
							.catch (function (err) {
								s.step = 4;
								$scope.$apply ();
							});
						};
					}
				})
				.result.then (function (data) {
				})
				.catch (function (err) {});
			});
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
