'use strict';

angular.module ('contacts')

// -------------------------------------------------------------------------
//
// controller for listing contacts
//
// -------------------------------------------------------------------------
.controller ('controllerContactList',
	['$scope', '$rootScope', '$stateParams', 'ContactModel', 'NgTableParams', 'PILLARS',
	function ($scope, $rootScope, $stateParams, ContactModel, NgTableParams, PILLARS) {

	console.log ('controllerContactList is running');

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
		ContactModel.forProject ($stateParams.project).then (function (data) {
			console.log ('controllerContactList data received: ', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
		});
	};

	//
	// listen for when to reset
	//
	$rootScope.$on('refreshContactList', function() {
		setData();
	});

	//
	// finally, set the data
	//
	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding contacts
//
// -------------------------------------------------------------------------
.controller ('controllerEditContactModal',
	['$modalInstance', '$scope', '_', 'codeFromTitle', 'ContactModel', 'TopicModel', 'PILLARS',
	function ($modalInstance, $scope, _, codeFromTitle, ContactModel, TopicModel, PILLARS) {

	console.log ('controllerEditContactModal is running');

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
		TopicModel.getTopicsForPillar (this.contact.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};
	this.ok = function () {
		console.log ('save clicked');
		this.contact.code = codeFromTitle (this.contact.name);
		console.log ('new code = ', this.contact.code);
		if (this.mode === 'add') {
			ContactModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			ContactModel.saveModel ().then (function (result) {
				$scope.contact = _.cloneDeep (result);
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
		ContactModel.getNew ().then (function (model) {
			self.contact = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.contact = ContactModel.getCopy ($scope.contact);
		ContactModel.setModel (this.contact);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.contact = $scope.contact;
		this.selectTopic ();
	}
}])

;

