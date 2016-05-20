'use strict';

angular.module('control')
    .directive('tmplSetVisibility',  directiveSetVisibility);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveSetVisibility.$inject = [];
/* @ngInject */
function directiveSetVisibility() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/controls/set-visibility/client/set-visibility.html',
        controller: 'controllerControlSetVisibiliy',
        controllerAs: 'ctrlSetVis',
        scope: {
            project: '='
        }
    };
    return directive;
}
