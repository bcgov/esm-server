'use strict';

angular.module ('complaints')

// -------------------------------------------------------------------------
//
// controller for listing complaints
//
// -------------------------------------------------------------------------
.controller ('controllerComplaintList',
	['$scope','$rootScope','$stateParams','ComplaintModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,ComplaintModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

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
		ComplaintModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	$rootScope.$on('refreshComplaintList', function() {
		setData();
	});

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding complaints
//
// -------------------------------------------------------------------------
.controller ('controllerEditComplaintModal',
	['$modalInstance','$scope','_','codeFromTitle','ComplaintModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,ComplaintModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.complaint);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.complaint;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.complaint.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

	if (this.mode === 'add') {
		this.dmode = 'Add';
		ComplaintModel.getNew ().then (function (model) {
			self.complaint = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.complaint = ComplaintModel.getCopy ($scope.complaint);
		ComplaintModel.setModel (this.complaint);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.complaint = $scope.complaint;
		this.selectTopic ();
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




	this.ok = function () {
		console.log ('save clicked');
		this.complaint.code = codeFromTitle (this.complaint.name);
		console.log ('new code = ', this.complaint.code);
		if (this.mode === 'add') {
			ComplaintModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			ComplaintModel.saveModel ().then (function (result) {
				$scope.complaint = _.cloneDeep (result);
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

