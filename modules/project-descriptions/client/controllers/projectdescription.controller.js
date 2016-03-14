'use strict';

angular.module ('projectdescriptions')

// -------------------------------------------------------------------------
//
// controller for listing projectdescriptions
//
// -------------------------------------------------------------------------
.controller ('controllerProjectDescriptionList',
	['$scope','$rootScope','$stateParams','ProjectDescriptionModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,ProjectDescriptionModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

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
		ProjectDescriptionModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	var unbind = $rootScope.$on('refreshProjectDescriptionList', function() {
		setData();
	});
	$scope.$on('$destroy', unbind);

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding projectdescriptions
//
// -------------------------------------------------------------------------
.controller ('controllerEditProjectDescriptionModal',
	['$modalInstance','$scope','_','codeFromTitle','ProjectDescriptionModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,ProjectDescriptionModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.projectdescription);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.projectdescription;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.projectdescription.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

	if (this.mode === 'add') {
		this.dmode = 'Add';
		ProjectDescriptionModel.getNew ().then (function (model) {
			self.projectdescription = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.projectdescription = ProjectDescriptionModel.getCopy ($scope.projectdescription);
		ProjectDescriptionModel.setModel (this.projectdescription);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.projectdescription = $scope.projectdescription;
		this.selectTopic ();
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




	this.ok = function () {
		console.log ('save clicked');
		this.projectdescription.code = codeFromTitle (this.projectdescription.name);
		console.log ('new code = ', this.projectdescription.code);
		if (this.mode === 'add') {
			ProjectDescriptionModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			ProjectDescriptionModel.saveModel ().then (function (result) {
				$scope.projectdescription = _.cloneDeep (result);
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

