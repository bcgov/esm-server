'use strict';

angular.module('configuration')
    .controller('controllerConfiguration', controllerConfiguration)
    // .controller('controllerConfigStream', controllerConfigStream)
    .controller('controllerConfigManageElement', controllerConfigManageElement);
// -----------------------------------------------------------------------------------
//
// Controller Configuration
//
// -----------------------------------------------------------------------------------
controllerConfiguration.$inject = ['$rootScope', '$scope', 'TaskBaseModel', 'ActivityBaseModel', 'MilestoneBaseModel', 'PhaseBaseModel', 'StreamModel'];
/* @ngInject */
function controllerConfiguration($rootScope, $scope, sTaskBaseModel, sActivityBaseModel, sMilestoneBaseModel, sPhaseBaseModel, sStreamModel) {
	var configData = this;
    // load all configurations
    configData.curTab = undefined;
    configData.config = {};

    configData.refresh = function() {
        sTaskBaseModel.getCollection().then( function(data) {
            configData.config.tasks = data;
        }).catch( function(err) {
            $scope.error = err;
        });

        sActivityBaseModel.getCollection().then( function(data) {
            configData.config.activities = data;
        }).catch( function(err) {
            $scope.error = err;
        });

        sMilestoneBaseModel.getCollection().then( function(data) {
            configData.config.milestones = data;
            console.log(data, configData.config);
        }).catch( function(err) {
            $scope.error = err;
        });

        sPhaseBaseModel.getCollection().then( function(data) {
            configData.config.phases = data;
        }).catch( function(err) {
            $scope.error = err;
        });

        sStreamModel.getCollection().then( function(data) {
            configData.config.stream = data;
        }).catch( function(err) {
            $scope.error = err;
        });

    };
    
    configData.refresh();

    $rootScope.$on('refreshConfig', function() { 
        configData.refresh();
    });
}


// -----------------------------------------------------------------------------------
//
// Config any element for user in the lookups
//
// -----------------------------------------------------------------------------------
controllerConfigManageElement.$inject = ['$scope', 'ProcessCodes', '$filter', '_', 'TaskBaseModel', 'ActivityBaseModel', 'MilestoneBaseModel', 'PhaseBaseModel', 'StreamModel'];

/* @ngInject */
function controllerConfigManageElement($scope, ProcessCodes, $filter, _, sTaskBaseModel, sActivityBaseModel, sMilestoneBaseModel, sPhaseBaseModel, sStreamModel) {
    var configDataElement = this;

    // for the task process code dropdown
    configDataElement.processCodes = ProcessCodes;

    configDataElement.activeRecord = undefined;
    configDataElement.activeRecordNew = false;

    $scope.$watch('config', function(newValue) {
        console.log(newValue, 'newval');
        if (newValue) {
            configDataElement.data = newValue;
        }
    });

    $scope.$watch('context', function(newValue) {
        if (newValue) {
            configDataElement.context = newValue;
        }
    });

    $scope.$watch('childGroup', function(newValue) {
        if (newValue) {
            configDataElement.child = newValue;
        }
    });


    // ----- New record template -----
    configDataElement.newRecord = function() {
        switch(configDataElement.context) {
            case 'stream':
                sStreamModel.getNew().then( function(data) {
                    configDataElement.activeRecord = data;
                    $scope.$apply();
                });
                break;
            case 'phase':
                sPhaseBaseModel.getNew().then( function(data) {
                    configDataElement.activeRecord = data;
                    $scope.$apply();
                });
                break;
            case 'milestone':
                sMilestoneBaseModel.getNew().then( function(data) {
                    configDataElement.activeRecord = data;
                    $scope.$apply();
                });
                break;
            case 'activity':
                sActivityBaseModel.getNew().then( function(data) {
                    configDataElement.activeRecord = data;
                    $scope.$apply();
                });
                break;
            case 'task':
                sTaskBaseModel.getNew().then( function(data) {
                    configDataElement.activeRecord = data;
                    $scope.$apply();
                });
                break;
        }
        console.log('new record', configDataElement.activeRecord);
        configDataElement.activeRecordNew = true;
    };

    // ----- Edit a new record -----
    configDataElement.editRecord = function(selectedRecord) {

        configDataElement.activeRecordNew = false;
        configDataElement.activeRecord = selectedRecord;
        
        switch(configDataElement.context) {
            case 'stream':
                sStreamModel.setModel(selectedRecord);
                break;
            case 'phase':
                sPhaseBaseModel.setModel(selectedRecord);
                break;
            case 'milestone':
                sMilestoneBaseModel.setModel(selectedRecord);
                break;
            case 'activity':
                sActivityBaseModel.setModel(selectedRecord);
                break;
            case 'task':
                sTaskBaseModel.setModel(selectedRecord);
                break;
        }

        // configDataElement.msg = '';
        // configDataElement.activeRecordOriginal = angular.copy(selectedRecord);
        // // copy so the original does not get changed.
        // 
        // configDataElement.activeRecordNew = false;
    };


    // ----- Save existing record -----
    configDataElement.saveRecord = function() {

        if(configDataElement.child) {
            var objIds = [];
            _.each(configDataElement.activeRecord[ configDataElement.child ], function(item) {
                objIds.push( item._id );
            });
            configDataElement.activeRecord[configDataElement.child] = objIds;
        }

        switch(configDataElement.context) {
            case 'stream':
                sStreamModel.saveModel().then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'phase':
                sPhaseBaseModel.saveModel().then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'milestone':
                sMilestoneBaseModel.saveModel().then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'activity':
                sActivityBaseModel.saveModel().then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'task':
                sTaskBaseModel.saveModel().then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
        }
        configDataElement.msg = 'Record Saved';
        configDataElement.activeRecord = undefined;
    };

    // ----- Cancel a record -----
    configDataElement.cancelRecord = function() {
        configDataElement.msg = '';
        configDataElement.activeRecordOriginal = undefined;
        configDataElement.activeRecord = undefined;
        configDataElement.activeRecordNew = false;
    };

}



