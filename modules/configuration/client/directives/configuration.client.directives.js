'use strict';

angular.module('configuration')
    .directive('tmplConfiguration', directiveConfiguration)
    .directive('tmplConfigStreams', directiveConfigStreams)
    .directive('tmplConfigStream', directiveConfigStream)
    .directive('tmplConfigRequirements', directiveConfigRequirements)
    .directive('tmplConfigPhases', directiveConfigPhases)
    .directive('tmplConfigBuckets', directiveConfigBuckets)
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
            context: '@'
        }
    };

    return directive;
}


// ----- directiveFunction -----
directiveConfigStream.$inject = [];

/* @ngInject */
function directiveConfigStream() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-configure-stream.html',
        controller: 'controllerConfigStream',
        controllerAs: 'configStream',
        scope: {
            config: '=',
            stream: '='
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
            context: '@'
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
            context: '@'
        }
    };

    return directive;
}

// ----- directiveFunction -----
directiveConfigBuckets.$inject = [];

/* @ngInject */
function directiveConfigBuckets() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/configuration/client/views/partials/manage-buckets.html',
        controller: 'controllerConfigManageElement',
        controllerAs: 'configDataElement',
        scope: {
            config: '=',
            context: '@'
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
            context: '@'
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
            context: '@'
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
            context: '@'
        }
    };

    return directive;
}
