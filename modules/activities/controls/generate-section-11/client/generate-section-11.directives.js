'use strict';

angular.module('control')
	.directive('tmplGenerateSection11',  directiveControlGenerateSection11);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Control, Section 11 Confirm
//
// -----------------------------------------------------------------------------------
directiveControlGenerateSection11.$inject = [];
/* @ngInject */
function directiveControlGenerateSection11() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/controls/generate-section-11/client/generate-section-11.html',
        controller: 'controllerControlGenerateSection11',
        controllerAs: 'ctrlSection11',
        scope: {
        	project: '='
        }
    };
    return directive;
}
