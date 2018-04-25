'use strict';
angular.module ('comment')
// -------------------------------------------------------------------------
//
// Initial popup shown upon creation of a comment period.
// Forces user to select the type of comment perio to create; e.g. Public or Joint (or...)
//
// -------------------------------------------------------------------------
  .directive ('periodCreateModal', function ($state, $uibModal) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element) {
        element.on('click', function () {
          $uibModal.open ({
            animation: true,
            templateUrl: 'modules/project-comments/client/views/period-create-modal.html',
            size: 'md',
            windowClass: 'public-comment-modal',
            controllerAs: 'ctrl',
            controller: function ($scope, $uibModalInstance) {
              var ctrl = this;
              ctrl.periodType = 'Public';
              ctrl.cancel = function () {
                $uibModalInstance.dismiss('cancel');
              };
              ctrl.ok = function () {
                $uibModalInstance.close(ctrl.periodType);
              };
            }
          })
            .result.then (function (data) {
              // Redirect to the PCP page that matches the type selected in this modal...
              var periodType = data;
              if (periodType === 'Public') {
                return $state.go('p.commentperiod.create', { periodType: 'public' }, { reload: true });
              }
            })
            .catch (function (/* err */) {
              // swallow error
            });
        });
      }
    };
  });
