'use strict';

angular.module ('projectdocuments')

// -------------------------------------------------------------------------
//
// controller for listing projectdocuments
//
// -------------------------------------------------------------------------
.controller ('controllerProjectDocumentList',
	['$scope','$rootScope','$stateParams','ProjectDocumentModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,ProjectDocumentModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

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
		ProjectDocumentModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	$rootScope.$on('refreshProjectDocumentList', function() {
		setData();
	});

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding projectdocuments
//
// -------------------------------------------------------------------------
.controller ('controllerEditProjectDocumentModal',
	['$modalInstance','$scope','_','codeFromTitle','ProjectDocumentModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,ProjectDocumentModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.projectdocument);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.projectdocument;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.projectdocument.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

	if (this.mode === 'add') {
		this.dmode = 'Add';
		ProjectDocumentModel.getNew ().then (function (model) {
			self.projectdocument = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.projectdocument = ProjectDocumentModel.getCopy ($scope.projectdocument);
		ProjectDocumentModel.setModel (this.projectdocument);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.projectdocument = $scope.projectdocument;
		this.selectTopic ();
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




	this.ok = function () {
		console.log ('save clicked');
		this.projectdocument.code = codeFromTitle (this.projectdocument.name);
		console.log ('new code = ', this.projectdocument.code);
		if (this.mode === 'add') {
			ProjectDocumentModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			ProjectDocumentModel.saveModel ().then (function (result) {
				$scope.projectdocument = _.cloneDeep (result);
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

