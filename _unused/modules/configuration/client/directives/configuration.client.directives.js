'use strict';

angular.module('configuration')
    .directive('tmplConfiguration', directiveConfiguration)
    .directive('tmplConfigStreams', directiveConfigStreams)
    .directive('tmplConfigRequirements', directiveConfigRequirements)
    .directive('tmplConfigPhases', directiveConfigPhases)
    .directive('tmplConfigTopics', directiveConfigTopics)
    .directive('tmplConfigMilestones', directiveConfigMilestones)
    .directive('tmplConfigActivities', directiveConfigActivities)
    .directive('tmplConfigTasks', directiveConfigTasks);


// ----- directiveFunction -----
directiveConfiguration.$inject = [];

/* @ngInject */
function directiveConfiguration() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/configuration.html',
        controller: 'controllerConfiguration',
        controllerAs: 'configData'
    };

    return directive;
}


// ----- directiveFunction -----
directiveConfigStreams.$inject = [];

/* @ngInject */
function directiveConfigStreams() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-streams.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@',
            childGroup: '@'
        }
    };

    return directive;
}


// ----- directiveFunction -----
directiveConfigRequirements.$inject = [];

/* @ngInject */
function directiveConfigRequirements() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-requirements.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@',
            childGroup: '@'
        }
    };

    return directive;
}

// ----- directiveFunction -----
directiveConfigPhases.$inject = [];

/* @ngInject */
function directiveConfigPhases() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-phases.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@',
            childGroup: '@'
        }
    };

    return directive;
}

// ----- directiveFunction -----
directiveConfigTopics.$inject = [];

/* @ngInject */
function directiveConfigTopics() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-topics.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@',
            childGroup: '@'
        }           
    };

    return directive;
}

// ----- directiveFunction -----
directiveConfigMilestones.$inject = [];

/* @ngInject */
function directiveConfigMilestones() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-milestones.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@',
            childGroup: '@'
        }
    };

    return directive;
}

// ----- directiveFunction -----
directiveConfigActivities.$inject = [];

/* @ngInject */
function directiveConfigActivities() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-activities.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@',
            childGroup: '@'
        }
    };

    return directive;
}    

// ----- directiveFunction -----
directiveConfigTasks.$inject = [];

/* @ngInject */
function directiveConfigTasks() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-tasks.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@',
            childGroup: '@'
        }
    };

    return directive;
}
