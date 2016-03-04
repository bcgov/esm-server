'use strict';

angular.module ('topics')

// -------------------------------------------------------------------------
//
// controller for listing topics
//
// -------------------------------------------------------------------------
.controller ('controllerTopicList',
	['$scope','$rootScope','$stateParams','TopicModel','NgTableParams','PILLARS',
	function ($scope,$rootScope,$stateParams,TopicModel,NgTableParams,PILLARS) {

	var self = this;

	self.ptypes = ['Valued Component', 'Pathway Component'];
	self.pillars = PILLARS.map (function (e) {
		return {id:e,title:e};
	});

	var setData = function () {
		TopicModel.getCollection ()
		.then (function (data) {
			console.log ('collection returned is:', data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:10,
			}, {dataset: data});
		});
	};

	$rootScope.$on('refreshTopicList', function() {
		setData();
	});

	this.examine = function () {
		console.log ('collection returned is:', this.collection);
	};

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding topics
//
// -------------------------------------------------------------------------
.controller ('controllerEditTopicModal',
	['$modalInstance','$scope','_','codeFromTitle','TopicModel','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,TopicModel,PILLARS) {

	var self = this;


	this.mode = $scope.mode;

	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.topic.pillar).then (function (topics) {
			console.log ('topics returned:', topics);
			self.pillartopics = topics;
			$scope.$apply();
		});
	};



	if (this.mode === 'add') {
		console.log ('modal is now adding');
		this.dmode = 'Add';
		TopicModel.getNew ().then (function (model) {
			self.topic = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		console.log ('modal is now editing');
		this.dmode = 'Edit';
		this.topic = TopicModel.getCopy ($scope.topic);
		TopicModel.setModel (this.topic);
		this.selectTopic ();
	} else {
		console.log ('modal is now viewing');
		this.dmode = 'View';
		this.topic = $scope.topic;
		this.selectTopic ();
	}

	this.pillars = PILLARS;


	this.ok = function () {
		this.topic.code = codeFromTitle (this.topic.name);
		console.log ('new code = ', this.topic.code);
		if (this.mode === 'add') {
			TopicModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			TopicModel.saveModel ().then (function (result) {
				$scope.topic = _.cloneDeep (result);
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

