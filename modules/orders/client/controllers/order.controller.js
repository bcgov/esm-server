'use strict';

angular.module ('orders')

// -------------------------------------------------------------------------
//
// controller for listing orders
//
// -------------------------------------------------------------------------
.controller ('controllerOrderList',
	['$scope', '$rootScope', '$stateParams', 'OrderModel', 'NgTableParams', 'PILLARS',
	function ($scope, $rootScope, $stateParams, OrderModel, NgTableParams, PILLARS) {

	console.log ('controllerOrderList is running');

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
		OrderModel.forProject ($stateParams.project).then (function (data) {
			console.log ('controllerOrderList data received: ', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
		});
	};

	//
	// listen for when to reset
	//
	$rootScope.$on('refreshOrderList', function() {
		setData();
	});

	//
	// finally, set the data
	//
	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding orders
//
// -------------------------------------------------------------------------
.controller ('controllerEditOrderModal',
	['$modalInstance', '$scope', '_', 'codeFromTitle', 'OrderModel', 'TopicModel', 'PILLARS',
	function ($modalInstance, $scope, _, codeFromTitle, OrderModel, TopicModel, PILLARS) {

	console.log ('controllerEditOrderModal is running');

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
		TopicModel.getTopicsForPillar (this.order.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};
	this.ok = function () {
		console.log ('save clicked');
		this.order.code = codeFromTitle (this.order.name);
		console.log ('new code = ', this.order.code);
		if (this.mode === 'add') {
			OrderModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			OrderModel.saveModel ().then (function (result) {
				$scope.order = _.cloneDeep (result);
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
		OrderModel.getNew ().then (function (model) {
			self.order = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.order = OrderModel.getCopy ($scope.order);
		OrderModel.setModel (this.order);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.order = $scope.order;
		this.selectTopic ();
	}
}])

;

