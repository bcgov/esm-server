'use strict';

angular.module ('projectconditions')

// -------------------------------------------------------------------------
//
// controller for listing projectconditions
//
// -------------------------------------------------------------------------
.controller ('controllerProjectConditionList',
	['$scope','$rootScope','$stateParams','ProjectConditionModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,ProjectConditionModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

	console.log ('yes, I am running');
	var self = this;

	self.ptypes = PROJECT_TYPES.map (function (e) {
		return {id:e,title:e};
	});
	self.stypes = CE_STAGES.map (function (e) {
		return {id:e,title:e};
	});
	self.pillars = PILLARS.map (function (e) {
		return {id:e,title:e};
	});

	var setData = function () {
		ProjectConditionModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	var unbind = $rootScope.$on('refreshProjectConditionList', function() {
		setData();
	});
	$scope.$on('$destroy', unbind);

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding projectconditions
//
// -------------------------------------------------------------------------
.controller ('controllerEditProjectConditionModal',
	['$modalInstance','$scope','_','codeFromTitle','ProjectConditionModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,ProjectConditionModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.projectcondition);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.projectcondition;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.projectcondition.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

	if (this.mode === 'add') {
		this.dmode = 'Add';
		ProjectConditionModel.getNew ().then (function (model) {
			self.projectcondition = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.projectcondition = ProjectConditionModel.getCopy ($scope.projectcondition);
		ProjectConditionModel.setModel (this.projectcondition);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.projectcondition = $scope.projectcondition;
		this.selectTopic ();
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




	this.ok = function () {
		console.log ('save clicked');
		this.projectcondition.code = codeFromTitle (this.projectcondition.name);
		console.log ('new code = ', this.projectcondition.code);
		if (this.mode === 'add') {
			ProjectConditionModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			ProjectConditionModel.saveModel ().then (function (result) {
				$scope.projectcondition = _.cloneDeep (result);
				$modalInstance.close(result);
			});
		}
		else {
			$modalInstance.dismiss ('cancel');
		}
	};
	this.cancel = function () {
		console.log ('cancel clicked');
		$modalInstance.dismiss('cancel');
	};


}])

;

