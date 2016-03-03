'use strict';

angular.module ('vcs')

// -------------------------------------------------------------------------
//
// controller for listing vcs
//
// -------------------------------------------------------------------------
.controller ('controllerVcList',
	['$scope','$rootScope','$stateParams','VcModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$rootScope,$stateParams,VcModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

	console.log ('yes, I am running');
	var self = this;

	var ptypes = PROJECT_TYPES.map (function (e) {
		return {id:e,title:e};
	});
	var stypes = CE_STAGES.map (function (e) {
		return {id:e,title:e};
	});
	var pillars = PILLARS.map (function (e) {
		return {id:e,title:e};
	});
	self.cols = [
		{ field:'name'               , title:'Title'       , filter:{name:'text'}              , sortable:'name'              , show:true },
		{ field:'type'               , title:'Type'        , filter:{type:'text'}              , sortable:'type'              , show:true },
		{ data:ptypes, field:'sector'             , title:'Sector'      , filter:{sector:'select'}            , sortable:'sector'            , show:true },
		{ data:stypes, field:'stage'       , title:'Stage'       , filter:{stage:'select'}      , sortable:'stage'      , show:true },
		{ data:pillars, field:'pillar'             , title:'Pillar'      , filter:{pillar:'select'}            , sortable:'pillar'            , show:true },
		{ }
	];

	var setData = function () {
		VcModel.getCollection ()
		.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	$rootScope.$on('refreshVcList', function() {
		setData();
	});

	setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding vcs
//
// -------------------------------------------------------------------------
.controller ('controllerEditVcModal',
	['$modalInstance','$scope','_','codeFromTitle','VcModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,VcModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.vc);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.vc;
	// var dataPromise;
	this.selectTopic = function () {
		var self = this;
		TopicModel.getTopicsForPillar (this.vc.pillar).then (function (topics) {
			self.topics = topics;
			$scope.$apply();
		});
	};

	if (this.mode === 'add') {
		this.dmode = 'Add';
		VcModel.getNew ().then (function (model) {
			self.vc = model;
			self.selectTopic ();
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.vc = VcModel.getCopy ($scope.vc);
		VcModel.setModel (this.vc);
		this.selectTopic ();
	} else {
		this.dmode = 'View';
		this.vc = $scope.vc;
		this.selectTopic ();
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);




	this.ok = function () {
		console.log ('save clicked');
		this.vc.code = codeFromTitle (this.vc.name);
		console.log ('new code = ', this.vc.code);
		if (this.mode === 'add') {
			VcModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			VcModel.saveModel ().then (function (result) {
				$scope.vc = _.cloneDeep (result);
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

