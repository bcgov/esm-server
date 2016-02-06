'use strict';

angular.module('configuration')
    .service('sConfiguration', serviceConfiguration);
// -----------------------------------------------------------------------------------
//
// Service: Configuration Services
//
// -----------------------------------------------------------------------------------
serviceConfiguration.$inject = ['$http', '_'];
/* @ngInject */
function serviceConfiguration($http, _) {

    // Generalized config items.
    // the context defines the url.
    var getConfig = function() {
        return $http({method:'GET',url: '/api/sys/configs'});
    };

    var getStreams = function() {
        return $http({method:'GET',url: '/api/stream'});
    };

    var getStream = function(req) {
        return $http({method:'GET',url: '/api/stream/' + req._id});
    };


    var getBaseConfigItem = function(context) {
        return $http({method:'GET',url: '/api/base/' + context});
    };


    var getConfigItem = function(context) {
        return $http({method:'GET',url: '/api/' + context});
    };
    var newConfigItem = function(context) {
        return $http({method:'GET',url: '/api/new/' + context});
    };
    var addConfigItem = function(req, context, childGroup) {
        // convert child group to id's only
        if(childGroup) {
            var objIds = [];
            _.each(req[childGroup], function(item) {
                objIds.push( item._id );
            });
            req[childGroup] = objIds;
        }
        return $http({method:'POST',url: '/api/' + context, data: req});
    };
    var saveConfigItem = function(req, context, childGroup) {
        // convert child group to id's only
        if(childGroup) {
            var objIds = [];
            _.each(req[childGroup], function(item) {
                objIds.push( item._id );
            });
            req[childGroup] = objIds;
        }
        return $http({method:'PUT',url: '/api/' + context + '/' + req._id, data: req});
    };


    // var addBucketToStream = function(streamId, bucketId) {
    //     return $http({method:'PUT',url: '/api/stream/' + streamId + '/add/bucket/' + bucketId});
    // };

    // var addPhaseToStream = function(streamId, phaseId) {
    //     return $http({method:'PUT',url: '/api/stream/' + streamId + '/add/phase/' + phaseId});
    // };

    // var addMilestoneToPhase = function(phaseId, milestoneId) {
    //     return $http({method:'PUT',url: '/api/stream/phase/' + phaseId + '/add/milestone/' + milestoneId});
    // };

    // var addActivityToPhase = function(phaseId, activityId) {
    //     return $http({method:'PUT',url: '/api/stream/phase/' + phaseId + '/add/activity/' + activityId});
    // };

    // var addTaskToActivity = function(activityId, taskId) {
    //     return $http({method:'PUT',url: '/api/stream/activity/' + activityId + '/add/task/' + taskId});
    // };

    // var addRequirementToTask = function(taskId, requirementId) {
    //     return $http({method:'PUT',url: '/api/stream/task/' + taskId + '/add/requirement/' + requirementId});
    // };

    // var addRequirementToMilestone = function(milestoneId, requirementId) {
    //     return $http({method:'PUT',url: '/api/stream/milestone/' + milestoneId + '/add/stream/requirement/' + requirementId});
    // };

    // var addRequirementToBucket= function(bucketId, requirementId) {
    //     return $http({method:'PUT',url: '/api/stream/bucket/' + bucketId + '/add/stream/requirement/' + requirementId});
    // };


    return {
        getConfig: getConfig,
        getStreams: getStreams,
        getStream: getStream,

        getBaseConfigItem: getBaseConfigItem,
        
        getConfigItem: getConfigItem,
        newConfigItem: newConfigItem,
        addConfigItem: addConfigItem,
        saveConfigItem: saveConfigItem,

        // addBucketToStream: addBucketToStream,
        // addPhaseToStream: addPhaseToStream,
        // addMilestoneToPhase: addMilestoneToPhase,
        // addActivityToPhase: addActivityToPhase,
        // addTaskToActivity: addTaskToActivity,
        // addRequirementToTask: addRequirementToTask,
        // addRequirementToMilestone: addRequirementToMilestone,
        // addRequirementToBucket: addRequirementToBucket
	};
}    
