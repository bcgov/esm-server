'use strict';
angular.module ('comment')
// -------------------------------------------------------------------------
//
// Initial popup shown upon creation of a comment period.
// Forces user to select the type of comment perio to create; e.g. Public or Joint (or...)
//
// -------------------------------------------------------------------------
.directive ('periodCreateModal', function ($state, $modal) {
	return {
		restrict: 'A',
		scope: {},
		link: function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/project-comments/client/views/period-create-modal.html',
					size: 'md',
					windowClass: 'public-comment-modal',
					controllerAs: 'ctrl',
					controller: function ($scope, $modalInstance) {
						var ctrl = this;
						ctrl.periodType = 'Public';
						ctrl.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						ctrl.ok = function () {
							$modalInstance.close(ctrl.periodType);
						};
					}
				})
				.result.then (function (data) {
					// Redirect to the PCP page that matches the type selected in this modal...
					var periodType = data;
					if (periodType === 'Public') {
						return $state.go('p.commentperiod.create', { periodType: 'public' }, { reload: true });
					} else if (periodType === 'Joint') {
						return $state.go('p.commentperiod.create', { periodType: 'joint' }, { reload: true });
					}
				})
				.catch (function (err) {});
			});
		}
	};
});