// -----------------------------------------------------------------------------------
//
// Configure a stream
//
// -----------------------------------------------------------------------------------
// controllerConfigStream.$inject = ['$rootScope', '$scope', 'sConfiguration', '_'];
// /* @ngInject */
// function controllerConfigStream($rootScope, $scope, sConfiguration, _) {
//     var configStream = this;
//     // load all configurations
//     configStream.config = undefined;

//     $scope.$watch('config', function(newValue) {
//         if (newValue) {
//             configStream.data = newValue;
//         }
//     });

//     function reloadStreamPostSetup() {
//         console.log('loaded post before',  angular.copy(configStream.tree));

//         configStream.tree = {};
//         configStream.tree.milestonesByPhase = {};
//         configStream.tree.activitiesByPhase = {};
//         configStream.tree.tasksByActivity = {};
//         configStream.tree.requirementsByTask = {};
//         configStream.tree.requirementsByMilestone = {};
//         configStream.tree.requirementsByBucket = {};

//         configStream.tree.buckets = [];
//         configStream.tree.phases = [];

//         _.each(configStream.activeRecord.buckets, function(bucket) {
//             configStream.tree.buckets.push(bucket);
//             configStream.tree.requirementsByBucket[bucket._id] = [];         
//         });

//         _.each(configStream.activeRecord.phases, function(phase) {
//             configStream.tree.phases.push(phase);
//             configStream.tree.milestonesByPhase[phase._id] = [];
//             configStream.tree.activitiesByPhase[phase._id] = [];               
//         });

//         // process milestones
//         _.each(configStream.activeRecord.milestones, function(milestone) {
//             if (!configStream.tree.milestonesByPhase[milestone.phase]) {
//                 configStream.tree.milestonesByPhase[milestone.phase] = [];
//             }
//             configStream.tree.milestonesByPhase[milestone.phase].push(milestone);
//             configStream.tree.requirementsByMilestone[milestone._id] = [];
//         });

//         // process activities
//         _.each(configStream.activeRecord.activities, function(activity) {
//             if (!configStream.tree.activitiesByPhase[activity.phase]) {
//                 configStream.tree.activitiesByPhase[activity.phase] = []; 
//             }
//             configStream.tree.activitiesByPhase[activity.phase].push(activity);
//             configStream.tree.tasksByActivity[activity._id] = [];
//         });

//         // process tasks by activity id
//         _.each(configStream.activeRecord.tasks, function(task) {
//             if (!configStream.tree.tasksByActivity[task.activity]) {
//                 configStream.tree.tasksByActivity[task.activity] = []; 
//             }
//             configStream.tree.tasksByActivity[task.activity].push(task);
//             configStream.tree.requirementsByTask[task._id] = [];
//         });

//         // process requirement by task id
//         _.each(configStream.activeRecord.requirements, function(requirement) {
//             if (requirement.task){
//                 if (!configStream.tree.requirementsByTask[requirement.task]) {
//                     configStream.tree.requirementsByTask[requirement.task] = []; 
//                 }
//                 configStream.tree.requirementsByTask[requirement.task].push(requirement);
//             }
//             if (requirement.milestone) {
//                 if (!configStream.tree.requirementsByMilestone[requirement.milestone]) {
//                     configStream.tree.requirementsByMilestone[requirement.milestone] = []; 
//                 }
//                 configStream.tree.requirementsByMilestone[requirement.milestone].push(requirement);
//             }
//             if (requirement.bucket) {
//                 if (!configStream.tree.requirementsByBucket[requirement.bucket]) {
//                     configStream.tree.requirementsByBucket[requirement.bucket] = []; 
//                 }
//                 configStream.tree.requirementsByBucket[requirement.bucket].push(requirement);
//             }
//         });

