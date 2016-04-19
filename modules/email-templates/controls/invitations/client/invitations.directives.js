'use strict';

angular.module('control')
	.directive('tmplInvitations',  directiveProcessInvitations);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessInvitations.$inject = [];
/* @ngInject */
function directiveProcessInvitations() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/email-templates/controls/invitations/client/invitations.html',
        controller: 'controllerProcessInvitations',
        controllerAs: 'taskInvitations',
        scope: {
        	anchor: '@',
        	task: '=',
            project: '='
        }
    };
    return directive;
}
