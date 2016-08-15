'use strict';
// =========================================================================
//
// enforcement routes
//
// =========================================================================
angular.module('enforcements').config(['$stateProvider', function ($stateProvider) {
        $stateProvider
        .state('p.enforcement', {
            abstract:true,
            url: '/enforcement',
            template: '<ui-view></ui-view>',
            resolve: {
                enforcements: function ($stateParams, project, EnforcementModel, IrModel) {
                    return IrModel.forProject(project._id);
                }
            }
        })
        // -------------------------------------------------------------------------
        //
        // the list state for enforcements and project are guaranteed to
        // already be resolved
        //
        // -------------------------------------------------------------------------
        .state('p.enforcement.list', {
            url: '/list',
            templateUrl: 'modules/project-enforcement/client/views/enforcement-list.html',
            controller: function ($scope, NgTableParams, enforcements, project) {
                $scope.tableParams = new NgTableParams ({count:10}, {dataset: enforcements});
                $scope.project = project;
            }
        });
}]);











