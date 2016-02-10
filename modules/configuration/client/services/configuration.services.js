/*
'use strict';
// =========================================================================
//
// configuration services all deal with the structure of streams, projects
// and things related to those issues.  This is where to create new
// elements in the hierarchy, both real and base objects, and attach them
// to one another into stream and/or project hierarchies
//
// =========================================================================

angular.module('configuration').service('Configuration', serviceConfiguration);


// -----------------------------------------------------------------------------------
//
// Service: Configuration Services
//
// -----------------------------------------------------------------------------------
serviceConfiguration.$inject = ['$http'];
// @ngInject
function serviceConfiguration($http) {
	//
	// just some shorthand helpers
	//
	var crud = {
		new    : function (name) { return function ()    { return $http ({method:'GET'   , url:'/api/new/'+name })}; },
		all    : function (name) { return function ()    { return $http ({method:'GET'   , url:'/api/'+name })}; },
		delete : function (name) { return function (id)  { return $http ({method:'DELETE', url:'/api/'+name+'/'+id }); }}
		get    : function (name) { return function (id)  { return $http ({method:'GET'   , url:'/api/'+name+'/'+id })}; },
		save   : function (name) { return function (obj) { return $http ({method:'PUT'   , url:'/api/'+name+'/'+obj._id, data:obj })}; },
		add    : function (name) { return function (obj) { return $http ({method:'POST'  , url:'/api/'+name, data:obj })}; },
	};
	var allcrud = function (name) {
		return {
	        all    : crud.all (name),
	        get    : crud.get (name),
	        new    : crud.new (name),
	        add    : crud.add (name),
	        save   : crud.save (name),
	        delete : crud.delete (name)
	    };
	};
	var put = function (url) {
		return $http ({method:'PUT', url:url});
	};
	//
	// first define all the basic crud services for both base objects and real ones
	//
	var services = {
		stream        : allcrud ('stream'),
		basePhase     : allcrud ('phasebase'),
		baseMilestone : allcrud ('milestonebase'),
		baseAction    : allcrud ('actionbase'),
		baseTask      : allcrud ('taskbase'),
		project       : allcrud ('project'),
		phase         : allcrud ('phase'),
		milestone     : allcrud ('milestone'),
		action        : allcrud ('action'),
		task          : allcrud ('task')
	};
	//
	// now add all the special actions for each base object
	// and the stream
	//
	services.stream.addPhase = function (streamId, basePhaseId) {
		return put ('/api/stream/'+streamId+'/add/phase/'+basePhaseId);
	};
	services.basePhase.addMilestone = function (basePhaseId, baseMilestoneId) {
		return put ('/api/phasebase/'+basePhaseId+'/add/milestone/'+baseMilestoneId);
	};
	services.baseMilestone.addActivity = function (baseMilestoneId, baseActivityId) {
		return put ('/api/milestonebase/'+baseMilestoneId+'/add/activity/'+baseActivityId);
	};
	services.baseActivity.addTask = function (baseActivityId, baseTaskId) {
		return put ('/api/activitybase/'+baseActivityId+'/add/task/'+baseTaskId);
	};
	//
	// add config routes for real objects at all levels of the hierarchy
	//
	services.project.setStream = function (projectId, streamId) {
		return put ('/api/project/'+projectId+'/set/stream/'+streamId);
	};
	services.project.addPhase = function (projectId, basePhaseId) {
		return put ('/api/project/'+projectId+'/add/phase/'+basePhaseId);
	};
	services.phase.addMilestone = function (phaseId, baseMilestoneId) {
		return put ('/api/phase/'+phaseId+'/add/milestone/'+baseMilestoneId);
	};
	services.milestone.addActivity = function (milestoneId, baseActivityId) {
		return put ('/api/milestone/'+milestoneId+'/add/activity/'+baseActivityId);
	};
	services.activity.addTask = function (activityId, baseTaskId) {
		return put ('/api/activity/'+activityId+'/add/task/'+baseTaskId);
	};
    return {
        //
        // get all configs
        //
        getConfig: function() {
            return $http({method:'GET',url: '/api/sys/configs'});
        },
		addPhaseToStream:
		addMilestoneToPhase:
		addActivityToMilestone:
		addTaskToActivity:
        // -------------------------------------------------------------------------
        //
        // get all streams or just one stream
        //
        // -------------------------------------------------------------------------
        getStreams: function() {
           return $http({method:'GET',url: '/api/stream'});
        },
        getStream: function(req) {
            return $http({method:'GET',url: '/api/stream/' + req._id});
        },

         getConfigItem: function (id, context) {
            return $http ({method:'GET', url: '/api/' + context + 'base/' + id});
        },
        getConfigItems: function (context) {
            return $http ({method:'GET', url: '/api/' + context + 'base'});
        },
        newConfigItem: function (context) {
            return $http ({method:'GET', url: '/api/new/' + context + 'base'});
        },
        addConfigItem: function (req, context) {
            return $http ({method:'POST',url: '/api/' + context + 'base', data: req});
        },
        saveConfigItem: function (req, context) {
            return $http ({method:'POST',url: '/api/' + context + 'base/' + req._id, data: req});
        },
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


        var getConfigItem = function(context) {
            return $http({method:'GET',url: '/api/' + context});
        };
        var newConfigItem = function(context) {
            return $http({method:'GET',url: '/api/new/' + context});
        };
        var addConfigItem = function(req, context) {
            return $http({method:'POST',url: '/api/' + context, data: req});
        };
        var saveConfigItem = function(req, context) {
            return $http({method:'PUT',url: '/api/' + context + '/' + req._id, data: req});
        };


        var addBucketToStream = function(streamId, bucketId) {
            return $http({method:'PUT',url: '/api/stream/' + streamId + '/add/bucket/' + bucketId});
        };

        var addPhaseToStream = function(streamId, phaseId) {
            return $http({method:'PUT',url: '/api/stream/' + streamId + '/add/phase/' + phaseId});
        };

        var addMilestoneToPhase = function(phaseId, milestoneId) {
            return $http({method:'PUT',url: '/api/stream/phase/' + phaseId + '/add/milestone/' + milestoneId});
        };

        var addActivityToPhase = function(phaseId, activityId) {
            return $http({method:'PUT',url: '/api/stream/phase/' + phaseId + '/add/activity/' + activityId});
        };

        var addTaskToActivity = function(activityId, taskId) {
            return $http({method:'PUT',url: '/api/stream/activity/' + activityId + '/add/task/' + taskId});
        };

        var addRequirementToTask = function(taskId, requirementId) {
            return $http({method:'PUT',url: '/api/stream/task/' + taskId + '/add/requirement/' + requirementId});
        };

        var addRequirementToMilestone = function(milestoneId, requirementId) {
            return $http({method:'PUT',url: '/api/stream/milestone/' + milestoneId + '/add/stream/requirement/' + requirementId});
        };

        var addRequirementToBucket= function(bucketId, requirementId) {
            return $http({method:'PUT',url: '/api/stream/bucket/' + bucketId + '/add/stream/requirement/' + requirementId});
        };


}

*/

