'use strict';

angular.module('configuration')
    .service('Configuration', serviceConfiguration);
// -----------------------------------------------------------------------------------
//
// Service: Configuration Services
//
// -----------------------------------------------------------------------------------
serviceConfiguration.$inject = ['$http', 'SERVERAPI'];
/* @ngInject */
function serviceConfiguration($http, SERVERAPI) {

    // Generalized config items.
    // the context defines the url.
    var getConfig = function() {
        return $http({method:'GET',url: SERVERAPI + '/sys/configs'});
    };

    var getStreams = function() {
        return $http({method:'GET',url: SERVERAPI + '/stream'});
    };

    var getStream = function(req) {
        return $http({method:'GET',url: SERVERAPI + '/stream/' + req._id});
    };


    var getBaseConfigItem = function(context) {
        return $http({method:'GET',url: SERVERAPI + '/base/' + context});
    };


    var getConfigItem = function(context) {
        return $http({method:'GET',url: SERVERAPI + '/' + context});
    };
    var newConfigItem = function(context) {
        return $http({method:'GET',url: SERVERAPI + '/new/' + context});
    };
    var addConfigItem = function(req, context) {
        return $http({method:'POST',url: SERVERAPI + '/' + context, data: req});
    };
    var saveConfigItem = function(req, context) {
        return $http({method:'PUT',url: SERVERAPI + '/' + context + '/' + req._id, data: req});
    };


    var addBucketToStream = function(streamId, bucketId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/' + streamId + '/add/bucket/' + bucketId});
    };

    var addPhaseToStream = function(streamId, phaseId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/' + streamId + '/add/phase/' + phaseId});
    };

    var addMilestoneToPhase = function(phaseId, milestoneId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/phase/' + phaseId + '/add/milestone/' + milestoneId});
    };

    var addActivityToPhase = function(phaseId, activityId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/phase/' + phaseId + '/add/activity/' + activityId});
    };

    var addTaskToActivity = function(activityId, taskId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/activity/' + activityId + '/add/task/' + taskId});
    };

    var addRequirementToTask = function(taskId, requirementId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/task/' + taskId + '/add/requirement/' + requirementId});
    };

    var addRequirementToMilestone = function(milestoneId, requirementId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/milestone/' + milestoneId + '/add/stream/requirement/' + requirementId});
    };

    var addRequirementToBucket= function(bucketId, requirementId) {
        return $http({method:'PUT',url: SERVERAPI + '/stream/bucket/' + bucketId + '/add/stream/requirement/' + requirementId});
    };


    return {
        getConfig: getConfig,
        getStreams: getStreams,
        getStream: getStream,

        getBaseConfigItem: getBaseConfigItem,
        
        getConfigItem: getConfigItem,
        newConfigItem: newConfigItem,
        addConfigItem: addConfigItem,
        saveConfigItem: saveConfigItem,

        addBucketToStream: addBucketToStream,
        addPhaseToStream: addPhaseToStream,
        addMilestoneToPhase: addMilestoneToPhase,
        addActivityToPhase: addActivityToPhase,
        addTaskToActivity: addTaskToActivity,
        addRequirementToTask: addRequirementToTask,
        addRequirementToMilestone: addRequirementToMilestone,
        addRequirementToBucket: addRequirementToBucket
	};
}    
