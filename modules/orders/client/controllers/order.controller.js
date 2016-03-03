'use strict';

angular.module ('orders')

// -------------------------------------------------------------------------
//
// controller for listing orders
//
// -------------------------------------------------------------------------
.controller ('controllerOrderList',
	['$scope','$rootScope','$stateParams','OrderModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,OrderModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

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
		OrderModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	$rootScope.$on('refreshOrderList', function() {
		setData();
	});

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding orders
//
// -------------------------------------------------------------------------
.controller ('controllerEditOrderModal',
	['$modalInstance','$scope','_','codeFromTitle','OrderModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,OrderModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.order);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.order;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.order.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

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

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




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


}])

;

