'use strict';

angular.module('control')
	.directive('tmplNotifications',  directiveProcessNotifications);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessNotifications.$inject = [];
/* @ngInject */
function directiveProcessNotifications() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/notifications/client/notifications.html',
        controller: 'controllerProcessNotifications',
        controllerAs: 'taskNotifications',
        scope: {
        	anchor: '@',
        	task: '=',
            project: '='
        }
    };
    return directive;
}
