'use strict';

angular.module ('projectdocuments')

// -------------------------------------------------------------------------
//
// controller for listing projectdocuments
//
// -------------------------------------------------------------------------
.controller ('controllerProjectDocumentList',
	['$scope', '$rootScope', '$stateParams', 'ProjectDocumentModel', 'NgTableParams', 'PILLARS',
	function ($scope, $rootScope, $stateParams, ProjectDocumentModel, NgTableParams, PILLARS) {

	console.log ('controllerProjectDocumentList is running');

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
		ProjectDocumentModel.forProject ($stateParams.project).then (function (data) {
			console.log ('controllerProjectDocumentList data received: ', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
		});
	};

	//
	// listen for when to reset
	//
	var unbind = $rootScope.$on('refreshProjectDocumentList', function() {
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
// controller for editing or adding projectdocuments
//
// -------------------------------------------------------------------------
.controller ('controllerEditProjectDocumentModal',
	['$modalInstance', '$scope', '_', 'codeFromTitle', 'ProjectDocumentModel', 'TopicModel', 'PILLARS',
	function ($modalInstance, $scope, _, codeFromTitle, ProjectDocumentModel, TopicModel, PILLARS) {

	console.log ('controllerEditProjectDocumentModal is running');

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
		TopicModel.getTopicsForPillar (this.projectdocument.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};
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

	//
	// finally, deal with the mode and setting data up for each one
	// and kick off the directive
	//
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
}])

;

