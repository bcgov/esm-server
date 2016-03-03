'use strict';

angular.module ('descriptions')

// -------------------------------------------------------------------------
//
// controller for listing descriptions
//
// -------------------------------------------------------------------------
.controller ('controllerDescriptionList',
	['$scope','$rootScope','$stateParams','DescriptionModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,DescriptionModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

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
		DescriptionModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	$rootScope.$on('refreshDescriptionList', function() {
		setData();
	});

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding descriptions
//
// -------------------------------------------------------------------------
.controller ('controllerEditDescriptionModal',
	['$modalInstance','$scope','_','codeFromTitle','DescriptionModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,DescriptionModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.description);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.description;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.description.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

	if (this.mode === 'add') {
		this.dmode = 'Add';
		DescriptionModel.getNew ().then (function (model) {
			self.description = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.description = DescriptionModel.getCopy ($scope.description);
		DescriptionModel.setModel (this.description);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.description = $scope.description;
		this.selectTopic ();
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




	this.ok = function () {
		console.log ('save clicked');
		this.description.code = codeFromTitle (this.description.name);
		console.log ('new code = ', this.description.code);
		if (this.mode === 'add') {
			DescriptionModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			DescriptionModel.saveModel ().then (function (result) {
				$scope.description = _.cloneDeep (result);
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

