'use strict';

angular.module ('conditions')

// -------------------------------------------------------------------------
//
// controller for listing conditions
//
// -------------------------------------------------------------------------
.controller ('controllerConditionList',
	['$scope','$rootScope','$stateParams','ConditionModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,ConditionModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

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
		ConditionModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	$rootScope.$on('refreshConditionList', function() {
		setData();
	});

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding conditions
//
// -------------------------------------------------------------------------
.controller ('controllerEditConditionModal',
	['$modalInstance','$scope','_','codeFromTitle','ConditionModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,ConditionModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.condition);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.condition;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.condition.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

	if (this.mode === 'add') {
		this.dmode = 'Add';
		ConditionModel.getNew ().then (function (model) {
			self.condition = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.condition = ConditionModel.getCopy ($scope.condition);
		ConditionModel.setModel (this.condition);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.condition = $scope.condition;
		this.selectTopic ();
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




	this.ok = function () {
		console.log ('save clicked');
		this.condition.code = codeFromTitle (this.condition.name);
		console.log ('new code = ', this.condition.code);
		if (this.mode === 'add') {
			ConditionModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			ConditionModel.saveModel ().then (function (result) {
				$scope.condition = _.cloneDeep (result);
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

