'use strict';

angular.module ('vcs')

// -------------------------------------------------------------------------
//
// directive for listing vcs
//
// -------------------------------------------------------------------------
.directive ('tmplVcList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/vcs/client/views/vc-list.html',
		controller: 'controllerVcList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a vc
//
// -------------------------------------------------------------------------
.directive ('editVcModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			vc: '=',
			mode: '='
		},
		link : function (scope, element, attrs) {
			// console.log('editVcModal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/vcs/client/views/vc-edit.html',
					controller   : 'controllerEditVcModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshVcList');
				}, function () {});
			});
		}
	};
}])

// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of artifacts in order to choose one.
// so, essentially an artifact chooser
//
// -------------------------------------------------------------------------
.directive ('vcChooser', function ($modal, VcModel, _) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			current: '=',
			pillars: '=',
			topics: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/vcs/client/views/vc-chooser.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						vcs: function (VcModel) {
							return VcModel.forProject (scope.project._id);
						}
					},
					controller: function ($scope, $modalInstance, vcs) {
						var s = this;
						s.selected = scope.current;
						s.vcs = vcs;
						var index = vcs.reduce (function (prev, next) {
							prev[next._id] = next;
							return prev;
						}, {});
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () {
							var pills = {};
							var tops = [];
							scope.pillars.splice (0);
							scope.topics.splice (0);
							tops = s.selected.map (function (e) {
								pills[index[e].pillar] = 1;
								return index[e].name;
							});
							scope.pillars.splice (0, 0, _.keys (pills));
							scope.topics.splice (0, 0, tops.join(', '));
							// console.log ('selected = ', tops);
							// console.log ('selected = ', pills);
							// console.log ('selected = ', scope.pillars);
							// console.log ('selected = ', scope.topics);
							$modalInstance.close (s.selected);
						};
						s.dealwith = function (id) {
							var i = s.selected.indexOf (id);
							if (i !== -1) {
								s.selected.splice (i, 1);
							}
							else {
								s.selected.push (id);
							}
						};
					}
				})
				.result.then (function (data) {
					// console.log ('selected = ', data);
				})
				.catch (function (err) {});
			});
		}
	};
})

;
