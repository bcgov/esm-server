'use strict';

angular.module('process')
    .run( configProcessNotifications )
	.directive('tmplNotifications',  directiveProcessNotifications);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configProcessNotifications.$inject = ['ProcessCodes'];
/* @ngInject */
function configProcessNotifications(ProcessCodes) {
    ProcessCodes.push('Notifications');
}
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
