'use strict';

angular.module ('descriptions')

// -------------------------------------------------------------------------
//
// controller for listing descriptions
//
// -------------------------------------------------------------------------
.controller ('controllerDescriptionList',
	['$scope', '$rootScope', '$stateParams', 'DescriptionModel', 'NgTableParams', 'PILLARS',
	function ($scope, $rootScope, $stateParams, DescriptionModel, NgTableParams, PILLARS) {

	console.log ('controllerDescriptionList is running');

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
		DescriptionModel.forProject ($stateParams.project).then (function (data) {
			console.log ('controllerDescriptionList data received: ', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
		});
	};

	//
	// listen for when to reset
	//
	var unbind = $rootScope.$on('refreshDescriptionList', function() {
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
// controller for editing or adding descriptions
//
// -------------------------------------------------------------------------
.controller ('controllerEditDescriptionModal',
	['$modalInstance', '$scope', '_', 'codeFromTitle', 'DescriptionModel', 'TopicModel', 'PILLARS',
	function ($modalInstance, $scope, _, codeFromTitle, DescriptionModel, TopicModel, PILLARS) {

	console.log ('controllerEditDescriptionModal is running');

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
		TopicModel.getTopicsForPillar (this.description.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};
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

	//
	// finally, deal with the mode and setting data up for each one
	// and kick off the directive
	//
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
}])

;

