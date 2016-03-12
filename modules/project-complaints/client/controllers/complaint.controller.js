'use strict';

angular.module ('complaints')

// -------------------------------------------------------------------------
//
// controller for listing complaints
//
// -------------------------------------------------------------------------
.controller ('controllerComplaintList',
	['$scope', '$rootScope', '$stateParams', 'ComplaintModel', 'NgTableParams', 'PILLARS',
	function ($scope, $rootScope, $stateParams, ComplaintModel, NgTableParams, PILLARS) {

	console.log ('controllerComplaintList is running');

	var self = this;

	//
	// map out any supporting data
	//
	self.pillars = PILLARS.map (function (e) {
		return {id:e,title:e};
	});
	self.project = $stateParams.project;

	//
	// set or reset the collection
	//
	var setData = function () {
		ComplaintModel.forProject ($stateParams.project).then (function (data) {
			console.log ('controllerComplaintList data received: ', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
		});
	};

	//
	// listen for when to reset
	//
	var unbind = $rootScope.$on('refreshComplaintList', function() {
		setData();
	});
		$scope.$on('$destroy', unbind);

	//
	// finally, set the data
	//
	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding complaints
//
// -------------------------------------------------------------------------
.controller ('controllerEditComplaintModal',
	['$modalInstance', '$scope', '_', 'codeFromTitle', 'ComplaintModel', 'TopicModel', 'PILLARS',
	function ($modalInstance, $scope, _, codeFromTitle, ComplaintModel, TopicModel, PILLARS) {

	console.log ('controllerEditComplaintModal is running');

	var self = this;

	//
	// pull the mode and other info from the scope inputs
	//
	this.mode = $scope.mode;

	//
	// set up any data from services that needs massaging
	//
	this.pillars = PILLARS;

	// -------------------------------------------------------------------------
	//
	// set up handlers and functions on scope
	//
	// -------------------------------------------------------------------------
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.complaint.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};
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

	//
	// finally, deal with the mode and setting data up for each one
	// and kick off the directive
	//
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
}])

;

