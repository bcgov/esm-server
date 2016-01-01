'use strict';

angular.module('configuration')
    .controller('controllerConfiguration', controllerConfiguration)
    .controller('controllerConfigStream', controllerConfigStream)
    .controller('controllerConfigManageElement', controllerConfigManageElement);
// -----------------------------------------------------------------------------------
//
// Controller Configuration
//
// -----------------------------------------------------------------------------------
controllerConfiguration.$inject = ['$rootScope', '$scope', 'Configuration'];
/* @ngInject */
function controllerConfiguration($rootScope, $scope, Configuration) {
	var configData = this;
    // load all configurations
    configData.curTab = undefined;
    configData.config = undefined;

    Configuration.getConfig().then( function(res) {
        configData.config = res.data;
        
        // get streams too
        Configuration.getStreams().then( function(res) {
            configData.config.streams = res.data;
        });
    });

    
    $rootScope.$on('refreshConfig', function() { 
        Configuration.getConfig().then( function(res) {
            configData.config = res.data;
            // get streams too
            Configuration.getStreams().then( function(res) {
                configData.config.streams = res.data;
            });
        });

    });

}

// -----------------------------------------------------------------------------------
//
// Configure a stream
//
// -----------------------------------------------------------------------------------
controllerConfigStream.$inject = ['$rootScope', '$scope', 'Configuration', '_'];
/* @ngInject */
function controllerConfigStream($rootScope, $scope, Configuration, _) {
    var configStream = this;
    // load all configurations
    configStream.config = undefined;
    

    $scope.$watch('config', function(newValue) {
        if (newValue) {
            configStream.data = newValue;
        }
    });


    function reloadStreamPostSetup() {
        console.log('loaded post before',  angular.copy(configStream.tree));

        configStream.tree = {};
        configStream.tree.milestonesByPhase = {};
        configStream.tree.activitiesByPhase = {};
        configStream.tree.tasksByActivity = {};
        configStream.tree.requirementsByTask = {};
        configStream.tree.requirementsByMilestone = {};
        configStream.tree.requirementsByBucket = {};

        configStream.tree.buckets = [];
        configStream.tree.phases = [];

        _.each(configStream.activeRecord.buckets, function(bucket) {
            configStream.tree.buckets.push(bucket);
            configStream.tree.requirementsByBucket[bucket._id] = [];         
        });

        _.each(configStream.activeRecord.phases, function(phase) {
            configStream.tree.phases.push(phase);
            configStream.tree.milestonesByPhase[phase._id] = [];
            configStream.tree.activitiesByPhase[phase._id] = [];               
        });

        // process milestones
        _.each(configStream.activeRecord.milestones, function(milestone) {
            if (!configStream.tree.milestonesByPhase[milestone.phase]) {
                configStream.tree.milestonesByPhase[milestone.phase] = [];
            }
            configStream.tree.milestonesByPhase[milestone.phase].push(milestone);
            configStream.tree.requirementsByMilestone[milestone._id] = [];
        });

        // process activities
        _.each(configStream.activeRecord.activities, function(activity) {
            if (!configStream.tree.activitiesByPhase[activity.phase]) {
                configStream.tree.activitiesByPhase[activity.phase] = []; 
            }
            configStream.tree.activitiesByPhase[activity.phase].push(activity);
            configStream.tree.tasksByActivity[activity._id] = [];
        });

        // process tasks by activity id
        _.each(configStream.activeRecord.tasks, function(task) {
            if (!configStream.tree.tasksByActivity[task.activity]) {
                configStream.tree.tasksByActivity[task.activity] = []; 
            }
            configStream.tree.tasksByActivity[task.activity].push(task);
            configStream.tree.requirementsByTask[task._id] = [];
        });

        // process requirement by task id
        _.each(configStream.activeRecord.requirements, function(requirement) {
            if (requirement.task){
                if (!configStream.tree.requirementsByTask[requirement.task]) {
                    configStream.tree.requirementsByTask[requirement.task] = []; 
                }
                configStream.tree.requirementsByTask[requirement.task].push(requirement);
            }
            if (requirement.milestone) {
                if (!configStream.tree.requirementsByMilestone[requirement.milestone]) {
                    configStream.tree.requirementsByMilestone[requirement.milestone] = []; 
                }
                configStream.tree.requirementsByMilestone[requirement.milestone].push(requirement);
            }
            if (requirement.bucket) {
                if (!configStream.tree.requirementsByBucket[requirement.bucket]) {
                    configStream.tree.requirementsByBucket[requirement.bucket] = []; 
                }
                configStream.tree.requirementsByBucket[requirement.bucket].push(requirement);
            }
        });

        console.log('loaded', configStream.tree);
    }



    function reloadStream() {
        Configuration.getStream(configStream.activeRecord).then( function(res) {
            configStream.activeRecord = res.data;
            configStream.activeRecord.configureStream = true;
            reloadStreamPostSetup();
        });
    }


    $scope.$watch('stream', function(newValue) {
        if (newValue) {
            configStream.activeRecord = newValue;
            configStream.backupRecord = angular.copy(newValue);
            reloadStreamPostSetup();
        }
    });


    // add the new phases to the stream.
    configStream.addBuckets = function(newItems) {
        // add a holder for each milestone and activity
        var i = newItems.length;
        _.each(newItems, function(bucket) {
            i--;
            if( !_.some( configStream.activeRecord.buckets, {'_id': bucket._id}) ) {
                Configuration.addBucketToStream(configStream.activeRecord._id, bucket._id).then( function(res) {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

    // add the new phases to the stream.
    configStream.addPhases = function(newItems) {
        // add a holder for each milestone and activity
        var i = newItems.length;
        console.log('stream', newItems);
        _.each(newItems, function(phase) {
            i--;
            if( !_.some( configStream.activeRecord.phases, {'_id': phase._id}) ) {
                Configuration.addPhaseToStream(configStream.activeRecord._id, phase._id).then( function(res) {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

    // add the new milestones to the stream phases.
    configStream.milestonesToPhase = function(newItems, originalItems, phase) {
        var i = newItems.length;
        // for each new milestone, see if it's already related to the phase.
        _.each( newItems, function(newItem) {
            i--;
            if ( !_.some(configStream.tree.milestonesByPhase[phase._id], {'_id': newItem._id})) {
                Configuration.addMilestoneToPhase(phase._id, newItem._id).then( function() {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

    // add the new activities to the stream phase.
    configStream.activitiesToPhase = function(newItems, originalItems, phase) {
        var i = newItems.length;
        // for each new milestone, see if it's already related to the phase.
        _.each( newItems, function(newItem) {
            i--;
            if ( !_.some(configStream.tree.activitiesByPhase[phase._id], {'_id': newItem._id})) {
                Configuration.addActivityToPhase(phase._id, newItem._id).then( function() {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

    // add the new tasks to the stream activities.
    configStream.tasksToActivity = function(newItems, originalItems, activity) {
        var i = newItems.length;
        _.each( newItems, function(newItem) {
            i--;
            if ( !_.some(configStream.tree.tasksByActivity[activity._id], {'_id': newItem._id})) {
                Configuration.addTaskToActivity(activity._id, newItem._id).then( function() {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

    // add the new requirements to the stream tasks.
    configStream.requirementsToTask = function(newItems, originalItems, task) {
        var i = newItems.length;
        _.each( newItems, function(newItem) {
            i--;
            if ( !_.some(configStream.tree.requirementsByTask[task._id], {'_id': newItem._id})) {
                Configuration.addRequirementToTask(task._id, newItem._id).then( function() {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

    // add the new requirements to the stream buckets.
    configStream.requirementsToBucket = function(newItems, originalItems, bucket) {
        var i = newItems.length;
        console.log('rtb', newItems, originalItems, bucket);
        _.each( newItems, function(newItem) {
            i--;
            if ( !_.some(configStream.tree.requirementsByBucket[bucket._id], {'_id': newItem._id})) {
                Configuration.addRequirementToBucket(bucket._id, newItem._id).then( function() {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

    // add the new requirements to the stream milestones.
    configStream.requirementsToMilestone = function(newItems, originalItems, milestone) {
        var i = newItems.length;
        _.each( newItems, function(newItem) {
            console.log('mile', milestone);
            i--;
            if ( !_.some(configStream.tree.requirementsByMilestone[milestone._id], {'_id': newItem._id})) {
                Configuration.addRequirementToMilestone(milestone._id, newItem._id).then( function() {
                    if (i === 0) reloadStream();
                });
            }
        });
    };

}
// -----------------------------------------------------------------------------------
//
// Config any element for user in the lookups
//
// -----------------------------------------------------------------------------------
controllerConfigManageElement.$inject = ['$scope', 'Configuration', 'ProcessCodes', '$filter', '_'];

/* @ngInject */
function controllerConfigManageElement($scope, Configuration, ProcessCodes, $filter, _) {
    var configDataElement = this;

    // for the task process code dropdown
    configDataElement.processCodes = ProcessCodes;

    configDataElement.activeRecord = undefined;
    configDataElement.activeRecordNew = false;

    $scope.$watch('config', function(newValue) {
        if (newValue) {
            configDataElement.data = newValue;
            console.log('data', configDataElement.data);
        }
    });

    $scope.$watch('context', function(newValue) {
        if (newValue) {
            configDataElement.context = newValue;
        }
    });


    // ----- New record template -----
    configDataElement.newRecord = function() {
        configDataElement.activeRecordNew = true;

        console.log('config', configDataElement.context);

        Configuration.newConfigItem(configDataElement.context).then( function(res) {
            configDataElement.activeRecord = res.data;
            console.log(res.data);
        });

    };

    // ----- Add a new record -----
    configDataElement.addRecord = function() {

        Configuration.addConfigItem(configDataElement.activeRecord, configDataElement.context).then( function(res) {
            configDataElement.activeRecord = res.data;
            configDataElement.msg = 'Record Added';
            configDataElement.activeRecord = undefined;
            configDataElement.activeRecordNew = false; 
            $scope.$emit('refreshConfig');
        });

    };

    // ----- Edit a new record -----
    configDataElement.editRecord = function(selectedRecord) {
        configDataElement.msg = '';
        configDataElement.activeRecordOriginal = selectedRecord;
        configDataElement.activeRecord = angular.copy(selectedRecord);
        configDataElement.activeRecordNew = false;
    };

    // ----- Save existing record -----
    configDataElement.saveRecord = function() {

        Configuration.saveConfigItem(configDataElement.activeRecord, configDataElement.context).then( function(res) {
            configDataElement.msg = 'Record Saved';
            configDataElement.activeRecord = undefined;
            _.assign(configDataElement.activeRecordOriginal, configDataElement.activeRecord);
            $scope.$emit('refreshConfig');
        });

    };

    // ----- Cancel a record -----
    configDataElement.cancelRecord = function() {
        configDataElement.msg = '';
        configDataElement.activeRecordOriginal = undefined;
        configDataElement.activeRecord = undefined;
        configDataElement.activeRecordNew = false;
    };


    // -----------------------------------------------------------------------------------
    //
    // FILTER: Resovle an ID to an item name within a stream
    //
    // -----------------------------------------------------------------------------------
    configDataElement.configureStream = function() {
        Configuration.getStream(configDataElement.activeRecord).then( function(res) {
            configDataElement.activeRecord = _.assign(res.data, configDataElement.activeRecord);
            configDataElement.activeRecord.configureStream = true;
            console.log('full stream to configure', configDataElement.activeRecord);
        });
    };

}
