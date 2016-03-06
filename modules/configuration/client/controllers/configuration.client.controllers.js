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
controllerConfiguration.$inject = ['$rootScope', '$scope', 'TaskBaseModel', 'ActivityBaseModel', 'MilestoneBaseModel', 'PhaseBaseModel', 'StreamModel', 'TopicModel'];
/* @ngInject */
function controllerConfiguration($rootScope, $scope, sTaskBaseModel, sActivityBaseModel, sMilestoneBaseModel, sPhaseBaseModel, sStreamModel, sTopicModel) {
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
            configData.config.streams = data;
        }).catch( function(err) {
            $scope.error = err;
        });

        sTopicModel.getCollection().then( function(data) {
            configData.config.topics = data;
        }).catch( function(err) {
            $scope.error = err;
        });

    };

    configData.refresh();

    var unbind = $rootScope.$on('refreshConfig', function() {
        configData.refresh();
    });
	$scope.$on('$destroy', unbind);
}


// -----------------------------------------------------------------------------------
//
// Config any element for user in the lookups
//
// -----------------------------------------------------------------------------------
controllerConfigManageElement.$inject = ['$scope', 'ProcessCodes', '$filter', '_', 'TaskBaseModel', 'ActivityBaseModel', 'MilestoneBaseModel', 'PhaseBaseModel', 'StreamModel', 'TopicModel'];

/* @ngInject */
function controllerConfigManageElement($scope, ProcessCodes, $filter, _, sTaskBaseModel, sActivityBaseModel, sMilestoneBaseModel, sPhaseBaseModel, sStreamModel, sTopicModel) {
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
        configDataElement.msg = '';
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
            case 'topic':
                sTopicModel.getNew().then( function(data) {
                    configDataElement.activeRecord = data;
                    $scope.$apply();
                });
                break;
        }
        configDataElement.activeRecordNew = true;
    };

    // ----- Edit a new record -----
    configDataElement.editRecord = function(selectedRecord) {
        configDataElement.msg = '';
        configDataElement.activeRecordNew = false;


        switch(configDataElement.context) {
            case 'stream':
                sStreamModel.setModel(selectedRecord);
                configDataElement.activeRecord = sStreamModel.getCopy();
                break;
            case 'phase':
                sPhaseBaseModel.setModel(selectedRecord);
                configDataElement.activeRecord = sPhaseBaseModel.getCopy();
                break;
            case 'milestone':
                sMilestoneBaseModel.setModel(selectedRecord);
                configDataElement.activeRecord = sMilestoneBaseModel.getCopy();
                break;
            case 'activity':
                sActivityBaseModel.setModel(selectedRecord);
                configDataElement.activeRecord = sActivityBaseModel.getCopy();
                break;
            case 'task':
                sTaskBaseModel.setModel(selectedRecord);
                configDataElement.activeRecord = sTaskBaseModel.getCopy();
                break;
            case 'topic':
                sTopicModel.setModel(selectedRecord);
                configDataElement.activeRecord = sTopicModel.getCopy();
                break;
        }
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
                sStreamModel.saveCopy(configDataElement.activeRecord).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'phase':
                sPhaseBaseModel.saveCopy(configDataElement.activeRecord).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'milestone':
                sMilestoneBaseModel.saveCopy(configDataElement.activeRecord).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'activity':
                sActivityBaseModel.saveCopy(configDataElement.activeRecord).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'task':
                sTaskBaseModel.saveCopy(configDataElement.activeRecord).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'topic':
                sTopicModel.saveCopy(configDataElement.activeRecord).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
        }
        configDataElement.msg = 'Record Saved';
        configDataElement.activeRecord = undefined;
    };


    // ----- Save existing record -----
    configDataElement.deleteRecord = function() {

        switch(configDataElement.context) {
            case 'stream':
                sStreamModel.delete(configDataElement.activeRecord._id).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'phase':
                sPhaseBaseModel.delete(configDataElement.activeRecord._id).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'milestone':
                sMilestoneBaseModel.delete(configDataElement.activeRecord._id).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'activity':
                sActivityBaseModel.delete(configDataElement.activeRecord._id).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'task':
                sTaskBaseModel.delete(configDataElement.activeRecord._id).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
            case 'topic':
                sTopicModel.delete(configDataElement.activeRecord._id).then( function(data) {
                    $scope.$emit('refreshConfig');
                }).catch( function(err) {
                    $scope.error = err;
                });
                break;
        }
        configDataElement.msg = 'Record Deleted';
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

