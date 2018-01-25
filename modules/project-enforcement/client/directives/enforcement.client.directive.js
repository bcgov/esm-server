'use strict';

angular.module('enforcements')
    .directive('tmplEnforcementBrowser', directiveEnforcementBrowser);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Browser
//
// -----------------------------------------------------------------------------------
directiveEnforcementBrowser.$inject = ['$uibModal'];
/* @ngInject */
function directiveEnforcementBrowser() {

    var directive = {
        restrict: 'E',
        replace: true,
        templateUrl: 'modules/project-enforcement/client/views/enforcement.html',
        controller: 'controllerEnforcementBrowser',
        controllerAs: 'enfBrowser',
        scope: {
            project: '='
        }
    };

    return directive;
}
