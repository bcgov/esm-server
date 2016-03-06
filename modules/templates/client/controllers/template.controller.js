'use strict';

angular.module ('templates')

// -------------------------------------------------------------------------
//
// controller for listing templates
//
// -------------------------------------------------------------------------
.controller ('controllerTemplateList',
	['$scope', '$rootScope', '$stateParams', 'TemplateModel', 'NgTableParams', 'PILLARS',
	function ($scope, $rootScope, $stateParams, TemplateModel, NgTableParams, PILLARS) {

	console.log ('controllerTemplateList is running');

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
		TemplateModel.getCollection ($stateParams.project).then (function (data) {
			console.log ('controllerTemplateList data received: ', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({count: 10}, {dataset: data});
		});
	};

	//
	// listen for when to reset
	//
	$rootScope.$on('refreshTemplateList', function() {
		setData();
	});

	//
	// finally, set the data
	//
	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding templates
//
// -------------------------------------------------------------------------
.controller ('controllerEditTemplateModal',
	['$modalInstance', '$scope', '_', 'codeFromTitle', 'TemplateModel', 'TopicModel', 'PILLARS',
	function ($modalInstance, $scope, _, codeFromTitle, TemplateModel, TopicModel, PILLARS) {

	console.log ('controllerEditTemplateModal is running');

	var self = this;

	//
	// pull the mode and other info from the scope inputs
	//
	this.mode = $scope.mode;
	this.newversion = false;


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
		TopicModel.getTopicsForPillar (this.template.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};
	this.ok = function () {
		console.log ('save clicked');
		this.template.code = codeFromTitle (this.template.name);
		console.log ('new code = ', this.template.code);
		if (this.mode === 'add') {
			TemplateModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			if (this.newversion) {
				TemplateModel.getNew ().then (function (model) {
					self.template._id = model._id;
					self.template.versionNumber++;
					return TemplateModel.add (self.template);
				}).then (function (result) {
					$modalInstance.close (result);
				}).catch (function (err) {
					console.error (err);
					$modalInstance.dismiss ('error');
				});
			} else {
				TemplateModel.saveModel ().then (function (result) {
					$scope.template = _.cloneDeep (result);
					$modalInstance.close (result);
				});
			}
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
		TemplateModel.getNew ().then (function (model) {
			self.template = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.template = TemplateModel.getCopy ($scope.template);
		TemplateModel.setModel (this.template);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.template = $scope.template;
		this.selectTopic ();
	}
}])

;

