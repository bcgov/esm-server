'use strict';

angular.module ('irs')

// -------------------------------------------------------------------------
//
// controller for listing irs
//
// -------------------------------------------------------------------------
.controller ('controllerIrList',
	['$scope', '$rootScope', '$stateParams', 'IrModel', 'NgTableParams', 'PILLARS',
	function ($scope, $rootScope, $stateParams, IrModel, NgTableParams, PILLARS) {

	// console.log ('controllerIrList is running');

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
		IrModel.forProject ($stateParams.project).then (function (data) {
			// console.log ('controllerIrList data received: ', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
		});
	};

	//
	// listen for when to reset
	//
	var unbind = $rootScope.$on('refreshIrList', function() {
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
// controller for editing or adding irs
//
// -------------------------------------------------------------------------
.controller ('controllerEditIrModal',
	['$modalInstance', '$scope', '_', 'codeFromTitle', 'IrModel', 'TopicModel', 'PILLARS',
	function ($modalInstance, $scope, _, codeFromTitle, IrModel, TopicModel, PILLARS) {

	// console.log ('controllerEditIrModal is running');

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
		TopicModel.getTopicsForPillar (this.ir.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};
	this.ok = function () {
		// console.log ('save clicked');
		this.ir.code = codeFromTitle (this.ir.name);
		// console.log ('new code = ', this.ir.code);
		if (this.mode === 'add') {
			IrModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			IrModel.saveModel ().then (function (result) {
				$scope.ir = _.cloneDeep (result);
				$modalInstance.close(result);
			});
		}
		else {
			$modalInstance.dismiss ('cancel');
		}
	};
	this.cancel = function () {
		// console.log ('cancel clicked');
		$modalInstance.dismiss('cancel');
	};

	//
	// finally, deal with the mode and setting data up for each one
	// and kick off the directive
	//
	if (this.mode === 'add') {
		this.dmode = 'Add';
		IrModel.getNew ().then (function (model) {
			self.ir = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.ir = IrModel.getCopy ($scope.ir);
		IrModel.setModel (this.ir);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.ir = $scope.ir;
		this.selectTopic ();
	}
}])
.controller ('controllerAddArtifactModal',
	['NgTableParams','$modalInstance', '$scope', '_', '$stateParams', 'codeFromTitle', 'ArtifactModel',
	function (NgTableParams, $modalInstance, $scope, _, $stateParams, codeFromTitle, ArtifactModel) {

		var self = this;
		self.current = [];
		self.currentObjs = [];
		self.project = $scope.project;

		_.each($scope.ir.conditionArtifacts, function (ci) {
			self.current.push(ci._id);
			ci.isChecked = true;
			self.currentObjs.push(ci);
		});

		self.showFilter = true;

		// Show all VC types, either pathway or valued components
		ArtifactModel.forProject(self.project._id)
		.then( function (data) {
			// Remove any items that are inspection-reports.  They won't be added this way.
			_.remove(data, function (item) {
				return item.typeCode === 'inspection-report';
			});
			_.each(data, function (item) {
				var idx = self.current.indexOf(item._id);
				if (idx !== -1) {
					item.isChecked = true;
				}
			});

			self.tableParams = new NgTableParams ({},{dataset: data});
			$scope.$apply();
		});

		this.toggleItem = function (item) {
			// console.log("item:",item);
			var idx = self.current.indexOf(item._id);
			// console.log(idx);
			if (idx === -1) {
				self.currentObjs.push(item);
				self.current.push(item._id);
			} else {
				_.remove(self.currentObjs, {_id: item._id});
				_.remove(self.current, function(n) {return n === item._id;});
			}
		};

		this.ok = function () {
			// console.log("data:",self.currentObjs[0]);
			var savedArray = [];
			// console.log("length: ",self.currentObjs.length);
			$scope.ir.conditionArtifacts = [];
			_.each( self.currentObjs, function(obj, idx) {
				console.log("Adding " + obj.name + " to Inspection Report");
				//console.log("scope.ir:", $scope.ir);
				$scope.ir.conditionArtifacts.push(obj);
			});
			$modalInstance.close($scope.ir.conditionArtifacts);
		};

		this.cancel = function () {
			// console.log ('cancel clicked');
			$modalInstance.dismiss('cancel');
		};
}])
.controller ('controllerAddEditEnforcementActionModal',
	['NgTableParams','$modalInstance', '$scope', '_', '$stateParams', 'codeFromTitle', 'ArtifactModel', 'EnforcementModel','current',
	function (NgTableParams, $modalInstance, $scope, _, $stateParams, codeFromTitle, ArtifactModel, EnforcementModel, current) {

		var self = this;
		self.ir = $scope.ir;
		self.project = $scope.project;

		$scope.$watch('current', function () {
			// console.log("current:", current);
			$scope.selected = current;
		});

		this.ok = function () {
			$modalInstance.close($scope.selected);
		};

		this.cancel = function () {
			// console.log ('cancel clicked');
			$modalInstance.dismiss('cancel');
		};
}])
;

