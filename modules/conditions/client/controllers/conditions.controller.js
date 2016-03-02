'use strict';

angular.module ('conditions')

// -------------------------------------------------------------------------
//
// controller for listing conditions
//
// -------------------------------------------------------------------------
.controller ('controllerConditionList',
	['$scope','$stateParams','ConditionModel','NgTableParams','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($scope,$stateParams,ConditionModel,NgTableParams,PROJECT_TYPES,CE_STAGES,PILLARS) {

	console.log ('yes, I am running');
	var self = this;
	ConditionModel.getCollection ()
	.then (function (data) {
		console.log (data);
		self.collection = data;
		self.tableParams = new NgTableParams ({
			count:50,
			sorting: {name:"asc"}
		}, {dataset: data});
		//
		// if data is present and filter == select or select-multiple, it will be a drop down
		//
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
	});
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding conditions
//
// -------------------------------------------------------------------------
.controller ('controllerEditConditionModal',
	['$modalInstance','$scope','_','codeFromTitle','ConditionModel','TopicModel','PROJECT_TYPES','CE_STAGES','PILLARS',
	function ($modalInstance, $scope,_, codeFromTitle,ConditionModel,TopicModel,PROJECT_TYPES,CE_STAGES,PILLARS) {

	var self = this;

	console.log ($scope.condition);
	console.log ($scope.mode);

	this.mode = $scope.mode;
	// $scope.condition;
	// var dataPromise;

	if (this.mode === 'add') {
		this.dmode = 'Add';
		ConditionModel.getNew ().then (function (model) {
			self.condition = model;
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.condition = ConditionModel.getCopy ($scope.condition);
		ConditionModel.setModel (this.condition);
	} else {
		this.dmode = 'View';
		this.condition = $scope.condition;
	}

	this.sectors = PROJECT_TYPES;
	this.stages = CE_STAGES;
	this.pillars = PILLARS;

	console.log ('stages:', this.stages);

	this.selectTopic = function () {
		var val = this.condition.pillar;
		console.log ('selected' ,val);
	};

	this.ok = function () {
		console.log ('save clicked');
		this.condition.code = codeFromTitle (this.condition.name);
		console.log ('new code = ', this.condition.code);
		if (this.mode === 'add') {
			ConditionModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			ConditionModel.saveModel ().then (function (result) {
				$scope.condition = _.deepCopy (result);
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

