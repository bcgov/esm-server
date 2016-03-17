// 'use strict';

// angular.module ('orgs')

// // -------------------------------------------------------------------------
// //
// // controller for listing orgs
// //
// // -------------------------------------------------------------------------
// .controller ('controllerOrgList',
// 	['$scope', '$rootScope', '$stateParams', 'OrgModel', 'NgTableParams', 'PILLARS',
// 	function ($scope, $rootScope, $stateParams, OrgModel, NgTableParams, PILLARS) {

// 	console.log ('controllerOrgList is running');

// 	var self = this;

// 	//
// 	// map out any supporting data
// 	//
// 	self.pillars = PILLARS.map (function (e) {
// 		return {id:e,title:e};
// 	});
// 	self.project = $stateParams.project;

// 	//
// 	// set or reset the collection
// 	//
// 	var setData = function () {
// 		OrgModel.forProject ($stateParams.project).then (function (data) {
// 			console.log ('controllerOrgList data received: ', data);
// 			self.collection = data;
// 			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
// 		});
// 	};

// 	//
// 	// listen for when to reset
// 	//
// 	var unbind = $rootScope.$on('refreshOrgList', function() {
// 		setData();
// 	});
// 	$scope.$on('$destroy', unbind);

// 	//
// 	// finally, set the data
// 	//
// 	setData();
// }])


// // -------------------------------------------------------------------------
// //
// // controller for editing or adding orgs
// //
// // -------------------------------------------------------------------------
// .controller ('controllerEditOrgModal',
// 	['$modalInstance', '$scope', '_', 'codeFromTitle', 'OrgModel', 'TopicModel', 'PILLARS',
// 	function ($modalInstance, $scope, _, codeFromTitle, OrgModel, TopicModel, PILLARS) {

// 	console.log ('controllerEditOrgModal is running');

// 	var self = this;

// 	//
// 	// pull the mode and other info from the scope inputs
// 	//
// 	this.mode = $scope.mode;

// 	//
// 	// set up any data from services that needs massaging
// 	//
// 	this.pillars = PILLARS;

// 	// -------------------------------------------------------------------------
// 	//
// 	// set up handlers and functions on scope
// 	//
// 	// -------------------------------------------------------------------------
// 	this.selectTopic = function () {
// 		var self = this;
// 		TopicModel.getTopicsForPillar (this.org.pillar).then (function (topics) {
// 			self.topics = topics;
// 			$scope.$apply();
// 		});
// 	};
// 	this.ok = function () {
// 		console.log ('save clicked');
// 		this.org.code = codeFromTitle (this.org.name);
// 		console.log ('new code = ', this.org.code);
// 		if (this.mode === 'add') {
// 			OrgModel.saveModel ().then (function (result) {
// 				$modalInstance.close(result);
// 			});
// 		}
// 		else if (this.mode === 'edit') {
// 			OrgModel.saveModel ().then (function (result) {
// 				$scope.org = _.cloneDeep (result);
// 				$modalInstance.close(result);
// 			});
// 		}
// 		else {
// 			$modalInstance.dismiss ('cancel');
// 		}
// 	};
// 	this.cancel = function () {
// 		console.log ('cancel clicked');
// 		$modalInstance.dismiss('cancel');
// 	};

// 	//
// 	// finally, deal with the mode and setting data up for each one
// 	// and kick off the directive
// 	//
// 	if (this.mode === 'add') {
// 		this.dmode = 'Add';
// 		OrgModel.getNew ().then (function (model) {
// 			self.org = model;
// 			self.selectTopic ();
// 		});
// 	} else if (this.mode === 'edit') {
// 		this.dmode = 'Edit';
// 		this.org = OrgModel.getCopy ($scope.org);
// 		OrgModel.setModel (this.org);
// 		this.selectTopic ();
// 	} else {
// 		this.dmode = 'View';
// 		this.org = $scope.org;
// 		this.selectTopic ();
// 	}
// }])

// ;