//         console.log('loaded', configStream.tree);
//     }



//     function reloadStream() {
//         sConfiguration.getStream(configStream.activeRecord).then( function(res) {
//             configStream.activeRecord = res.data;
//             configStream.activeRecord.configureStream = true;
//             reloadStreamPostSetup();
//         });
//     }


//     $scope.$watch('stream', function(newValue) {
//         if (newValue) {
//             configStream.activeRecord = newValue;
//             configStream.backupRecord = angular.copy(newValue);
//             reloadStreamPostSetup();
//         }
//     });


//     // add the new phases to the stream.
//     configStream.addBuckets = function(newItems) {
//         // add a holder for each milestone and activity
//         var i = newItems.length;
//         _.each(newItems, function(bucket) {
//             i--;
//             if( !_.some( configStream.activeRecord.buckets, {'_id': bucket._id}) ) {
//                 sConfiguration.addBucketToStream(configStream.activeRecord._id, bucket._id).then( function(res) {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };


//     // add the new phases to the stream.
//     configStream.addPhases = function(newItems) {
//         // add a holder for each milestone and activity
//         var i = newItems.length;
//         console.log('stream', newItems);
//         _.each(newItems, function(phase) {
//             i--;
//             if( !_.some( configStream.activeRecord.phases, {'_id': phase._id}) ) {
//                 sConfiguration.addPhaseToStream(configStream.activeRecord._id, phase._id).then( function(res) {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };

//     // add the new milestones to the stream phases.
//     configStream.milestonesToPhase = function(newItems, originalItems, phase) {
//         var i = newItems.length;
//         // for each new milestone, see if it's already related to the phase.
//         _.each( newItems, function(newItem) {
//             i--;
//             if ( !_.some(configStream.tree.milestonesByPhase[phase._id], {'_id': newItem._id})) {
//                 sConfiguration.addMilestoneToPhase(phase._id, newItem._id).then( function() {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };

//     // add the new activities to the stream phase.
//     configStream.activitiesToPhase = function(newItems, originalItems, phase) {
//         var i = newItems.length;
//         // for each new milestone, see if it's already related to the phase.
//         _.each( newItems, function(newItem) {
//             i--;
//             if ( !_.some(configStream.tree.activitiesByPhase[phase._id], {'_id': newItem._id})) {
//                 sConfiguration.addActivityToPhase(phase._id, newItem._id).then( function() {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };

//     // add the new tasks to the stream activities.
//     configStream.tasksToActivity = function(newItems, originalItems, activity) {
//         var i = newItems.length;
//         _.each( newItems, function(newItem) {
//             i--;
//             if ( !_.some(configStream.tree.tasksByActivity[activity._id], {'_id': newItem._id})) {
//                 sConfiguration.addTaskToActivity(activity._id, newItem._id).then( function() {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };

//     // add the new requirements to the stream tasks.
//     configStream.requirementsToTask = function(newItems, originalItems, task) {
//         var i = newItems.length;
//         _.each( newItems, function(newItem) {
//             i--;
//             if ( !_.some(configStream.tree.requirementsByTask[task._id], {'_id': newItem._id})) {
//                 sConfiguration.addRequirementToTask(task._id, newItem._id).then( function() {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };

//     // add the new requirements to the stream buckets.
//     configStream.requirementsToBucket = function(newItems, originalItems, bucket) {
//         var i = newItems.length;
//         console.log('rtb', newItems, originalItems, bucket);
//         _.each( newItems, function(newItem) {
//             i--;
//             if ( !_.some(configStream.tree.requirementsByBucket[bucket._id], {'_id': newItem._id})) {
//                 sConfiguration.addRequirementToBucket(bucket._id, newItem._id).then( function() {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };

//     // add the new requirements to the stream milestones.
//     configStream.requirementsToMilestone = function(newItems, originalItems, milestone) {
//         var i = newItems.length;
//         _.each( newItems, function(newItem) {
//             console.log('mile', milestone);
//             i--;
//             if ( !_.some(configStream.tree.requirementsByMilestone[milestone._id], {'_id': newItem._id})) {
//                 sConfiguration.addRequirementToMilestone(milestone._id, newItem._id).then( function() {
//                     if (i === 0) reloadStream();
//                 });
//             }
//         });
//     };

// }
